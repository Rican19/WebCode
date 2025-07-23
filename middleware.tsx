import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Protect /sections/dashboard route
  if (request.nextUrl.pathname.startsWith("/sections/dashboard") && !token) {
    return NextResponse.redirect(new URL("/components/login", request.url));
  } else if (
    request.nextUrl.pathname.startsWith("/sections/diseaseManagement") &&
    !token
  ) {
    // If the user is not logged in, redirect them to the login page
    return NextResponse.redirect(new URL("/components/login", request.url));
  } else if (request.nextUrl.pathname === "/components/signup" && token) {
    return NextResponse.redirect(new URL("/sections/dashboard", request.url));
  } else if (token && request.nextUrl.pathname === "/components/login") {
    // If the user is already logged in, redirect them to the dashboard
    return NextResponse.redirect(new URL("/sections/dashboard", request.url));
  }
  return NextResponse.next();
}

// Apply middleware only to dashboard routes
export const config = {
  matchers: [
    "/sections/dashboard",
    "/components/login",
    "/sections/diseaseManagement",
    "/components/signup",
  ],
};
