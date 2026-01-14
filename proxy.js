import { NextResponse } from "next/server";

const AUTH_PAGES = new Set(["/auth/login", "/auth/signup"]);

async function isAuthenticated(request) {
	// Call your existing endpoint as the source of truth.
	const url = new URL("/api/auth/me", request.url);

	// IMPORTANT: when calling fetch from the server/proxy, cookies are NOT auto-forwarded
	// unless you pass them through. So we forward the Cookie header from the incoming request.
	const cookie = request.headers.get("cookie") ?? "";

	const res = await fetch(url, {
		method: "GET",
		headers: { cookie },
		cache: "no-store",
	});

	return res.ok; // 200 => authenticated, 401 => not authenticated
}

export async function proxy(request) {
	const { pathname, search } = request.nextUrl;

	const isAuthPage = AUTH_PAGES.has(pathname);
	const authed = await isAuthenticated(request);

	// Not authed and trying to access any non-auth page => send to login
	if (!authed && !isAuthPage) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = "/auth/login";
		loginUrl.searchParams.set("next", pathname + search);
		return NextResponse.redirect(loginUrl);
	}

	// Authed but trying to access login/signup => send home
	if (authed && isAuthPage) {
		const homeUrl = request.nextUrl.clone();
		homeUrl.pathname = "/";
		homeUrl.search = "";
		return NextResponse.redirect(homeUrl);
	}

	return NextResponse.next();
}

// Apply to everything EXCEPT: api routes, next internals, and common metadata files
export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
