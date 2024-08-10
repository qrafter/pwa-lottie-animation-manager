import { create } from "zustand";
import { UserAnimation } from "@/types/userAnimation";
import { db } from "@/db/indexedDB";
import { v4 } from "uuid";
import { Animation } from "@lottiefiles/lottie-types";

interface UserAnimationsState {
  animations: UserAnimation[];
  loading: boolean;
  error: string | null;
  uploadedAnimation: Animation | null;
}

interface UserAnimationsActions {
  getAnimations: (userId: string) => Promise<UserAnimation[]>;
  getAnimation: (userId: string, animationId: string) => Promise<UserAnimation | null>;
  addAnimation: (
    userId: string,
    name: string,
    animation: Omit<UserAnimation, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateAnimation: (id: string, updates: Partial<UserAnimation>) => Promise<void>;
  deleteAnimation: (userId: string, animationId: string) => Promise<void>;
  setUploadedAnimation: (animation: Animation | null) => void;
}

export const useUserAnimationsStore = create<UserAnimationsState & UserAnimationsActions>()((set, get) => ({
  animations: [],
  loading: false,
  error: null,
  uploadedAnimation: null,

  getAnimations: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const animations = await db.userAnimations.where({ userId }).toArray();
      set({ loading: false });
      return animations;
    } catch (error) {
      set({ error: "Failed to fetch animations", loading: false });
      return [];
    }
  },

  getAnimation: async (userId, animationId) => {
    try {
      const animation = await db.userAnimations.get({ userId, id: animationId });
      if (animation) {
        set(state => ({
          animations: [...state.animations.filter(a => a.id !== animationId), animation]
        }));
      }
      return animation || null;
    } catch (error) {
      console.error("Failed to fetch animation:", error);
      return null;
    }
  },

  addAnimation: async (
    userId: string,
    name: string,
    animation: Omit<UserAnimation, "id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    const { animations } = get();

    const isDuplicate = await db.userAnimations
      .where({ userId, name: name })
      .first();

    if (isDuplicate) {
      throw new Error("An animation with this name already exists");
    }

    const newAnimation: UserAnimation = {
      ...animation,
      id: v4(),
      userId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.userAnimations.add(newAnimation);
    set({ animations: [...animations, newAnimation] });
  },

  updateAnimation: async (id, updates) => {
    const { animations } = get();
    const updatedAnimation = {
      ...animations.find((a) => a.id === id),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.userAnimations.update(id, updatedAnimation);
    set({
      animations: animations.map((a) =>
        a.id === id ? updatedAnimation : a
      ) as UserAnimation[],
    });
  },

  deleteAnimation: async (userId, animationId) => {
    await db.userAnimations.delete(animationId);
    const animations = await db.userAnimations.where({ userId }).toArray();
    set({ animations });
  },

  setUploadedAnimation: (animation: Animation | null) => {
    set({ uploadedAnimation: animation });
  },
}));