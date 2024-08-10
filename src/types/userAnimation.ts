import { Animation } from "@lottiefiles/lottie-types";

export interface UserAnimation {
  id: string;
  userId: string;  // This will come from useAuth
  name: string;
  description?: string;
  jsonContent: Animation;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags?: string[];
  _status: 'synced' | 'created' | 'updated' | 'deleted';
  _lastSyncedAt?: string;
}