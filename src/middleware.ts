import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public API routes
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/health") || pathname.startsWith("/api/site")) {
    return NextResponse.next();
  }

  // Always allow public site routes (web profil organisasi)
  const publicPaths = ["/berita", "/galeri", "/landasan-hukum"];
  const isPublicPath =
    pathname === "/" ||
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isPublicPath) {
    return NextResponse.next();
  }


  // Get JWT token (no DB call — pure JWT decode)
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role as string | undefined;

  // Login page
  if (pathname === "/login") {
    if (token) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Participant-only routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/exam")) {
    if (role !== "PARTICIPANT") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
