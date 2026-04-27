import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

export const CLIENT_PORTAL_COOKIE_NAME = "zentrixa_client_portal";

function sessionSecret() {
  return process.env.ZENTRIXA_SESSION_SECRET || "zentrixa-local-client-portal-secret";
}

export function hashClientPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return { salt, hash };
}

export function verifyClientPassword(password: string, salt: string, expectedHash: string) {
  const { hash } = hashClientPassword(password, salt);
  const left = Buffer.from(hash);
  const right = Buffer.from(expectedHash);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function makeClientSessionToken(portalId: string, login: string) {
  const payload = Buffer.from(JSON.stringify({ portalId, login, issuedAt: Date.now() })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readClientSessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.portalId || !parsed?.login) return null;
    return parsed as { portalId: string; login: string; issuedAt: number };
  } catch {
    return null;
  }
}
