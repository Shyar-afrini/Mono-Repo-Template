import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG, API_PATHS } from "@mono-repo-template/common";

export async function validateSession(request: NextRequest, locale: string) {
  const sessionCookie = request.cookies.get("session_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Define route types
  const protectedRoutes = ["/dashboard", "/home", "/profile", "/settings"];
  const authRoutes = ["/auth/login", "/auth/register", "/auth/"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.includes(route));

  // If no session cookie
  if (!sessionCookie) {
    if (isProtectedRoute) {
      // Redirect to login with return_to
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("return_to", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to auth routes and public routes
    return null;
  }

  try {
    const apiBaseUrl = API_CONFIG.BASE_URL;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Construct cookie header from all cookies
    const cookieHeader = request.cookies
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_PATHS.VALIDATE_SESSION}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookieHeader,
        "User-Agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      if (isProtectedRoute) {
        const loginUrl = new URL(`/${locale}/auth/login`, request.url);
        loginUrl.searchParams.set("return_to", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return null;
    }

    if (response.ok) {
      if (isAuthRoute) {
        const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
        return NextResponse.redirect(dashboardUrl);
      }

      return null;
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      console.error("Session validation error (non-critical):", error.message);
    }

    return null;
  }
}
