import { z } from "zod";
import { objectId, isoDateTime } from "./common";

export const createClassBody = z
  .object({
    hallId: objectId,
    startAt: isoDateTime,
    endAt: isoDateTime,
    capacity: z.number().int("Capacity must be an integer").min(1, "Capacity must be at least 1").max(60, "Capacity must be at most 60"),
    price: z.number().int("Price must be an integer").min(0, "Price must be non-negative").max(100000, "Price must be at most 100000").optional(),
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

export type CreateClassBody = z.infer<typeof createClassBody>;

export const updateClassBody = z
  .object({
    hallId: objectId.optional(),
    startAt: isoDateTime.optional(),
    endAt: isoDateTime.optional(),
    capacity: z.number().int("Capacity must be an integer").min(1, "Capacity must be at least 1").max(60, "Capacity must be at most 60").optional(),
    price: z.number().int("Price must be an integer").min(0, "Price must be non-negative").max(100000, "Price must be at most 100000").optional(),
    status: z.enum(["SCHEDULED", "CANCELED"]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.startAt && v.endAt) {
      const start = new Date(v.startAt).getTime();
      const end = new Date(v.endAt).getTime();
      if (start >= end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "startAt must be before endAt",
          path: ["startAt"],
        });
      }
    }
  });

export type UpdateClassBody = z.infer<typeof updateClassBody>;

export const classIdParams = z.object({
  id: objectId,
});

export type ClassIdParams = z.infer<typeof classIdParams>;
