import { NextRequest } from "next/server";
import { requireParent } from "@/server/auth/rbac";
import { validateParams } from "@/server/http/validateRequest";
import { bookingIdParams } from "@/server/validation/bookings";
import { BookingService } from "@/server/services/bookingService";
import { jsonOk, jsonError } from "@/server/http/response";
import { MethodNotAllowedError } from "@/server/http/errors";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";
import { rateLimit, getRateLimitKey } from "@/server/http/rateLimit";
import { getClientInfo } from "@/server/http/requestContext";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "DELETE", path: `/api/bookings/${params.id}` });

  try {
    const user = await requireParent(); // PARENT only
    
    // Rate limiting: 30 requests per minute per userId
    const clientInfo = getClientInfo(request);
    rateLimit({
      key: getRateLimitKey(user.userId, clientInfo.ip),
      limit: 30,
      windowMs: 60 * 1000, // 1 minute
    });

    const { id } = validateParams(params, bookingIdParams);
    const booking = await BookingService.cancelBooking(
      {
        parentId: user.userId,
        bookingId: id,
      },
      {
        req: request,
        actor: { userId: user.userId, role: user.role },
      }
    );
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/bookings/${id}` });
    return jsonOk(booking, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/bookings/${params.id}` }, error);
    return jsonError(error);
  }
}

// Only DELETE is allowed
export async function GET() {
  return jsonError(new MethodNotAllowedError());
}

export async function POST() {
  return jsonError(new MethodNotAllowedError());
}

export async function PATCH() {
  return jsonError(new MethodNotAllowedError());
}
