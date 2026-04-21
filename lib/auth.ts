export const AUTH_COOKIE_NAME = "zentrixa_session";

export function getAuthCredentials() {
  return {
    email: process.env.ZENTRIXA_ADMIN_EMAIL || "idreesrah0@gmail.com",
    password: process.env.ZENTRIXA_ADMIN_PASSWORD || "zentrixa-admin"
  };
}

export function getSessionSecret() {
  return process.env.ZENTRIXA_SESSION_SECRET || "zentrixa-session-secret";
}

export function getExpectedSessionToken() {
  return getSessionSecret();
}

export function isValidLogin(email: string, password: string) {
  const credentials = getAuthCredentials();
  return email.trim().toLowerCase() === credentials.email.toLowerCase()
    && password === credentials.password;
}
