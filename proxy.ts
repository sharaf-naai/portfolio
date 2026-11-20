import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// Locale routing (next-intl): "/" → the saved NEXT_LOCALE cookie, else /en. Detection is off in
// routing.ts (it would also read Accept-Language), so the cookie is handled here.
// Plus the visitor's country for the Services budget currency: Vercel's geo header → `country` cookie,
// read by the page. Used only for display; not stored anywhere else.
export function proxy(req: NextRequest) {
  const saved = req.cookies.get("NEXT_LOCALE")?.value;
  if (req.nextUrl.pathname === "/" && hasLocale(routing.locales, saved)) return NextResponse.redirect(new URL(`/${saved}`, req.url));
  const res = intl(req);
  const country = req.headers.get("x-vercel-ip-country");
  if (country && /^[A-Z]{2}$/.test(country) && req.cookies.get("country")?.value !== country) {
    res.cookies.set("country", country, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 });
  }
  return res;
}

// Everything except API, Next internals and files with an extension (images, fonts, …).
export const config = { matcher: "/((?!api|_next|_vercel|.*\\..*).*)" };
