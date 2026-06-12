import { InvalidRedirectUriException } from '../../domain/exceptions/invalid-redirect-uri.exception';

/**
 * Enforces an exact-match allowlist for OAuth redirect URIs.
 *
 * Per the OAuth 2.0 Security BCP, redirect URIs must be compared by exact string
 * match — no wildcards, no prefix/substring matching — to prevent open-redirect
 * and authorization-code interception. Fails closed: an empty allowlist allows nothing.
 */
export function assertAllowedRedirectUri(allowedRedirectUris: string[], redirectUri: string): void {
  if (!allowedRedirectUris.includes(redirectUri)) {
    throw new InvalidRedirectUriException();
  }
}
