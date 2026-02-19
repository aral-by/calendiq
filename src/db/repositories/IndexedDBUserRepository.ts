import { db } from '@/db';
import type { UserProfile } from '@/types/user';
import type { IUserRepository } from './IUserRepository';

/**
 * IndexedDB implementation of User Repository
 */
export class IndexedDBUserRepository implements IUserRepository {
  async get(): Promise<UserProfile | undefined> {
    return await db.user_profile.get(1);
  }

  async create(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: 1,
    };
    await db.user_profile.add(newProfile);
    return newProfile;
  }

  async update(updates: Partial<UserProfile>): Promise<UserProfile> {
    await db.user_profile.update(1, updates);
    const updated = await this.get();
    if (!updated) {
      throw new Error('User profile not found');
    }
    return updated;
  }

  async exists(): Promise<boolean> {
    const count = await db.user_profile.count();
    return count > 0;
  }
}
