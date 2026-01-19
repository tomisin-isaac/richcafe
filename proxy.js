import { NextResponse } from "next/server";

const USER_AUTH_PAGES = new Set(["/auth/login", "/auth/signup"]);
const ADMIN_AUTH_PAGES = new Set(["/auth/admin/login", "/auth/admin/signup"]);

function isAdminPath(pathname) {
	return pathname === "/admin" || pathname.startsWith("/admin/");
}

async function checkAuth(request, endpointPath) {
	const url = new URL(endpointPath, request.url);
	const cookie = request.headers.get("cookie") ?? "";

	const res = await fetch(url, {
		method: "GET",
		headers: { cookie },
		cache: "no-store",
	});

	return res.ok;
}

export async function proxy(request) {
	const { pathname, search } = request.nextUrl;

	// -------- Admin flow --------
	if (isAdminPath(pathname) || ADMIN_AUTH_PAGES.has(pathname)) {
		const adminAuthed = await checkAuth(request, "/api/admin/auth/me");

		// If not authed and trying to access any admin page except admin auth pages => send to admin login
		if (!adminAuthed && !ADMIN_AUTH_PAGES.has(pathname)) {
			const loginUrl = request.nextUrl.clone();
			loginUrl.pathname = "/auth/admin/login";
			loginUrl.searchParams.set("next", pathname + search);
			return NextResponse.redirect(loginUrl);
		}

		// If authed and trying to access admin login/signup => send to /admin
		if (adminAuthed && ADMIN_AUTH_PAGES.has(pathname)) {
			const adminHome = request.nextUrl.clone();
			adminHome.pathname = "/admin";
			adminHome.search = "";
			return NextResponse.redirect(adminHome);
		}

		return NextResponse.next();
	}

	// -------- User flow --------
	const userAuthed = await checkAuth(request, "/api/auth/me");

	// Not authed and trying to access any non-auth page => send to login
	if (!userAuthed && !USER_AUTH_PAGES.has(pathname)) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = "/auth/login";
		loginUrl.searchParams.set("next", pathname + search);
		return NextResponse.redirect(loginUrl);
	}

	// Authed but trying to access login/signup => send home
	if (userAuthed && USER_AUTH_PAGES.has(pathname)) {
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
