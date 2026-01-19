import { z } from "zod";
import { objectId, ym } from "./common";

export const createPaymentBody = z.object({
  parentId: objectId,
  month: ym,
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
