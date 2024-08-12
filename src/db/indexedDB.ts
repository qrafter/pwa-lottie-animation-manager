import Dexie, { Table } from "dexie";
import { UserAnimation } from "@/types/userAnimation";

export interface LocalUser {
  localUserId: string;
  email?: string;
  onlineUserId?: string;
  lastSynced?: string;
  createdAt: string;
  updatedAt: string;
}

class LottieAnimationManagerDatabase extends Dexie {
  userAnimations!: Table<UserAnimation>;
  users!: Table<LocalUser>;

  constructor() {
    super("LottieAnimationManagerDatabase");
    this.version(3).stores({
      userAnimations: "id, userId, [id+userId], name, createdAt, updatedAt, _status, _lastSyncedAt",
      users: 'localUserId, email, onlineUserId',
    });
  }
}

export const db = new LottieAnimationManagerDatabase();