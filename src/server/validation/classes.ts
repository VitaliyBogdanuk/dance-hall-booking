import { z } from "zod";
import { objectId, ensureStartBeforeEnd, isoDateTime } from "./common";

export const createClassBody = ensureStartBeforeEnd.extend({
  hallId: objectId,
  capacity: z.number().int().min(1).max(60),
  price: z.number().int().min(0).max(100000).optional(),
});

export const updateClassBody = z
  .object({
    hallId: objectId.optional(),
    startAt: isoDateTime.optional(),
    endAt: isoDateTime.optional(),
    capacity: z.number().int().min(1).max(60).optional(),
    price: z.number().int().min(0).max(100000).optional(),
    status: z.enum(["SCHEDULED", "CANCELED"]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.startAt && v.endAt) {
      if (new Date(v.startAt).getTime() >= new Date(v.endAt).getTime()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "startAt must be before endAt", path: ["startAt"] });
      }
    }
  });

export const classIdParams = z.object({ id: objectId });
