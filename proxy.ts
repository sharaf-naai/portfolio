import { NextResponse, type NextRequest } from "next/server";

// Country for the Services budget ranges: Vercel's geo header → `country` cookie, read by the page.
// Used only for display; not stored anywhere else.
export function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const country = req.headers.get("x-vercel-ip-country");
  if (country && /^[A-Z]{2}$/.test(country) && req.cookies.get("country")?.value !== country) {
    res.cookies.set("country", country, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 });
  }
  return res;
}

export const config = { matcher: "/" };
