import { z } from "zod";
import { objectId, ensureStartBeforeEnd } from "./common";

export const hallIdParams = z.object({ id: objectId });
export const blockIdParams = z.object({ id: objectId });

export const createHallBlockBody = ensureStartBeforeEnd.extend({
  reason: z.string().min(2).max(160),
});
