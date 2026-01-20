import { connectOnce } from "@/server/db/mongoose";
import { BookingModel, IBooking, BookingStatus } from "@/server/db/models/booking.model";
import { ClassSessionModel, IClassSession } from "@/server/db/models/classSession.model";
import { ChildModel, IChild } from "@/server/db/models/child.model";
import { ClassService } from "./classService";
import { NotFoundError, ConflictError, ForbiddenError } from "@/server/http/errors";
import { Types } from "mongoose";
import { recordAudit } from "./auditService";
import { NextRequest } from "next/server";

/**
 * Service for managing bookings.
 */
export class BookingService {
  /**
   * Creates a new booking with atomic seat reservation.
   * Verifies child belongs to parent, class is available, and atomically reserves a seat.
   *
   * @param data - Booking data (parentId, childId, classSessionId)
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The created or updated booking
   * @throws NotFoundError if child or class session not found
   * @throws ForbiddenError if child does not belong to parent
   * @throws ConflictError if class is canceled/past, no seats available, or already booked
   */
  static async createBooking(
    data: {
      parentId: string;
      childId: string;
      classSessionId: string;
    },
    auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }
  ): Promise<IBooking> {
    await connectOnce();

    // Verify child belongs to parent
    const child = await ChildModel.findById(data.childId).lean() as IChild | null;
    if (!child) {
      throw new NotFoundError("Child");
    }

    if (child.parentId.toString() !== data.parentId) {
      throw new ForbiddenError("Child does not belong to this parent");
    }

    // Verify class is available
    const classSession = await ClassSessionModel.findById(data.classSessionId).lean() as IClassSession | null;
    if (!classSession) {
      throw new NotFoundError("Class session");
    }

    if (classSession.status !== "SCHEDULED") {
      throw new ConflictError("Cannot book canceled class");
    }

    const now = new Date();
    if (new Date(classSession.startAt) < now) {
      throw new ConflictError("Cannot book past class");
    }

    // Check for existing booking
    const existingBooking = await BookingModel.findOne({
      classSessionId: new Types.ObjectId(data.classSessionId),
      childId: new Types.ObjectId(data.childId),
    }).lean() as IBooking | null;

    if (existingBooking && existingBooking.status === "BOOKED") {
      throw new ConflictError("Already booked");
    }

    // Atomic seat reservation: increment takenSeats only if takenSeats < capacity
    const seatReserved = await ClassService.incrementTakenSeats(data.classSessionId);
    if (!seatReserved) {
      throw new ConflictError("No places left");
    }

    // Create or update booking
    try {
      if (existingBooking && existingBooking._id) {
        // Re-activate canceled booking
      const updated = await BookingModel.findByIdAndUpdate(
        existingBooking._id,
        { status: "BOOKED" as BookingStatus, $unset: { canceledAt: 1 } },
        { new: true }
      ).lean() as IBooking | null;
      if (!updated || !updated._id) {
        throw new Error("Failed to update booking");
      }

      if (auditContext) {
        await recordAudit({
          req: auditContext.req,
          actor: auditContext.actor,
          action: "BOOKING_CREATED",
          entityType: "Booking",
          entityId: updated._id.toString(),
          metadata: { childId: data.childId, classSessionId: data.classSessionId, reactivated: true },
        });
      }

      return updated;
      } else {
        // Create new booking
        const booking = new BookingModel({
          classSessionId: new Types.ObjectId(data.classSessionId),
          childId: new Types.ObjectId(data.childId),
          parentId: new Types.ObjectId(data.parentId),
          status: "BOOKED" as BookingStatus,
        });
        const saved = await booking.save();

        if (auditContext) {
          await recordAudit({
            req: auditContext.req,
            actor: auditContext.actor,
            action: "BOOKING_CREATED",
            entityType: "Booking",
            entityId: saved._id.toString(),
            metadata: { childId: data.childId, classSessionId: data.classSessionId },
          });
        }

        return saved;
      }
    } catch (error) {
      // Rollback seat increment if booking write fails
      await ClassService.decrementTakenSeats(data.classSessionId);
      if (error instanceof ConflictError || error instanceof ForbiddenError || error instanceof NotFoundError) {
        throw error;
      }
      // Handle unique index violation (shouldn't happen due to check above, but handle gracefully)
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new ConflictError("Already booked");
      }
      throw new ConflictError("Failed to create booking");
    }
  }

  /**
   * Cancels a booking and decrements takenSeats.
   * Idempotent: can be called multiple times safely.
   *
   * @param data - Cancellation data (parentId, bookingId)
   * @param auditContext - Optional audit context (req, actor) for audit logging
   * @returns The canceled booking
   * @throws NotFoundError if booking not found
   * @throws ForbiddenError if booking does not belong to parent
   */
  static async cancelBooking(
    data: { parentId: string; bookingId: string },
    auditContext?: { req: NextRequest; actor?: { userId?: string; role?: string } }
  ): Promise<IBooking> {
    await connectOnce();

    const booking = await BookingModel.findById(data.bookingId).lean() as IBooking | null;
    if (!booking) {
      throw new NotFoundError("Booking");
    }

    if (booking.parentId.toString() !== data.parentId) {
      throw new ForbiddenError("You can only cancel your own bookings");
    }

    // Idempotent: if already canceled, return as-is
    if (booking.status === "CANCELED") {
      return booking;
    }

    // Update booking status to CANCELED
    const updated = await BookingModel.findByIdAndUpdate(
      data.bookingId,
      { status: "CANCELED" as BookingStatus, canceledAt: new Date() },
      { new: true }
    ).lean() as IBooking | null;

    if (!updated) {
      throw new NotFoundError("Booking");
    }

    // Decrement takenSeats only if booking was BOOKED before cancellation
    await ClassService.decrementTakenSeats(booking.classSessionId.toString());

    if (auditContext) {
      await recordAudit({
        req: auditContext.req,
        actor: auditContext.actor,
        action: "BOOKING_CANCELED",
        entityType: "Booking",
        entityId: data.bookingId,
        metadata: { classSessionId: booking.classSessionId.toString() },
      });
    }

    return updated;
  }

  /**
   * Lists all bookings for a specific parent.
   *
   * @param data - Query data (parentId)
   * @returns Array of bookings for the parent, sorted by creation date (newest first)
   */
  static async listMyBookings(data: { parentId: string }): Promise<IBooking[]> {
    await connectOnce();
    return (await BookingModel.find({ parentId: new Types.ObjectId(data.parentId) })
      .populate({
        path: "classSessionId",
        populate: [
          { path: "hallId", select: "name" },
          {
            path: "trainerId",
            select: "userId",
            populate: {
              path: "userId",
              select: "name",
            },
          },
        ],
      })
      .populate("childId", "name")
      .sort({ createdAt: -1 })
      .lean()) as unknown as IBooking[];
  }

  /**
   * Lists all bookings for a specific class session.
   *
   * @param classSessionId - Class session ID
   * @returns Array of bookings for the class session, with populated child and parent fields
   */
  static async getBookingsByClassSession(classSessionId: string): Promise<IBooking[]> {
    await connectOnce();
    return (await BookingModel.find({
      classSessionId: new Types.ObjectId(classSessionId),
      status: "BOOKED",
    })
      .populate("childId", "name")
      .populate("parentId", "name email")
      .sort({ createdAt: 1 })
      .lean()) as unknown as IBooking[];
  }
}
