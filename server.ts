import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-12345";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Auth Middleware ---
  const authenticateToken = async (req: any, res: any, next: any) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      let user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.status(401).json({ error: "User not found" });

      // Auto-promote for dev environment convenience in middleware too
      if (user.email === "jaimecao2023@gmail.com" && user.role !== "SUPER_ADMIN") {
          user = await prisma.user.update({ where: { id: user.id }, data: { role: "SUPER_ADMIN" } });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
  };

  // --- Auth API ---
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if this is the first user, if so, make them SUPER_ADMIN
      const userCount = await prisma.user.count();
      const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, displayName: name, role }
      });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, { 
        httpOnly: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "User already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // ALSO: For development, if user email is specifically jaimecao2023@gmail.com, ensure they are SUPER_ADMIN if needed
      if (email === "jaimecao2023@gmail.com" && user.role !== "SUPER_ADMIN") {
          await prisma.user.update({ where: { id: user.id }, data: { role: "SUPER_ADMIN" } });
          user.role = "SUPER_ADMIN";
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, { 
        httpOnly: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.json(null);
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.json(null);
      
      // Auto-promote for dev environment convenience
      if (user.email === "jaimecao2023@gmail.com" && user.role !== "SUPER_ADMIN") {
          await prisma.user.update({ where: { id: user.id }, data: { role: "SUPER_ADMIN" } });
          user.role = "SUPER_ADMIN";
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      res.json(null);
    }
  });

  // --- Admin API ---
  app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
    try {
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      const entryCount = await prisma.timeEntry.count();
      
      // Real calculation for total hours
      const totalHoursResult = await prisma.timeEntry.aggregate({
        _sum: { duration: true }
      });
      const totalHours = Math.round((totalHoursResult._sum.duration || 0) / 3600);

      // Active tenants = users who have logged time in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeTenantsCount = await prisma.user.count({
        where: {
          timeEntries: {
            some: {
              createdAt: { gte: sevenDaysAgo }
            }
          }
        }
      });

      // Daily new users
      const today = new Date();
      today.setHours(0,0,0,0);
      const dailyNewUsers = await prisma.user.count({
        where: { createdAt: { gte: today } }
      });

      res.json({
        users: userCount,
        activeTenants: activeTenantsCount,
        totalProjects: projectCount,
        totalHours,
        dailyNewUsers,
        systemStatus: "Healthy"
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          plan: true,
          status: true,
          createdAt: true,
          _count: {
            select: { clients: true, projects: true, timeEntries: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { plan, status } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { plan, status }
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token", { 
      httpOnly: true, 
      sameSite: "none", 
      secure: true 
    });
    res.json({ success: true });
  });

  // --- Data API (Clients) ---
  app.get("/api/clients", authenticateToken, async (req: any, res) => {
    const clients = await prisma.client.findMany({ where: { userId: req.user.id } });
    res.json(clients);
  });

  app.post("/api/clients", authenticateToken, async (req: any, res) => {
    const client = await prisma.client.create({
      data: { name: req.body.name, userId: req.user.id }
    });
    res.json(client);
  });

  // --- Data API (Projects) ---
  app.get("/api/projects", authenticateToken, async (req: any, res) => {
    const projects = await prisma.project.findMany({ where: { userId: req.user.id } });
    res.json(projects);
  });

  app.post("/api/projects", authenticateToken, async (req: any, res) => {
    const { name, color, clientId, budget, budgetType } = req.body;
    const project = await prisma.project.create({
      data: { 
        name, 
        color, 
        clientId,
        budget: budget ? parseFloat(budget) : null,
        budgetType: budgetType || "hours",
        userId: req.user.id 
      }
    });
    res.json(project);
  });

  // --- Data API (Time Entries) ---
  app.get("/api/time-entries", authenticateToken, async (req: any, res) => {
    const entries = await prisma.timeEntry.findMany({ 
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  });

  app.post("/api/time-entries", authenticateToken, async (req: any, res) => {
    const entry = await prisma.timeEntry.create({
      data: { 
        notes: req.body.notes,
        duration: req.body.duration || 0,
        date: req.body.date,
        isRunning: req.body.isRunning || false,
        projectId: req.body.projectId,
        userId: req.user.id,
        isBilled: false,
        startTime: req.body.isRunning ? new Date() : null
      }
    });
    res.json(entry);
  });

  app.patch("/api/time-entries/:id", authenticateToken, async (req: any, res) => {
    const entry = await prisma.timeEntry.update({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    res.json(entry);
  });

  app.delete("/api/time-entries/:id", authenticateToken, async (req: any, res) => {
    await prisma.timeEntry.delete({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true });
  });

  // --- AI Insights API ---
  app.post("/api/ai/insights", authenticateToken, async (req: any, res) => {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: "AI Key missing" });
    
    try {
      const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      const prompt = `
        As a productivity expert, analyze this user's time tracking data from today:
        ${JSON.stringify(req.body.entries)}
        
        Provide 3 concise, actionable insights or "Pulse Tips" to improve their focus and efficiency.
        Keep them professional, minimalist, and very brief (max 2 sentences per tip).
        Format: Return only the 3 tips as a bulleted list.
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;
      res.json({ insights: text });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI Insight generation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
