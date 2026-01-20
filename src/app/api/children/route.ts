import { NextRequest } from "next/server";
import { requireParent } from "@/server/auth/rbac";
import { validateBody } from "@/server/http/validateRequest";
import { createChildBody } from "@/server/validation/children";
import { ChildService } from "@/server/services/childService";
import { jsonOk, jsonError } from "@/server/http/response";

export async function POST(request: NextRequest) {
  try {
    const user = await requireParent();
    const body = await validateBody(request, createChildBody);
    const child = await ChildService.create({
      ...body,
      parentId: user.userId,
    });
    return jsonOk(child, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireParent();
    const children = await ChildService.getByParent(user.userId);
    return jsonOk(children, 200);
  } catch (error) {
    return jsonError(error);
  }
}
