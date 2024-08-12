import { Animation } from "@lottiefiles/lottie-types";

export interface UserAnimation {
  id: string;
  userId: string;
  name: string;
  description?: string;
  jsonContent: Animation;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  _status: "synced" | "created" | "updated" | "deleted" | "modified";
  _lastSyncedAt?: string;
}