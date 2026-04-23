// src/types.ts

export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: string;
  plan?: string;
  status?: string;
  createdAt?: string;
}

export interface AdminStats {
  users: number;
  activeTenants: number;
  totalProjects: number;
  totalHours: number;
  dailyNewUsers: number;
  systemStatus: "Healthy" | "Degraded" | "Critical";
}

export interface Client {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  status: string;
  budget?: number | null;
  budgetType?: string;
  clientId: string;
  userId: string;
  createdAt: string;
  _count?: {
    timeEntries: number;
  };
}

export interface TimeEntry {
  id: string;
  notes?: string | null;
  duration: number;
  date: string;
  isRunning: boolean;
  startTime: string;
  isBilled: boolean;
  projectId: string;
  userId: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}
