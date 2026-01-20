import { connectOnce } from "@/server/db/mongoose";
import { PaymentRecordModel, IPaymentRecord, PaymentStatus } from "@/server/db/models/paymentRecord.model";
import { NotFoundError, ConflictError } from "@/server/http/errors";
import { Types } from "mongoose";
import { recordAudit } from "./auditService";
import { NextRequest } from "next/server";
import { sanitizeObject } from "@/server/utils/sanitize";

export class PaymentService {
  static async create(
    data: {
      parentId: string;
      month: string;
      amount: number;
      status?: PaymentStatus;
      notes?: string;
    },
    auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }
  ): Promise<IPaymentRecord> {
    await connectOnce();

    // Sanitize input
    const sanitized = sanitizeObject(data);

    const existing = await PaymentRecordModel.findOne({
      parentId: new Types.ObjectId(sanitized.parentId),
      month: sanitized.month,
    }).lean() as IPaymentRecord | null;

    if (existing) {
      throw new ConflictError(`Payment record for ${sanitized.month} already exists`);
    }

    const payment = new PaymentRecordModel({
      parentId: new Types.ObjectId(sanitized.parentId),
      month: sanitized.month,
      amount: sanitized.amount,
      status: sanitized.status ?? "PENDING",
      notes: sanitized.notes,
    });

    const saved = await payment.save();

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "PAYMENT_CREATED",
        entityType: "PaymentRecord",
        entityId: saved._id.toString(),
        metadata: { parentId: sanitized.parentId, month: sanitized.month, amount: sanitized.amount, status: saved.status },
      });
    }

    return saved;
  }

  static async getById(id: string): Promise<IPaymentRecord> {
    await connectOnce();
    const payment = await PaymentRecordModel.findById(id)
      .populate("parentId", "name email")
      .lean() as IPaymentRecord | null;
    if (!payment) {
      throw new NotFoundError("Payment record");
    }
    return payment;
  }

  static async getByParent(parentId: string): Promise<IPaymentRecord[]> {
    await connectOnce();
    return (await PaymentRecordModel.find({ parentId: new Types.ObjectId(parentId) })
      .sort({ month: -1 })
      .lean()) as unknown as IPaymentRecord[];
  }

  static async getAll(filters: { parentId?: string; status?: PaymentStatus; month?: string }): Promise<
    IPaymentRecord[]
  > {
    await connectOnce();
    const query: Record<string, unknown> = {};

    if (filters.parentId) {
      query.parentId = new Types.ObjectId(filters.parentId);
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.month) {
      query.month = filters.month;
    }

    return (await PaymentRecordModel.find(query)
      .populate("parentId", "name email")
      .sort({ month: -1 })
      .lean()) as unknown as IPaymentRecord[];
  }

  static async update(
    id: string,
    data: { amount?: number; status?: PaymentStatus; notes?: string },
    auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }
  ): Promise<IPaymentRecord> {
    await connectOnce();

    // Sanitize input
    const sanitized = sanitizeObject(data);

    const updateData: Partial<IPaymentRecord> = {};
    if (sanitized.amount !== undefined) {
      updateData.amount = sanitized.amount;
    }
    if (sanitized.status !== undefined) {
      updateData.status = sanitized.status;
    }
    if (sanitized.notes !== undefined) {
      updateData.notes = sanitized.notes;
    }

    const updated = await PaymentRecordModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("parentId", "name email")
      .lean() as IPaymentRecord | null;

    if (!updated) {
      throw new NotFoundError("Payment record");
    }

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "PAYMENT_UPDATED",
        entityType: "PaymentRecord",
        entityId: id,
        metadata: { amount: updated.amount, status: updated.status },
      });
    }

    return updated;
  }

  static async delete(id: string): Promise<void> {
    await connectOnce();
    const result = await PaymentRecordModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError("Payment record");
    }
  }
}
