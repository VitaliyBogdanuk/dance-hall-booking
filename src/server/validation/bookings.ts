import { z } from "zod";
import { objectId } from "./common";

export const createBookingBody = z.object({
  classSessionId: objectId,
  childId: objectId,
});

export const bookingIdParams = z.object({ id: objectId });
