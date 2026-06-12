import { OAuthState } from '../models/oauth-state.model';

export interface OAuthStateRepositoryPort {
  save(state: OAuthState): Promise<void>;
  /**
   * Atomically look up and delete a state by its value (single-use).
   * Returns the consumed state, or null if it does not exist.
   */
  consume(state: string): Promise<OAuthState | null>;
  deleteExpired(): Promise<void>;
}

export const OAUTH_STATE_REPOSITORY_PORT = Symbol('OAUTH_STATE_REPOSITORY_PORT');
