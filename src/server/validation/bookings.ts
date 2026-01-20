import { z } from "zod";
import { objectId } from "./common";

export const createBookingBody = z.object({
  classSessionId: objectId,
  childId: objectId,
});

export type CreateBookingBody = z.infer<typeof createBookingBody>;

export const bookingIdParams = z.object({
  id: objectId,
});

export type BookingIdParams = z.infer<typeof bookingIdParams>;
