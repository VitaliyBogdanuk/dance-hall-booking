import { z } from "zod";
import { objectId } from "./common";

export const createHallBody = z.object({
  name: z.string().min(2).max(80),
});

export const updateHallBody = z.object({
  name: z.string().min(2).max(80).optional(),
  isActive: z.boolean().optional(),
});

export const hallIdParams = z.object({ id: objectId });
