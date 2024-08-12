import Dexie, { Table } from "dexie";
import { UserAnimation } from "@/types/userAnimation";

export interface LocalUser {
  id: string;
  email?: string;
  supabaseId?: string;
  createdAt: string;
  updatedAt: string;
}

class LottieAnimationManagerDatabase extends Dexie {
  userAnimations!: Table<UserAnimation>;
  users!: Table<LocalUser>;

  constructor() {
    super("LottieAnimationManagerDatabase");
    this.version(2).stores({
      userAnimations: "id, userId, name, createdAt, updatedAt, _status, _lastSyncedAt",
      users: "id, email, supabaseId"
    });
  }
}

export const db = new LottieAnimationManagerDatabase();