import { UserAnimation } from "@/types/userAnimation";
import Dexie, { Table } from "dexie";

class LottieAnimationManagerDatabase extends Dexie {
  userAnimations!: Table<UserAnimation>;
  constructor() {
    super("LottieAnimationManagerDatabase");
    this.version(1).stores({
      userAnimations:
        "id, userId, name, createdAt, updatedAt, _status, _lastSyncedAt",
    });
  }
}

export const db = new LottieAnimationManagerDatabase();
