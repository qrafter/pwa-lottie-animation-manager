import { create } from "zustand";
import { UserAnimation } from "@/types/userAnimation";
import { db } from "@/db/indexedDB";
import { v4 as uuidv4 } from "uuid";
import { Animation } from "@lottiefiles/lottie-types";

interface UserAnimationsState {
  animations: UserAnimation[];
  loading: boolean;
  error: string | null;
  uploadedAnimation: Animation | null;
}

interface UserAnimationsActions {
  getAnimations: (userId: string) => Promise<UserAnimation[]>;
  getAnimation: (
    userId: string,
    animationId: string
  ) => Promise<UserAnimation | null>;
  addAnimation: (
    userId: string,
    name: string,
    animation: Omit<
      UserAnimation,
      "id" | "userId" | "createdAt" | "updatedAt" | "_status" | "_lastSyncedAt"
    >
  ) => Promise<void>;
  updateAnimation: (
    userId: string,
    id: string,
    updates: Partial<UserAnimation>
  ) => Promise<void>;
  deleteAnimation: (userId: string, animationId: string) => Promise<void>;
  setUploadedAnimation: (animation: Animation | null) => void;
  syncAnimations: (userId: string) => Promise<void>;
}

export const useUserAnimationsStore = create<
  UserAnimationsState & UserAnimationsActions
>()((set) => ({
  animations: [],
  loading: false,
  error: null,
  uploadedAnimation: null,

  getAnimations: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const animations = await db.userAnimations.where({ userId }).toArray();
      set({ animations, loading: false });
      return animations;
    } catch (error) {
      set({ error: "Failed to fetch animations", loading: false });
      return [];
    }
  },

  getAnimation: async (userId: string, animationId: string) => {
    try {
      const animation = await db.userAnimations.get({
        userId,
        id: animationId,
      });
      return animation || null;
    } catch (error) {
      console.error("Failed to fetch animation:", error);
      return null;
    }
  },

  addAnimation: async (
    userId: string,
    name: string,
    animation: Omit<
      UserAnimation,
      "id" | "userId" | "createdAt" | "updatedAt" | "_status" | "_lastSyncedAt"
    >
  ) => {
    const newAnimation: UserAnimation = {
      ...animation,
      id: uuidv4(),
      userId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _status: "created",
    };

    await db.userAnimations.add(newAnimation);
    set((state) => ({ animations: [...state.animations, newAnimation] }));
  },

  updateAnimation: async (
    userId: string,
    id: string,
    updates: Partial<UserAnimation>
  ) => {
    const animation = await db.userAnimations.get({ userId, id });
    if (!animation) {
      throw new Error("Animation not found");
    }

    const updatedAnimation: UserAnimation = {
      ...animation,
      ...updates,
      updatedAt: new Date().toISOString(),
      _status: animation._status === "synced" ? "updated" : animation._status,
    };

    await db.userAnimations.update(id, updatedAnimation as Partial<UserAnimation>);
    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === id ? updatedAnimation : a
      ),
    }));
  },

  deleteAnimation: async (userId: string, animationId: string) => {
    const animation = await db.userAnimations.get({ userId, id: animationId });
    if (!animation) {
      throw new Error("Animation not found");
    }

    if (animation._status === "created") {
      await db.userAnimations.delete(animationId);
    } else {
      await db.userAnimations.update(animationId, { _status: "deleted" });
    }

    set((state) => ({
      animations: state.animations.filter((a) => a.id !== animationId),
    }));
  },

  setUploadedAnimation: (animation: Animation | null) => {
    set({ uploadedAnimation: animation });
  },

  syncAnimations: async (userId: string) => {
    // This is a placeholder for the sync functionality
    // It will be implemented when we add the online sync feature
    console.log("Syncing animations for user:", userId);
    // TODO: Implement actual sync logic
  },
}));
