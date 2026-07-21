import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Always allow static asset files and SEO files (svg, png, ico, jpg, webp, xml, txt, html)
  if (
    /\.(svg|png|ico|jpg|jpeg|webp|xml|txt|html)$/i.test(pathname) ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Always allow public API routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/site")
  ) {
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

  // NextAuth v5 session resolution
  let user = req.auth?.user;
  let role = (user as any)?.role;

  // Fallback check with secureCookie support for production HTTPS
  if (!user) {
    const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

    const token = await getToken({
      req,
      secret,
      secureCookie: isHttps,
    });

    if (token) {
      user = token as any;
      role = token.role as string;
    }
  }

  // Login page
  if (pathname === "/login") {
    if (user) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Require authentication
  if (!user) {
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
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|html)$).*)",
  ],
};
