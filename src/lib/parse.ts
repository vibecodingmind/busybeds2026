/**
 * Safely parse a JSON string field that might be a string or already an array.
 * Prisma stores arrays as JSON strings in SQLite, so the API may return
 * either a raw string or a parsed array depending on the endpoint.
 */
export function parseJsonField<T = string[]>(value: unknown): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T) : ([] as unknown as T);
    } catch {
      return [] as unknown as T;
    }
  }
  return [] as unknown as T;
}
