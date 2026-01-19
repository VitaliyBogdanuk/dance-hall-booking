import { z } from "zod";

export const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);

export const isoDateTime = z.string().datetime();

export const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const ym = z.string().regex(/^\d{4}-\d{2}$/);

export const ensureStartBeforeEnd = z
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
