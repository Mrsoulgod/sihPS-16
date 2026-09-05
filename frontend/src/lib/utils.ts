import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses any number, numeric string, null, or undefined into a valid JavaScript number.
 * Returns fallback (default 0) if value is null, undefined, empty, or NaN.
 */
export function parseNumeric(val: number | string | null | undefined, fallback = 0): number {
  if (val === null || val === undefined || val === "") return fallback;
  const n = typeof val === "number" ? val : Number(val);
  return isNaN(n) ? fallback : n;
}

/**
 * Formats an amount as Indian Rupee (INR) currency.
 * Safely accepts number, numeric string, undefined, or null.
 */
export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "₹0";
  const n = typeof amount === "number" ? amount : Number(amount);
  if (isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Formats an amount in Crores (Cr) with 2 decimal places.
 * Safely accepts number, numeric string, undefined, or null.
 */
export function formatCrores(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "₹0.00 Cr";
  const n = typeof amount === "number" ? amount : Number(amount);
  if (isNaN(n)) return "₹0.00 Cr";
  const cr = n / 10000000;
  return `₹${cr.toFixed(2)} Cr`;
}

/**
 * Formats a generic numeric value with fixed decimals.
 * Safely accepts number, numeric string, undefined, or null.
 */
export function formatNumber(val: number | string | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || val === "") return "0.00";
  const n = typeof val === "number" ? val : Number(val);
  return isNaN(n) ? "0.00" : n.toFixed(decimals);
}

/**
 * Formats land area in acres (e.g. "12.50 acres").
 */
export function formatAreaAcres(val: number | string | null | undefined, decimals = 2): string {
  return `${formatNumber(val, decimals)} acres`;
}

/**
 * Formats land area in square meters with Indian number formatting (e.g. "5,058 m²").
 */
export function formatAreaSqm(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "0 m²";
  const n = typeof val === "number" ? val : Number(val);
  return isNaN(n) ? "0 m²" : `${Math.round(n).toLocaleString("en-IN")} m²`;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
