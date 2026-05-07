import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { validateSession } from "./app/lib/auth";

export default async function proxy(request: NextRequest) {
  const intlMiddleware = createMiddleware(routing);
  const locale =
    request.cookies.get("NEXT_LOCALE")?.value || routing.defaultLocale;

  const authResult = await validateSession(request, locale);

  if (authResult) {
    return authResult;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
