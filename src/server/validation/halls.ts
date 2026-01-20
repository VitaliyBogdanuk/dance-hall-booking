import { z } from "zod";
import { objectId } from "./common";

export const createHallBody = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
});

export type CreateHallBody = z.infer<typeof createHallBody>;

export const updateHallBody = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters").optional(),
  isActive: z.boolean().optional(),
});

export type UpdateHallBody = z.infer<typeof updateHallBody>;

export const hallIdParams = z.object({
  id: objectId,
});

export type HallIdParams = z.infer<typeof hallIdParams>;
