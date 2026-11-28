/**
 * Pure, testable financial, timezone, receipt numbering, donor matching,
 * and CSV security helpers shared across Convex functions and unit tests.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Normalizes a Unix timestamp (seconds or milliseconds) into milliseconds.
 * Prevents confusing Razorpay Unix seconds (e.g. 1795651200) with milliseconds.
 */
export function normalizeTimestampToMs(ts?: number | null): number | undefined {
  if (typeof ts !== "number" || !Number.isFinite(ts) || ts <= 0) {
    return undefined;
  }
  return ts < 1e12 ? Math.round(ts * 1000) : Math.round(ts);
}

/**
 * Returns the initial counter baseline for a calendar year before its first
 * new WEB receipt is allocated.
 * - 2026 starts at baseline 4 (4 historical donations preserved) -> next is WEB05.
 * - 2027+ starts at baseline 0 -> first captured payment receives WEB01.
 */
export function getYearlyCounterBaseline(year: number): number {
  return year === 2026 ? 4 : 0;
}

/**
 * Returns the calendar year (e.g. 2026) in Asia/Kolkata (IST) for a given UTC timestamp.
 */
export function getIstYear(timestampMs: number = Date.now()): number {
  const istDate = new Date(timestampMs + IST_OFFSET_MS);
  return istDate.getUTCFullYear();
}

/**
 * Returns YYYY-MM-DD in Asia/Kolkata (IST) for a given UTC timestamp.
 */
export function getIstDateKey(timestampMs: number = Date.now()): string {
  const istDate = new Date(timestampMs + IST_OFFSET_MS);
  const y = istDate.getUTCFullYear();
  const m = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(istDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns UTC start and end timestamps (ms) for a given IST date string (YYYY-MM-DD).
 */
export function getIstDayBounds(istDateStr: string): { start: number; end: number } {
  const [y, m, d] = istDateStr.split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const start = utcMidnight - IST_OFFSET_MS;
  const end = start + 24 * 60 * 60 * 1000 - 1;
  return { start, end };
}

/**
 * Formats a permanent sequential website donation receipt number.
 * Format: UH-YYYY-WEB01 (minimum 2-digit zero-padding, never truncates >= 100).
 */
export function formatReceiptNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2020 || year > 2100) {
    throw new Error(`Invalid receipt year: ${year}`);
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`Invalid receipt sequence: ${sequence}`);
  }
  const paddedSeq = String(sequence).padStart(2, "0");
  return `UH-${year}-WEB${paddedSeq}`;
}

/**
 * Resolves the display receipt number for a donation record:
 * Uses the authoritative stored `receiptNumber` if present;
 * otherwise falls back to the historical deterministic format so old receipts never change.
 */
export function resolveStoredOrHistoricalReceiptNumber(donation: {
  receiptNumber?: string;
  razorpayPaymentId: string;
  createdAt: number;
}): string {
  if (donation.receiptNumber && donation.receiptNumber.trim().length > 0) {
    return donation.receiptNumber;
  }
  const rawId = (donation.razorpayPaymentId || "UH000000")
    .replace(/^pay_/, "")
    .toUpperCase();
  const year = getIstYear(donation.createdAt);
  return `UH-${year}-${rawId.slice(-6).padStart(6, "0")}`;
}

/**
 * Normalizes an email address for reliable donor identity matching.
 */
export function normalizeEmail(email?: string | null): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Normalizes a phone number (keeps digits, strips leading +91 / 0 for Indian 10-digit matching).
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Computes a deterministic donor identity key.
 * Primary key: normalized email. Secondary fallback: normalized phone.
 * Never merges two donors solely on name similarity.
 * Anonymous donations are keyed individually if no email is provided.
 */
export function computeDonorKey(params: {
  donorEmail?: string | null;
  donorPhone?: string | null;
  anonymous?: boolean;
  razorpayPaymentId?: string;
}): string {
  const email = normalizeEmail(params.donorEmail);
  if (email) return `email:${email}`;
  const phone = normalizePhone(params.donorPhone);
  if (phone) return `phone:${phone}`;
  return `anon:${params.razorpayPaymentId || "unknown"}`;
}

/**
 * Protects CSV exports against spreadsheet formula injection (CSV/DDE injection).
 * Prefixes cells starting with =, +, -, @, tab, or carriage return with a single quote,
 * and properly quotes fields containing commas, quotes, or newlines.
 */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Deduplicates donation records by Razorpay Payment ID so KPI counts
 * and totals reflect unique verified payments.
 */
export function deduplicateByPaymentId<T extends { razorpayPaymentId: string }>(
  records: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const r of records) {
    const pid = r.razorpayPaymentId?.trim();
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);
    result.push(r);
  }
  return result;
}
