import { NextRequest } from "next/server";
import { requireParent } from "@/server/auth/rbac";
import { validateBody } from "@/server/http/validateRequest";
import { createBookingBody } from "@/server/validation/bookings";
import { BookingService } from "@/server/services/bookingService";
import { jsonOk, jsonError } from "@/server/http/response";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";
import { rateLimit, getRateLimitKey } from "@/server/http/rateLimit";
import { getClientInfo } from "@/server/http/requestContext";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "POST", path: "/api/bookings" });

  try {
    const user = await requireParent(); // PARENT only
    
    // Rate limiting: 30 requests per minute per userId
    const clientInfo = getClientInfo(request);
    rateLimit({
      key: getRateLimitKey(user.userId, clientInfo.ip),
      limit: 30,
      windowMs: 60 * 1000, // 1 minute
    });

    const body = await validateBody(request, createBookingBody);
    const booking = await BookingService.createBooking(
      {
        parentId: user.userId,
        childId: body.childId,
        classSessionId: body.classSessionId,
      },
      {
        req: request,
        actor: { userId: user.userId, role: user.role },
      }
    );
    logger.logInfo("API_RESPONSE", { requestId, status: 201, path: "/api/bookings" });
    return jsonOk(booking, 201);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: "/api/bookings" }, error);
    return jsonError(error);
  }
}

// Only POST is allowed
export async function GET() {
  return jsonError(new Error("Method not allowed"), 405);
}

export async function PATCH() {
  return jsonError(new Error("Method not allowed"), 405);
}

export async function DELETE() {
  return jsonError(new Error("Method not allowed"), 405);
}
