import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateParams, validateBody } from "@/server/http/validateRequest";
import { paymentIdParams } from "@/server/validation/payments";
import { updatePaymentBody } from "@/server/validation/payments";
import { PaymentService } from "@/server/services/paymentService";
import { jsonOk, jsonError } from "@/server/http/response";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "GET", path: `/api/admin/payments/${params.id}` });

  try {
    await requireAdmin();
    const { id } = validateParams(params, paymentIdParams);
    const payment = await PaymentService.getById(id);
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/admin/payments/${id}` });
    return jsonOk(payment, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/admin/payments/${params.id}` }, error);
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "PATCH", path: `/api/admin/payments/${params.id}` });

  try {
    const user = await requireAdmin();
    const { id } = validateParams(params, paymentIdParams);
    const body = await validateBody(request, updatePaymentBody);
    const payment = await PaymentService.update(id, body, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/admin/payments/${id}` });
    return jsonOk(payment, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/admin/payments/${params.id}` }, error);
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin();
    const { id } = validateParams(params, paymentIdParams);
    await PaymentService.delete(id);
    logger.info("Payment record deleted", { userId: user.userId, paymentId: id });
    return jsonOk({ success: true }, 200);
  } catch (error) {
    return jsonError(error);
  }
}
