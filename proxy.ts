import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// Locale routing (next-intl): saved NEXT_LOCALE cookie → browser Accept-Language → en.
// Plus the visitor's country for the Services budget ranges: Vercel's geo header → `country` cookie,
// read by the page. Used only for display; not stored anywhere else.
export function proxy(req: NextRequest) {
  const res = intl(req);
  const country = req.headers.get("x-vercel-ip-country");
  if (country && /^[A-Z]{2}$/.test(country) && req.cookies.get("country")?.value !== country) {
    res.cookies.set("country", country, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 });
  }
  return res;
}

// Everything except API, Next internals and files with an extension (images, fonts, …).
export const config = { matcher: "/((?!api|_next|_vercel|.*\\..*).*)" };
