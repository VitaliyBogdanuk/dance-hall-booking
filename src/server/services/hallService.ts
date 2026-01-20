import { connectOnce } from "@/server/db/mongoose";
import { HallModel, IHall } from "@/server/db/models/hall.model";
import { NotFoundError } from "@/server/http/errors";
import { CreateHallBody, UpdateHallBody } from "@/server/validation/halls";
import { recordAudit } from "./auditService";
import { NextRequest } from "next/server";
import { sanitizeObject } from "@/server/utils/sanitize";

/**
 * Service for managing dance halls.
 */
export class HallService {
  /**
   * Creates a new hall.
   *
   * @param data - Hall creation data (name)
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The created hall
   */
  static async createHall(data: CreateHallBody, auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }): Promise<IHall> {
    await connectOnce();
    // Sanitize input
    const sanitized = sanitizeObject(data);
    const hall = new HallModel(sanitized);
    const saved = await hall.save();

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "HALL_CREATED",
        entityType: "Hall",
        entityId: saved._id.toString(),
        metadata: { name: saved.name },
      });
    }

    return saved;
  }

  /**
   * Lists all active halls.
   *
   * @returns Array of active halls, sorted by name
   */
  static async listHalls(): Promise<IHall[]> {
    await connectOnce();
    return HallModel.find({ isActive: true }).sort({ name: 1 }).lean();
  }

  /**
   * Gets a hall by ID.
   *
   * @param id - Hall ID
   * @returns The hall
   * @throws NotFoundError if hall not found
   */
  static async getHallById(id: string): Promise<IHall> {
    await connectOnce();
    const hall = await HallModel.findById(id).lean();
    if (!hall) {
      throw new NotFoundError("Hall");
    }
    return hall;
  }

  /**
   * Updates an existing hall.
   *
   * @param id - Hall ID
   * @param data - Update data (name and/or isActive)
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The updated hall
   * @throws NotFoundError if hall not found
   */
  static async updateHall(id: string, data: UpdateHallBody, auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }): Promise<IHall> {
    await connectOnce();
    // Sanitize input
    const sanitized = sanitizeObject(data);
    const hall = await HallModel.findByIdAndUpdate(id, sanitized, { new: true, runValidators: true }).lean();
    if (!hall) {
      throw new NotFoundError("Hall");
    }

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "HALL_UPDATED",
        entityType: "Hall",
        entityId: hall._id.toString(),
        metadata: { name: hall.name, isActive: hall.isActive },
      });
    }

    return hall;
  }
}
