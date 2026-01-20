import { z } from "zod";
import { objectId, isoDateTime } from "./common";

export const hallIdParams = z.object({
  id: objectId,
});

export type HallIdParams = z.infer<typeof hallIdParams>;

export const blockIdParams = z.object({
  id: objectId,
});

export type BlockIdParams = z.infer<typeof blockIdParams>;

export const createHallBlockBody = z
  .object({
    startAt: isoDateTime,
    endAt: isoDateTime,
    reason: z.string().min(2, "Reason must be at least 2 characters").max(160, "Reason must be at most 160 characters"),
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

export type CreateHallBlockBody = z.infer<typeof createHallBlockBody>;
