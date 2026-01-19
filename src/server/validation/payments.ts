import { z } from "zod";
import { objectId } from "./common";

export const createPaymentBody = z.object({
  parentId: objectId,
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  amount: z.number().int().min(0).max(1000000),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
  notes: z.string().max(500).optional(),
});

export const updatePaymentBody = z.object({
  amount: z.number().int().min(0).max(1000000).optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
  notes: z.string().max(500).optional(),
});

export const paymentIdParams = z.object({ id: objectId });
