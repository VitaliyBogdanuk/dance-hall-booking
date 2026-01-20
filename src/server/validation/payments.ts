import { z } from "zod";
import { objectId, ym } from "./common";

export const createPaymentBody = z.object({
  parentId: objectId,
  month: ym,
  amount: z.number().int("Amount must be an integer").min(0, "Amount must be non-negative").max(1000000, "Amount must be at most 1000000"),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

export type CreatePaymentBody = z.infer<typeof createPaymentBody>;

export const updatePaymentBody = z.object({
  amount: z.number().int("Amount must be an integer").min(0, "Amount must be non-negative").max(1000000, "Amount must be at most 1000000").optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

export type UpdatePaymentBody = z.infer<typeof updatePaymentBody>;

export const paymentIdParams = z.object({
  id: objectId,
});

export type PaymentIdParams = z.infer<typeof paymentIdParams>;
