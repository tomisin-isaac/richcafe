import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signSession({ userId }) {
	if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");
	// `exp` is handled via expiresIn
	return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifySession(token) {
	if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");
	return jwt.verify(token, JWT_SECRET); // throws if invalid/expired
}
