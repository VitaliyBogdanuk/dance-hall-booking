import { NextRequest } from "next/server";
import { requireParent } from "@/server/auth/rbac";
import { jsonOk, jsonError } from "@/server/http/response";
import { MethodNotAllowedError } from "@/server/http/errors";
import { z } from "zod";

const initiatePaymentBody = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    await requireParent();
    const body = await request.json();
    const { bookingId } = initiatePaymentBody.parse(body);

    // TODO: Integrate with LiqPay
    // For now, return a mock payment URL
    // In production, this would:
    // 1. Create a payment intent/transaction record
    // 2. Generate LiqPay payment URL with proper parameters
    // 3. Return the URL for redirect

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/payment/result?status=success&bookingId=${bookingId}`;
    const _errorUrl = `${baseUrl}/payment/result?status=error&bookingId=${bookingId}`;

    // Mock LiqPay integration - replace with actual LiqPay SDK
    // const liqpay = new LiqPay(publicKey, privateKey);
    // const paymentUrl = liqpay.checkout({
    //   action: "pay",
    //   amount: amount,
    //   currency: "USD",
    //   description: `Booking payment for ${bookingId}`,
    //   order_id: bookingId,
    //   result_url: successUrl,
    //   server_url: `${baseUrl}/api/payments/webhook`,
    // }).getUrl();

    // For now, simulate payment by redirecting to result page
    // In production, this would be the actual LiqPay checkout URL
    const paymentUrl = successUrl; // Replace with actual LiqPay URL

    return jsonOk({ paymentUrl }, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET() {
  return jsonError(new MethodNotAllowedError());
}
