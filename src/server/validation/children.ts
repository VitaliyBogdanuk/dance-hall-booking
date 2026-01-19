import { z } from "zod";
import { objectId, isoDateTime } from "./common";

export const createChildBody = z.object({
  name: z.string().min(2).max(80),
  birthDate: isoDateTime.optional(),
  notes: z.string().max(500).optional(),
});

export const updateChildBody = z.object({
  name: z.string().min(2).max(80).optional(),
  birthDate: isoDateTime.optional(),
  notes: z.string().max(500).optional(),
});

export const childIdParams = z.object({ id: objectId });
