import { FeaturedAnimation } from '@/types/animation';
import { UserAnimation } from '@/types/userAnimation';
import Dexie, { Table } from 'dexie';

class LottieAnimationManagerDatabase extends Dexie {
  featuredAnimations!: Table<FeaturedAnimation>;
  userAnimations!: Table<UserAnimation>;
  constructor() {
    super('LottieAnimationManagerDatabase');
    this.version(1).stores({
      featuredAnimations: '++id, name, createdAt, updatedAt, createdByUserId, slug, status, url',
      userAnimations: 'id, userId, name, createdAt, updatedAt, isPublic, _status, _lastSyncedAt'
    });
  }
}

export const db = new LottieAnimationManagerDatabase();