import express, { type CookieOptions, type NextFunction, type Request, type Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient, type User as DbUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || (!isProduction ? "dev-secret-key-12345" : "");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COOKIE_NAME = "auth_token";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const FORCE_SECURE_COOKIES = process.env.FORCE_SECURE_COOKIES === "true";
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const BOOTSTRAP_SUPER_ADMIN_EMAIL = normalizeEmail(process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL);

const secureCookies = isProduction || FORCE_SECURE_COOKIES;
const cookieSameSite: CookieOptions["sameSite"] = secureCookies ? "none" : "lax";

const USER_PLANS = new Set(["FREE", "PRO", "ENTERPRISE"]);
const USER_STATUSES = new Set(["ACTIVE", "SUSPENDED"]);
const PROJECT_BUDGET_TYPES = new Set(["hours", "money"]);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required when NODE_ENV=production");
}

type SafeUser = Omit<DbUser, "password">;

interface AuthenticatedRequest extends Request {
  user?: DbUser;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function requireNonEmptyString(value: unknown, fieldName: string, maxLength = 255): string {
  if (typeof value !== "string") {
    throw new HttpError(400, `${fieldName} is required`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  if (normalized.length > maxLength) {
    throw new HttpError(400, `${fieldName} must be ${maxLength} characters or fewer`);
  }

  return normalized;
}

function requirePassword(value: unknown): string {
  const password = requireNonEmptyString(value, "Password", 128);

  if (password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  return password;
}

function requireDateString(value: unknown, fieldName = "Date"): string {
  const date = requireNonEmptyString(value, fieldName, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, `${fieldName} must be in yyyy-MM-dd format`);
  }

  return date;
}

function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new HttpError(400, `${fieldName} must be a boolean`);
  }

  return value;
}

function requireNonNegativeInteger(value: unknown, fieldName: string): number {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative integer`);
  }

  return numericValue;
}

function parseOptionalNonNegativeNumber(value: unknown, fieldName: string): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative number`);
  }

  return numericValue;
}

function sanitizeUser(user: DbUser): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function getAuthCookieOptions(): CookieOptions {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: secureCookies,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: "/",
  };

  if (COOKIE_DOMAIN) {
    options.domain = COOKIE_DOMAIN;
  }

  return options;
}

function getClearCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...options } = getAuthCookieOptions();
  return options;
}

function handleError(res: Response, error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: fallbackMessage });
}

async function maybePromoteBootstrapAdmin(user: DbUser): Promise<DbUser> {
  if (!BOOTSTRAP_SUPER_ADMIN_EMAIL) {
    return user;
  }

  if (normalizeEmail(user.email) !== BOOTSTRAP_SUPER_ADMIN_EMAIL || user.role === "SUPER_ADMIN") {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { role: "SUPER_ADMIN" },
  });
}

async function requireOwnedClient(clientId: string, userId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
  });

  if (!client) {
    throw new HttpError(404, "Client not found");
  }

  return client;
}

