import { z } from "zod";
import { objectId } from "./common";

export const scheduleQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  trainerId: objectId.optional(),
  hallId: objectId.optional(),
});
