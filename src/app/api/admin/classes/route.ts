import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateQuery } from "@/server/http/validateRequest";
import { z } from "zod";
import { objectId, isoDateTime } from "@/server/validation/common";
import { ClassService } from "@/server/services/classService";
import { jsonOk, jsonError } from "@/server/http/response";

const adminClassesQuery = z.object({
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  trainerId: objectId.optional(),
  hallId: objectId.optional(),
  status: z.enum(["SCHEDULED", "CANCELED"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const filters = validateQuery(request.nextUrl, adminClassesQuery);
    const classes = await ClassService.getAll({
      from: filters.from,
      to: filters.to,
      trainerId: filters.trainerId,
      hallId: filters.hallId,
      status: filters.status,
    });
    return jsonOk(classes, 200);
  } catch (error) {
    return jsonError(error);
  }
}
