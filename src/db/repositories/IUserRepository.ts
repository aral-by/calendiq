import type { UserProfile } from '@/types/user';

/**
 * User Repository Interface
 * Manages single user profile storage
 */
export interface IUserRepository {
  /**
   * Get the user profile (always ID 1)
   */
  get(): Promise<UserProfile | undefined>;

  /**
   * Create new user profile
   */
  create(profile: Omit<UserProfile, 'id'>): Promise<UserProfile>;

  /**
   * Update existing user profile
   */
  update(updates: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Check if user profile exists
   */
  exists(): Promise<boolean>;
}
