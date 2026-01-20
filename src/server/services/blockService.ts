import { connectOnce } from "@/server/db/mongoose";
import { HallBlockModel, IHallBlock } from "@/server/db/models/hallBlock.model";
import { ClassSessionModel } from "@/server/db/models/classSession.model";
import { NotFoundError, ConflictError } from "@/server/http/errors";
import { buildOverlapQuery } from "@/server/utils/timeOverlap";
import { CreateHallBlockBody } from "@/server/validation/blocks";
import { Types } from "mongoose";
import { recordAudit } from "./auditService";
import { NextRequest } from "next/server";

/**
 * Service for managing hall time blocks.
 */
export class BlockService {
  /**
   * Creates a new hall block.
   * Validates that the block does not overlap with existing blocks or scheduled classes in the same hall.
   *
   * @param hallId - Hall ID
   * @param data - Block creation data (startAt, endAt, reason)
   * @param createdByAdminId - Admin user ID creating the block
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The created hall block
   * @throws ConflictError if time slot overlaps with existing block or scheduled class
   */
  static async createBlock(
    hallId: string,
    data: CreateHallBlockBody,
    createdByAdminId: string,
    auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }
  ): Promise<IHallBlock> {
    await connectOnce();

    const hallIdObj = new Types.ObjectId(hallId);
    const startAt = new Date(data.startAt);
    const endAt = new Date(data.endAt);

    // Check for overlapping blocks in the same hall
    const overlapQuery = buildOverlapQuery(startAt, endAt);
    const existingBlocks = await HallBlockModel.find({
      hallId: hallIdObj,
      ...overlapQuery,
    }).lean();

    if (existingBlocks.length > 0) {
      throw new ConflictError("Time slot overlaps with existing block in the same hall");
    }

    // Check for overlapping scheduled classes in the same hall
    const existingClasses = await ClassSessionModel.find({
      hallId: hallIdObj,
      status: "SCHEDULED",
      ...overlapQuery,
    }).lean();

    if (existingClasses.length > 0) {
      throw new ConflictError("Time slot overlaps with scheduled class in the same hall");
    }

    const block = new HallBlockModel({
      hallId: hallIdObj,
      startAt,
      endAt,
      reason: data.reason,
      createdByAdminId: new Types.ObjectId(createdByAdminId),
    });

    const saved = await block.save();

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "BLOCK_CREATED",
        entityType: "HallBlock",
        entityId: saved._id.toString(),
        metadata: { hallId, startAt: startAt.toISOString(), endAt: endAt.toISOString() },
      });
    }

    return saved;
  }

  /**
   * Lists all blocks for a specific hall.
   *
   * @param hallId - Hall ID
   * @returns Array of hall blocks, sorted by start time
   */
  static async listBlocksForHall(hallId: string): Promise<IHallBlock[]> {
    await connectOnce();
    return HallBlockModel.find({ hallId: new Types.ObjectId(hallId) })
      .sort({ startAt: 1 })
      .lean();
  }

  /**
   * Deletes a hall block.
   *
   * @param id - Block ID
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @throws NotFoundError if block not found
   */
  static async deleteBlock(id: string, auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }): Promise<void> {
    await connectOnce();
    const block = await HallBlockModel.findById(id).lean();
    if (!block) {
      throw new NotFoundError("Hall block");
    }

    const result = await HallBlockModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError("Hall block");
    }

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "BLOCK_DELETED",
        entityType: "HallBlock",
        entityId: id,
        metadata: { hallId: block.hallId.toString() },
      });
    }
  }
}
