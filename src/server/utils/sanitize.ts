/**
 * Sanitizes a string by trimming and removing control characters.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return input;
  }
  // Trim whitespace
  let sanitized = input.trim();
  // Remove control characters (except newlines and tabs for notes/descriptions)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");
  return sanitized;
}

/**
 * Deeply sanitizes all string fields in an object.
 * Returns a new object without mutating the original.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === "string") {
        return sanitizeString(item);
      }
      if (typeof item === "object" && item !== null) {
        return sanitizeObject(item as Record<string, unknown>);
      }
      return item;
    }) as unknown as T;
  }

  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }

  return sanitized;
}
