import { z } from "zod";
import { objectId } from "./common";

export const createChildBody = z.object({
  name: z.string().min(2).max(80),
  birthDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const updateChildBody = z.object({
  name: z.string().min(2).max(80).optional(),
  birthDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const childIdParams = z.object({ id: objectId });
