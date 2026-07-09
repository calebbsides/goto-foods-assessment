export const SESSION_COOKIE = "__session";

export const GUEST_COOKIE_PREFIX = "guest_";

export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;

export function guestCookieName(orderId: string): string {
  return `${GUEST_COOKIE_PREFIX}${orderId}`;
}
