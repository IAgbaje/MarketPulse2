/**
 * Safe CSV serialization utility that prevents spreadsheet formula injection (CWE-1236)
 * and properly escapes embedded double-quotes, commas, and newlines.
 */

const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const cleaned = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  const neutralized = FORMULA_TRIGGER.test(cleaned) ? `'${cleaned}` : cleaned;
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildCsvDocument(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerLine, ...bodyLines].join('\n');
}
