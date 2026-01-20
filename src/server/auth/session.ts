import { auth } from "./index";
import { UserRole } from "@/types/domain";
import { UnauthorizedError } from "@/server/http/errors";

/**
 * Gets the current user from NextAuth session in API route handlers.
 *
 * @returns User session data with userId and role
 * @throws UnauthorizedError if not authenticated
 */
export async function getServerUser(): Promise<{ userId: string; role: UserRole; email: string; name: string }> {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.role) {
    throw new UnauthorizedError("Authentication required");
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email,
    name: session.user.name,
  };
}
