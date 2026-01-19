import { z } from "zod";

export const objectId = z
  .string()
  .min(24)
  .max(24)
  .regex(/^[a-fA-F0-9]{24}$/);

export const isoDateTime = z.string().datetime();

export function ensureStartBeforeEnd<T extends { startAt: string; endAt: string }>() {
  return z
    .object({
      startAt: isoDateTime,
      endAt: isoDateTime,
    })
    .superRefine((v, ctx) => {
      if (new Date(v.startAt).getTime() >= new Date(v.endAt).getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "startAt must be before endAt",
          path: ["startAt"],
        });
      }
    });
}

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(), // MVP: optional
});
