import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response (will be modified below)
  let response: NextResponse;

  // Check authentication by checking for auth token cookie
  // In NextAuth v5, cookie names can vary, check common ones
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  // Public routes (only login, ui-kit, and API auth)
  if (
    pathname === "/login" ||
    pathname === "/ui-kit" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/"
  ) {
    // If user is already logged in and tries to access login page, redirect to schedule
    if (pathname === "/login" && sessionToken) {
      return NextResponse.redirect(new URL("/schedule", request.url));
    }
    response = NextResponse.next();
  } else {
    // Protected routes - require authentication
    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For role-based access, we'll check in the layout components
    // Middleware just checks if user is authenticated
    response = NextResponse.next();
  }

  // Add security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
