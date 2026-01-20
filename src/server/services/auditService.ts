import { NextRequest } from "next/server";
import { connectOnce } from "@/server/db/mongoose";
import { AuditLogModel, IAuditLog, ActorRole } from "@/server/db/models/auditLog.model";
import { getRequestId, getClientInfo } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";
import { Types } from "mongoose";

interface RecordAuditParams {
  req: NextRequest;
  actor?: {
    userId?: string;
    role?: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records an audit log entry for an important action.
 * This writes to the AuditLog collection in MongoDB.
 */
export async function recordAudit(params: RecordAuditParams): Promise<void> {
  try {
    await connectOnce();

    const requestId = getRequestId(params.req);
    const clientInfo = getClientInfo(params.req);

    // Determine actor role
    let actorRole: ActorRole = "ANON";
    if (params.actor?.role) {
      const role = params.actor.role.toUpperCase();
      if (role === "ADMIN" || role === "TRAINER" || role === "PARENT") {
        actorRole = role as ActorRole;
      }
    }

    // Sanitize metadata - remove sensitive fields
    const sanitizedMetadata = sanitizeMetadata(params.metadata);

    const auditLog: IAuditLog = {
      actorUserId: params.actor?.userId ? (new Types.ObjectId(params.actor.userId) as unknown as typeof import("mongoose").Types.ObjectId) : undefined,
      actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: sanitizedMetadata,
      requestId,
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      createdAt: new Date(),
    };

    await AuditLogModel.create(auditLog);

    // Also log to console for observability
    logger.logInfo("AUDIT_RECORDED", {
      requestId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      actorRole,
      actorUserId: params.actor?.userId,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    logger.logError("AUDIT_LOG_FAILED", { action: params.action, entityType: params.entityType }, error);
  }
}

/**
 * Sanitizes metadata to remove sensitive information.
 */
function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ["password", "passwordHash", "token", "secret", "apiKey", "auth"];

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      continue; // Skip sensitive fields
    }

    // Only include simple types (no nested objects with sensitive data)
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Only include arrays of simple types
      if (value.every((v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")) {
        sanitized[key] = value;
      }
    } else if (typeof value === "object") {
      // Recursively sanitize nested objects
      const nested = sanitizeMetadata(value as Record<string, unknown>);
      if (nested && Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}
