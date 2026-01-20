import { z } from "zod";

/**
 * Validates MongoDB ObjectId format (24 hex characters)
 */
export const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, {
  message: "Invalid ObjectId format",
});

/**
 * Validates ISO 8601 datetime string
 */
export const isoDateTime = z.string().datetime({
  message: "Invalid ISO datetime format",
});

/**
 * Validates YYYY-MM date format
 */
export const ym = z.string().regex(/^\d{4}-\d{2}$/, {
  message: "Invalid month format, expected YYYY-MM",
});

/**
 * Validates YYYY-MM-DD date format
 */
export const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Invalid date format, expected YYYY-MM-DD",
});

/**
 * Helper schema that ensures startAt is before endAt
 */
export const ensureStartBeforeEnd = z
  .object({
    startAt: isoDateTime,
    endAt: isoDateTime,
  })
  .superRefine((v, ctx) => {
    const start = new Date(v.startAt).getTime();
    const end = new Date(v.endAt).getTime();
    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startAt must be before endAt",
        path: ["startAt"],
      });
    }
  });
