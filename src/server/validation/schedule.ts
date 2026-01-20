import { z } from "zod";
import { objectId, ymd, isoDateTime } from "./common";

export const scheduleQuery = z.object({
  date: ymd.optional(),
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  trainerId: objectId.optional(),
  hallId: objectId.optional(),
});

export type ScheduleQuery = z.infer<typeof scheduleQuery>;
