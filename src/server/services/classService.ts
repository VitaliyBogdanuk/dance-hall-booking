import { connectOnce } from "@/server/db/mongoose";
import { ClassSessionModel, IClassSession } from "@/server/db/models/classSession.model";
import { HallBlockModel, IHallBlock } from "@/server/db/models/hallBlock.model";
import { TrainerProfileModel, ITrainerProfile } from "@/server/db/models/trainerProfile.model";
import { NotFoundError, ConflictError } from "@/server/http/errors";
import { buildOverlapQuery } from "@/server/utils/timeOverlap";
import { CreateClassBody, UpdateClassBody } from "@/server/validation/classes";
import { ScheduleQuery } from "@/server/validation/schedule";
import { Types } from "mongoose";
import { recordAudit } from "./auditService";
import { NextRequest } from "next/server";
import { sanitizeObject } from "@/server/utils/sanitize";

/**
 * Service for managing class sessions.
 */
export class ClassService {
  /**
   * Creates a new class session.
   * Validates that the class does not overlap with hall blocks or other classes in the same hall.
   *
   * @param trainerId - Trainer profile ID
   * @param data - Class creation data (hallId, startAt, endAt, capacity, optional price)
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The created class session
   * @throws NotFoundError if trainer profile not found or inactive
   * @throws ConflictError if time slot overlaps with hall block or existing class, or if startAt is in the past
   */
  static async createClassSession(trainerId: string, data: CreateClassBody, auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }): Promise<IClassSession> {
    await connectOnce();

    // Sanitize input (only string fields, dates are handled separately)
    const sanitized = sanitizeObject(data);

    const startAt = new Date(sanitized.startAt);
    const endAt = new Date(sanitized.endAt);

    if (startAt < new Date()) {
      throw new ConflictError("Cannot create class in the past");
    }

    const hallId = new Types.ObjectId(sanitized.hallId);
    const trainerIdObj = new Types.ObjectId(trainerId);

    const trainer = await TrainerProfileModel.findById(trainerIdObj).lean() as ITrainerProfile | null;
    if (!trainer || !trainer.isActive) {
      throw new NotFoundError("Trainer profile not found or inactive");
    }

    // Check for overlapping hall blocks
    const overlapQuery = buildOverlapQuery(startAt, endAt);
    const existingBlock = await HallBlockModel.findOne({
      hallId,
      ...overlapQuery,
    }).lean() as IHallBlock | null;

    if (existingBlock) {
      throw new ConflictError("Time slot overlaps with hall block");
    }

    // Check for overlapping classes in the same hall
    const existingClass = await ClassSessionModel.findOne({
      hallId,
      status: "SCHEDULED",
      ...overlapQuery,
    }).lean() as IClassSession | null;

    if (existingClass) {
      throw new ConflictError("Time slot overlaps with existing class in the same hall");
    }

    const classSession = new ClassSessionModel({
      trainerId: trainerIdObj,
      hallId,
      startAt,
      endAt,
      capacity: sanitized.capacity,
      takenSeats: 0,
      status: "SCHEDULED",
      price: sanitized.price,
    });

    const saved = await classSession.save();

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "CLASS_CREATED",
        entityType: "ClassSession",
        entityId: saved._id.toString(),
        metadata: { hallId: sanitized.hallId, capacity: sanitized.capacity, startAt: startAt.toISOString() },
      });
    }

    return saved;
  }

  /**
   * Updates an existing class session.
   * Validates overlap conflicts if time or hall is being changed.
   *
   * @param id - Class session ID
   * @param data - Update data (hallId, startAt, endAt, capacity, price, status)
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The updated class session
   * @throws NotFoundError if class session not found
   * @throws ConflictError if time slot overlaps with hall block or existing class, or if capacity is less than taken seats
   */
  static async updateClassSession(id: string, data: UpdateClassBody, auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }): Promise<IClassSession> {
    await connectOnce();

    // Sanitize input
    const sanitized = sanitizeObject(data);

    const existing = await ClassSessionModel.findById(id).lean() as IClassSession | null;
    if (!existing) {
      throw new NotFoundError("Class session");
    }

    const updateData: Partial<IClassSession> = {};

    if (sanitized.hallId !== undefined) {
      updateData.hallId = new Types.ObjectId(sanitized.hallId);
    }
    if (sanitized.startAt !== undefined) {
      updateData.startAt = new Date(sanitized.startAt);
    }
    if (sanitized.endAt !== undefined) {
      updateData.endAt = new Date(sanitized.endAt);
    }
    if (sanitized.capacity !== undefined) {
      if (sanitized.capacity < existing.takenSeats) {
        throw new ConflictError(`Capacity cannot be less than taken seats (${existing.takenSeats})`);
      }
      updateData.capacity = sanitized.capacity;
    }
    if (sanitized.price !== undefined) {
      updateData.price = sanitized.price;
    }
    if (sanitized.status !== undefined) {
      updateData.status = sanitized.status;
    }

    // Check for overlaps if time or hall is being changed
    if (updateData.startAt || updateData.endAt || updateData.hallId) {
      const startAt = (updateData.startAt ?? existing.startAt) as Date;
      const endAt = (updateData.endAt ?? existing.endAt) as Date;
      const hallId = (updateData.hallId ?? existing.hallId) as Types.ObjectId;

      const overlapQuery = buildOverlapQuery(startAt, endAt);

      // Check for overlapping hall blocks
      const existingBlock = await HallBlockModel.findOne({
        hallId,
        ...overlapQuery,
      }).lean() as IHallBlock | null;

      if (existingBlock) {
        throw new ConflictError("Time slot overlaps with hall block");
      }

      // Check for overlapping classes in the same hall (excluding current class)
      const overlappingClass = await ClassSessionModel.findOne({
        hallId,
        _id: { $ne: new Types.ObjectId(id) },
        status: "SCHEDULED",
        ...overlapQuery,
      }).lean() as IClassSession | null;

      if (overlappingClass) {
        throw new ConflictError("Time slot overlaps with existing class in the same hall");
      }
    }

    const updated = await ClassSessionModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("trainerId", "userId bio specialties")
      .populate("hallId", "name")
      .lean() as IClassSession | null;

    if (!updated) {
      throw new NotFoundError("Class session");
    }

    if (auditContext) {
      const action = data.status === "CANCELED" ? "CLASS_CANCELED" : "CLASS_UPDATED";
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action,
        entityType: "ClassSession",
        entityId: id,
        metadata: {
          status: updated.status,
          capacity: updated.capacity,
          takenSeats: updated.takenSeats,
        },
      });
    }

    return updated;
  }

  /**
   * Gets a class session by ID.
   *
   * @param id - Class session ID
   * @returns The class session
   * @throws NotFoundError if class session not found
   */
  static async getClassById(id: string): Promise<IClassSession> {
    await connectOnce();
    const classSession = await ClassSessionModel.findById(id)
      .populate("hallId", "name")
      .populate("trainerId", "userId bio specialties")
      .lean() as IClassSession | null;
    if (!classSession) {
      throw new NotFoundError("Class session");
    }
    return classSession;
  }

  /**
   * Lists all classes for a specific trainer.
   *
   * @param trainerId - Trainer profile ID
   * @returns Array of class sessions for the trainer, sorted by start time
   */
  static async listMyClasses(trainerId: string): Promise<IClassSession[]> {
    await connectOnce();
    return (await ClassSessionModel.find({ trainerId: new Types.ObjectId(trainerId) })
      .populate("hallId", "name")
      .sort({ startAt: 1 })
      .lean()) as unknown as IClassSession[];
  }

  /**
   * Lists scheduled classes matching the provided filters.
   *
   * @param filters - Schedule query filters (date, from, to, trainerId, hallId)
   * @returns Array of scheduled class sessions, sorted by start time
   */
  static async listSchedule(filters: ScheduleQuery): Promise<IClassSession[]> {
    await connectOnce();
    const query: Record<string, unknown> = { status: "SCHEDULED" };

    // Handle date filter (convert YYYY-MM-DD to date range)
    if (filters.date) {
      const dateStart = new Date(filters.date + "T00:00:00Z");
      const dateEnd = new Date(filters.date + "T23:59:59Z");
      query.startAt = { $gte: dateStart, $lte: dateEnd };
    } else {
      // Use from/to if date is not provided
      if (filters.from) {
        query.startAt = { ...(query.startAt as Record<string, unknown> || {}), $gte: new Date(filters.from) };
      }
      if (filters.to) {
        query.startAt = { ...(query.startAt as Record<string, unknown> || {}), $lte: new Date(filters.to) };
      }
    }

    if (filters.trainerId) {
      query.trainerId = new Types.ObjectId(filters.trainerId);
    }

    if (filters.hallId) {
      query.hallId = new Types.ObjectId(filters.hallId);
    }

    const classes = (await ClassSessionModel.find(query)
      .populate({
        path: "trainerId",
        select: "userId bio specialties",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("hallId", "name")
      .sort({ startAt: 1 })
      .lean()) as unknown as IClassSession[];

    // Transform to include trainer name directly
    return classes.map((cls) => {
      const trainer = cls.trainerId as unknown as { userId?: { name?: string; email?: string } };
      return {
        ...cls,
        trainerName: trainer?.userId?.name || "Unknown Trainer",
      } as IClassSession & { trainerName: string };
    });
  }

  /**
   * Gets all classes matching the provided filters (admin only).
   * Unlike listSchedule, this returns all classes regardless of status.
   *
   * @param filters - Query filters (from, to, trainerId, hallId, status)
   * @returns Array of class sessions, sorted by start time
   */
  static async getAll(filters?: {
    from?: string;
    to?: string;
    trainerId?: string;
    hallId?: string;
    status?: "SCHEDULED" | "CANCELED";
  }): Promise<IClassSession[]> {
    await connectOnce();
    const query: Record<string, unknown> = {};

    if (filters?.from) {
      query.startAt = { ...(query.startAt as Record<string, unknown> || {}), $gte: new Date(filters.from) };
    }
    if (filters?.to) {
      query.startAt = { ...(query.startAt as Record<string, unknown> || {}), $lte: new Date(filters.to) };
    }

    if (filters?.trainerId) {
      query.trainerId = new Types.ObjectId(filters.trainerId);
    }

    if (filters?.hallId) {
      query.hallId = new Types.ObjectId(filters.hallId);
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const classes = (await ClassSessionModel.find(query)
      .populate({
        path: "trainerId",
        select: "userId bio specialties",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("hallId", "name")
      .sort({ startAt: -1 }) // Most recent first for admin view
      .lean()) as unknown as IClassSession[];

    // Transform to include trainer name directly
    return classes.map((cls) => {
      const trainer = cls.trainerId as unknown as { userId?: { name?: string; email?: string } };
      return {
        ...cls,
        trainerName: trainer?.userId?.name || "Unknown Trainer",
      } as IClassSession & { trainerName: string };
    });
  }

  /**
   * Atomically increments takenSeats by 1 if takenSeats < capacity.
   * Used for atomic seat reservation in booking operations.
   *
   * @param classSessionId - Class session ID
   * @returns true if seat was successfully reserved, false if no seats available
   */
  static async incrementTakenSeats(classSessionId: string): Promise<boolean> {
    await connectOnce();
    const result = await ClassSessionModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(classSessionId),
        status: "SCHEDULED",
        $expr: { $lt: ["$takenSeats", "$capacity"] },
        startAt: { $gte: new Date() },
      },
      { $inc: { takenSeats: 1 } },
      { new: true }
    );
    return result !== null;
  }

  /**
   * Decrements takenSeats by 1.
   * Used when canceling bookings.
   *
   * @param classSessionId - Class session ID
   */
  static async decrementTakenSeats(classSessionId: string): Promise<void> {
    await connectOnce();
    await ClassSessionModel.findByIdAndUpdate(classSessionId, { $inc: { takenSeats: -1 } });
  }
}
