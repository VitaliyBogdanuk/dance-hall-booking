import { UserRole } from "@/types/domain";
import { ForbiddenError } from "@/server/http/errors";
import { getServerUser } from "./session";

/**
 * Requires the user to have one of the allowed roles.
 *
 * @param userRole - User's role from session
 * @param allowedRoles - Array of roles that are allowed
 * @throws ForbiddenError if user role is not in allowed roles
 */
export function requireRole(userRole: UserRole, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
  }
}

/**
 * Requires ADMIN role.
 *
 * @returns User session data
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if not ADMIN
 */
export async function requireAdmin(): Promise<{ userId: string; role: UserRole; email: string; name: string }> {
  const user = await getServerUser();
  requireRole(user.role, ["ADMIN"]);
  return user;
}

/**
 * Requires TRAINER or ADMIN role.
 *
 * @returns User session data
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if not TRAINER or ADMIN
 */
export async function requireTrainer(): Promise<{ userId: string; role: UserRole; email: string; name: string }> {
  const user = await getServerUser();
  requireRole(user.role, ["ADMIN", "TRAINER"]);
  return user;
}

/**
 * Requires PARENT or ADMIN role.
 *
 * @returns User session data
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if not PARENT or ADMIN
 */
export async function requireParent(): Promise<{ userId: string; role: UserRole; email: string; name: string }> {
  const user = await getServerUser();
  requireRole(user.role, ["ADMIN", "PARENT"]);
  return user;
}
