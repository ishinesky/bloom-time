import { HttpError } from "@/src/server/http";

export const USER_PLANS = new Set(["FREE", "PRO", "ENTERPRISE"]);
export const USER_STATUSES = new Set(["ACTIVE", "SUSPENDED"]);
export const PROJECT_BUDGET_TYPES = new Set(["hours", "money"]);

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export function requireNonEmptyString(value: unknown, fieldName: string, maxLength = 255): string {
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

export function requirePassword(value: unknown): string {
  const password = requireNonEmptyString(value, "Password", 128);

  if (password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  return password;
}

export function requireBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new HttpError(400, `${fieldName} must be a boolean`);
  }

  return value;
}

export function requireDateString(value: unknown, fieldName = "Date"): string {
  const date = requireNonEmptyString(value, fieldName, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, `${fieldName} must be in yyyy-MM-dd format`);
  }

  return date;
}

export function requireNonNegativeInteger(value: unknown, fieldName: string): number {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative integer`);
  }

  return numericValue;
}

export function parseOptionalNonNegativeNumber(value: unknown, fieldName: string): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative number`);
  }

  return numericValue;
}
