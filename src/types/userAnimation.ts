import { Animation } from "@lottiefiles/lottie-types";

export interface UserAnimation {
  id: string;
  userId: string;
  name: string;
  description?: string;
  jsonContent: Animation;
  createdAt: string;
  updatedAt: string;
  _status: "SYNCED" | "CREATED" | "UPDATED" | "DELETED" | "MODIFIED";
  _lastSyncedAt?: string;
}