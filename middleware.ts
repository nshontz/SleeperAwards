import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    // Additional middleware logic can be added here if needed
    // For now, just use Kinde's default auth middleware
  },
  {
    callbacks: {
      authorized: ({ token }: { token: unknown }) => {
        // Return true if user has a valid token, false otherwise
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect these routes with authentication
    "/teams/:path*",
    "/awards",
    // Protect API routes that require authentication
    "/api/user/:path*",
  ]
};