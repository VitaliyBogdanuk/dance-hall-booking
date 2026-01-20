import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateBody, validateQuery } from "@/server/http/validateRequest";
import { createPaymentBody } from "@/server/validation/payments";
import { z } from "zod";
import { objectId } from "@/server/validation/common";
import { PaymentService } from "@/server/services/paymentService";
import { jsonOk, jsonError } from "@/server/http/response";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

const paymentsQuery = z.object({
  parentId: objectId.optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "POST", path: "/api/admin/payments" });

  try {
    const user = await requireAdmin();
    const body = await validateBody(request, createPaymentBody);
    const payment = await PaymentService.create(body, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 201, path: "/api/admin/payments" });
    return jsonOk(payment, 201);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: "/api/admin/payments" }, error);
    return jsonError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const filters = validateQuery(request.nextUrl, paymentsQuery);
    const payments = await PaymentService.getAll(filters);
    return jsonOk(payments, 200);
  } catch (error) {
    return jsonError(error);
  }
}
