import { NextRequest } from "next/server";
import { requireParent } from "@/server/auth/rbac";
import { validateParams, validateBody } from "@/server/http/validateRequest";
import { childIdParams } from "@/server/validation/children";
import { updateChildBody } from "@/server/validation/children";
import { ChildService } from "@/server/services/childService";
import { jsonOk, jsonError } from "@/server/http/response";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireParent();
    const { id } = validateParams(params, childIdParams);
    const child = await ChildService.getById(id, user.userId);
    return jsonOk(child, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireParent();
    const { id } = validateParams(params, childIdParams);
    const body = await validateBody(request, updateChildBody);
    const child = await ChildService.update(id, body, user.userId);
    return jsonOk(child, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireParent();
    const { id } = validateParams(params, childIdParams);
    await ChildService.delete(id, user.userId);
    return jsonOk({ success: true }, 200);
  } catch (error) {
    return jsonError(error);
  }
}
