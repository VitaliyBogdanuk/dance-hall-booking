import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { jsonOk, jsonError } from "@/server/http/response";
import { UserModel } from "@/server/db/models/user.model";
import { connectOnce } from "@/server/db/mongoose";

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
    await connectOnce();

    const parents = await UserModel.find({ role: "PARENT" })
      .select("_id name email phone")
      .sort({ name: 1 })
      .lean();

    return jsonOk(parents, 200);
  } catch (error) {
    return jsonError(error);
  }
}