async function requireOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return project;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
      const userId = typeof decoded?.userId === "string" ? decoded.userId : null;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.status !== "ACTIVE") {
        return res.status(403).json({ error: "Account suspended" });
      }

      user = await maybePromoteBootstrapAdmin(user);
      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    next();
  };

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body?.email);

      if (!email) {
        throw new HttpError(400, "Email is required");
      }

      const password = requirePassword(req.body?.password);
      const displayName = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 80) || null : null;

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        throw new HttpError(409, "User already exists");
      }

      const userCount = await prisma.user.count();
      const role = userCount === 0 || email === BOOTSTRAP_SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : "USER";
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          displayName,
          role,
        },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.cookie(COOKIE_NAME, token, getAuthCookieOptions());
      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      return handleError(res, error, "Registration failed");
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body?.email);

      if (!email) {
        throw new HttpError(400, "Email is required");
      }

      const password = requireNonEmptyString(req.body?.password, "Password", 128);
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpError(401, "Invalid credentials");
      }

      if (user.status !== "ACTIVE") {
        throw new HttpError(403, "Account suspended");
      }

      user = await maybePromoteBootstrapAdmin(user);

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.cookie(COOKIE_NAME, token, getAuthCookieOptions());
      res.json(sanitizeUser(user));
    } catch (error) {
      return handleError(res, error, "Login failed");
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.json(null);
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
      const userId = typeof decoded?.userId === "string" ? decoded.userId : null;

      if (!userId) {
        return res.json(null);
      }

      let user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.status !== "ACTIVE") {
        return res.json(null);
      }

      user = await maybePromoteBootstrapAdmin(user);
      res.json(sanitizeUser(user));
    } catch (error) {
      res.json(null);
    }
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, getClearCookieOptions());
    res.json({ success: true });
  });

  app.get("/api/admin/stats", authenticateToken, isAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();

      const totalHoursResult = await prisma.timeEntry.aggregate({
        _sum: { duration: true },
      });
      const totalHours = Math.round((totalHoursResult._sum.duration || 0) / 3600);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeTenantsCount = await prisma.user.count({
        where: {
          timeEntries: {
            some: {
              createdAt: { gte: sevenDaysAgo },
            },
          },
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyNewUsers = await prisma.user.count({
        where: { createdAt: { gte: today } },
      });

      res.json({
        users: userCount,
        activeTenants: activeTenantsCount,
        totalProjects: projectCount,
        totalHours,
        dailyNewUsers,
        systemStatus: "Healthy",
      });
    } catch (error) {
      return handleError(res, error, "Failed to fetch admin stats");
    }
  });

  app.get("/api/admin/users", authenticateToken, isAdmin, async (_req: AuthenticatedRequest, res: Response) => {
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
            select: { clients: true, projects: true, timeEntries: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(users);
    } catch (error) {
      return handleError(res, error, "Failed to fetch users");
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body ?? {};
      const data: { plan?: string; status?: string } = {};

      if ("plan" in body) {
        const plan = requireNonEmptyString(body.plan, "Plan", 32).toUpperCase();

        if (!USER_PLANS.has(plan)) {
          throw new HttpError(400, "Plan must be FREE, PRO, or ENTERPRISE");
        }

        data.plan = plan;
      }

      if ("status" in body) {
        const status = requireNonEmptyString(body.status, "Status", 32).toUpperCase();

        if (!USER_STATUSES.has(status)) {
          throw new HttpError(400, "Status must be ACTIVE or SUSPENDED");
        }

        data.status = status;
      }

      if (Object.keys(data).length === 0) {
        throw new HttpError(400, "At least one valid field must be provided");
      }

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data,
      });

      res.json(sanitizeUser(user));
    } catch (error) {
      return handleError(res, error, "Failed to update user");
    }
  });

  app.get("/api/clients", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clients = await prisma.client.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
      });

      res.json(clients);
    } catch (error) {
      return handleError(res, error, "Failed to fetch clients");
    }
  });

  app.post("/api/clients", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const name = requireNonEmptyString(req.body?.name, "Client name", 120);

      const client = await prisma.client.create({
        data: {
          name,
          userId: req.user!.id,
        },
      });

      res.status(201).json(client);
    } catch (error) {
      return handleError(res, error, "Failed to create client");
    }
  });

  app.get("/api/projects", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const projects = await prisma.project.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { timeEntries: true },
          },
        },
      });

      res.json(projects);
    } catch (error) {
      return handleError(res, error, "Failed to fetch projects");
    }
  });

  app.post("/api/projects", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const name = requireNonEmptyString(req.body?.name, "Project name", 120);
      const color = requireNonEmptyString(req.body?.color, "Project color", 32);
      const clientId = requireNonEmptyString(req.body?.clientId, "Client ID", 64);
      const budget = parseOptionalNonNegativeNumber(req.body?.budget, "Budget");
      const budgetType = req.body?.budgetType == null || req.body?.budgetType === ""
        ? "hours"
        : requireNonEmptyString(req.body?.budgetType, "Budget type", 32).toLowerCase();

      if (!PROJECT_BUDGET_TYPES.has(budgetType)) {
        throw new HttpError(400, "Budget type must be hours or money");
      }

      await requireOwnedClient(clientId, req.user!.id);

      const project = await prisma.project.create({
        data: {
          name,
          color,
          clientId,
          budget,
          budgetType,
          userId: req.user!.id,
        },
      });

      res.status(201).json(project);
    } catch (error) {
      return handleError(res, error, "Failed to create project");
    }
  });

  app.get("/api/time-entries", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const entries = await prisma.timeEntry.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
      });

      res.json(entries);
    } catch (error) {
      return handleError(res, error, "Failed to fetch time entries");
    }
  });

  app.post("/api/time-entries", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const projectId = requireNonEmptyString(req.body?.projectId, "Project ID", 64);
      const date = requireDateString(req.body?.date);
      const isRunning = req.body?.isRunning === undefined ? false : requireBoolean(req.body.isRunning, "isRunning");
      const duration = isRunning ? 0 : (req.body?.duration === undefined ? 0 : requireNonNegativeInteger(req.body.duration, "Duration"));
      const notes = req.body?.notes == null || req.body?.notes === ""
        ? null
        : requireNonEmptyString(req.body.notes, "Notes", 1000);

      await requireOwnedProject(projectId, req.user!.id);

      const entry = await prisma.timeEntry.create({
        data: {
          notes,
          duration,
          date,
          isRunning,
          projectId,
          userId: req.user!.id,
          isBilled: false,
          startTime: isRunning ? new Date() : null,
        },
      });

      res.status(201).json(entry);
    } catch (error) {
      return handleError(res, error, "Failed to create time entry");
    }
  });

  app.patch("/api/time-entries/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body ?? {};
      const existingEntry = await prisma.timeEntry.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
      });

      if (!existingEntry) {
        throw new HttpError(404, "Time entry not found");
      }

      const data: {
        notes?: string | null;
        duration?: number;
        date?: string;
        isRunning?: boolean;
        startTime?: Date | null;
        isBilled?: boolean;
        projectId?: string;
      } = {};

      if ("notes" in body) {
        data.notes = body.notes == null || body.notes === ""
          ? null
          : requireNonEmptyString(body.notes, "Notes", 1000);
      }

      if ("duration" in body) {
        data.duration = requireNonNegativeInteger(body.duration, "Duration");
      }

      if ("date" in body) {
        data.date = requireDateString(body.date);
      }

      if ("isRunning" in body) {
        const isRunning = requireBoolean(body.isRunning, "isRunning");
        data.isRunning = isRunning;

        if (isRunning && !existingEntry.isRunning) {
          data.startTime = new Date();

          if (!("duration" in body)) {
            data.duration = 0;
          }
        }

        if (!isRunning && existingEntry.isRunning) {
          data.startTime = existingEntry.startTime ?? null;
        }
      }

      if ("isBilled" in body) {
        data.isBilled = requireBoolean(body.isBilled, "isBilled");
      }

      if ("projectId" in body) {
        const projectId = requireNonEmptyString(body.projectId, "Project ID", 64);
        await requireOwnedProject(projectId, req.user!.id);
        data.projectId = projectId;
      }

      if (Object.keys(data).length === 0) {
        throw new HttpError(400, "No valid fields provided");
      }

      const entry = await prisma.timeEntry.update({
        where: { id: existingEntry.id },
        data,
      });

      res.json(entry);
    } catch (error) {
      return handleError(res, error, "Failed to update time entry");
    }
  });

  app.delete("/api/time-entries/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const existingEntry = await prisma.timeEntry.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
      });

      if (!existingEntry) {
        throw new HttpError(404, "Time entry not found");
      }

      await prisma.timeEntry.delete({
        where: { id: existingEntry.id },
      });

      res.json({ success: true });
    } catch (error) {
      return handleError(res, error, "Failed to delete time entry");
    }
  });

  app.post("/api/ai/insights", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI Key missing" });
    }

    try {
      if (!Array.isArray(req.body?.entries)) {
        throw new HttpError(400, "entries must be an array");
      }

      const entries = req.body.entries.slice(0, 50).map((entry: any) => ({
        notes: typeof entry?.notes === "string" ? entry.notes.slice(0, 200) : null,
        duration: Number.isFinite(Number(entry?.duration)) ? Number(entry.duration) : 0,
        date: typeof entry?.date === "string" ? entry.date : null,
        projectId: typeof entry?.projectId === "string" ? entry.projectId : null,
        isRunning: Boolean(entry?.isRunning),
      }));

      const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const prompt = `
        As a productivity expert, analyze this user's time tracking data from today:
        ${JSON.stringify(entries)}

        Provide 3 concise, actionable insights or "Pulse Tips" to improve their focus and efficiency.
        Keep them professional, minimalist, and very brief (max 2 sentences per tip).
        Format: Return only the 3 tips as a bulleted list.
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ insights: response.text?.trim() || "" });
    } catch (error) {
      return handleError(res, error, "AI Insight generation failed");
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer().catch(async (error) => {
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});