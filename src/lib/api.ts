// src/lib/api.ts
import { User, Client, Project, TimeEntry, ApiError, AdminStats } from "../types";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(res.status, err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  auth: {
    me: () => request<User | null>("/api/auth/me"),
    login: (body: any) => request<User>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body: any) => request<User>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
    logout: () => request<{ success: true }>("/api/auth/logout", { method: "POST" }),
  },
  clients: {
    list: () => request<Client[]>("/api/clients"),
    create: (name: string) => request<Client>("/api/clients", { method: "POST", body: JSON.stringify({ name }) }),
  },
  projects: {
    list: () => request<Project[]>("/api/projects"),
    create: (body: any) => request<Project>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
  },
  timeEntries: {
    list: () => request<TimeEntry[]>("/api/time-entries"),
    create: (body: any) => request<TimeEntry>("/api/time-entries", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<TimeEntry>(`/api/time-entries/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: true }>(`/api/time-entries/${id}`, { method: "DELETE" }),
  },
  ai: {
    insights: (entries: TimeEntry[]) => request<{ insights: string }>("/api/ai/insights", { method: "POST", body: JSON.stringify({ entries }) }),
  },
  admin: {
    stats: () => request<AdminStats>("/api/admin/stats"),
    users: () => request<User[]>("/api/admin/users"),
    updateTenant: (id: string, data: { plan?: string; status?: string }) => 
      request<User>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  }
};
