import { z } from "zod";
import { objectId, isoDateTime } from "./common";

export const createChildBody = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
  birthDate: isoDateTime.optional(),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

export type CreateChildBody = z.infer<typeof createChildBody>;

export const updateChildBody = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters").optional(),
  birthDate: isoDateTime.optional(),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

export type UpdateChildBody = z.infer<typeof updateChildBody>;

export const childIdParams = z.object({
  id: objectId,
});

export type ChildIdParams = z.infer<typeof childIdParams>;
