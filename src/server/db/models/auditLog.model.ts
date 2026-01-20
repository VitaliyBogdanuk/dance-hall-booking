import mongoose, { Schema, model, Types } from "mongoose";

export type ActorRole = "ADMIN" | "TRAINER" | "PARENT" | "ANON";

export interface IAuditLog {
  actorUserId?: Types.ObjectId; // Optional for unauthenticated requests
  actorRole: ActorRole;
  action: string; // e.g., "HALL_CREATED", "CLASS_CREATED", "BOOKING_CREATED"
  entityType: string; // e.g., "Hall", "ClassSession", "Booking", "PaymentRecord"
  entityId: string; // ObjectId as string
  metadata?: Record<string, unknown>; // Small, sanitized metadata
  requestId: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorRole: { type: String, required: true, enum: ["ADMIN", "TRAINER", "PARENT", "ANON"] },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    requestId: { type: String, required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Indexes
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorUserId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLogModel = (mongoose.models && mongoose.models.AuditLog) || model<IAuditLog>("AuditLog", AuditLogSchema);
