import { NextRequest } from "next/server";
import { requireParent } from "@/server/auth/rbac";
import { BookingService } from "@/server/services/bookingService";
import { jsonOk, jsonError } from "@/server/http/response";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireParent(); // PARENT only
    const bookings = await BookingService.listMyBookings({ parentId: user.userId });
    return jsonOk(bookings, 200);
  } catch (error) {
    return jsonError(error);
  }
}
