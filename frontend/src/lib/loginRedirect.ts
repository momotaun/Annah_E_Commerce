// Shared by every place that sends a user to /login (protected-route guards,
// the header's Login link, the cart page's "log in to complete your
// purchase" prompt) so login can send them back to where they actually
// were, instead of always landing on a fixed page.

/** Builds a /login URL that remembers where to return to afterwards. */
export function withLoginRedirect(pathname: string, search?: string): string {
  const target = search ? `${pathname}${search}` : pathname;
  if (!target || target === "/login") return "/login";
  return `/login?redirect=${encodeURIComponent(target)}`;
}

/**
 * Validates a `redirect` query value before it's used for navigation.
 * Only same-site relative paths are allowed — an absolute URL (or a
 * protocol-relative `//host/...`) could otherwise be used to bounce a
 * logged-in user off to an attacker-controlled site.
 */
export function resolveSafeRedirect(redirect: string | null): string | null {
  if (!redirect) return null;
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return null;
  return redirect;
}
