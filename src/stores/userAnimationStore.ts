import { create } from "zustand";
import { UserAnimation } from "@/types/userAnimation";
import { db } from "@/db/indexedDB";
import { v4 as uuidv4 } from "uuid";
import { Animation } from "@lottiefiles/lottie-types";
import { gql } from "@apollo/client";
import { client } from "@/lib/apolloClient";

const SYNC_ANIMATIONS = gql`
  mutation SyncAnimations($userId: String!, $animations: [AnimationInput!]!) {
    syncAnimations(userId: $userId, animations: $animations) {
      id
      userId
      name
      jsonContent
      createdAt
      updatedAt
    }
  }
`;
interface UserAnimationsState {
  animations: UserAnimation[];
  loading: boolean;
  error: string | null;
  uploadedAnimation: Animation | null;
}

interface UserAnimationsActions {
  loadAnimations: (userId: string) => Promise<void>;
  getAnimation: (animationId: string) => UserAnimation | undefined;
  searchAnimations: (searchTerm: string) => UserAnimation[];
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
  syncAnimations: (onlineUserId: string, localUserId: string) => Promise<void>;
}

export const useUserAnimationsStore = create<
  UserAnimationsState & UserAnimationsActions
>()((set, get) => ({
  animations: [],
  loading: false,
  error: null,
  uploadedAnimation: null,

  loadAnimations: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const animations = await db.userAnimations
        .where({ userId })
        .and((animation) => animation._status !== "DELETED")
        .toArray();
      set({ animations, loading: false });
    } catch (error) {
      set({ error: "Failed to load animations", loading: false });
    }
  },

  getAnimation: (animationId: string) => {
    return get().animations.find((animation) => animation.id === animationId);
  },

  searchAnimations: (searchTerm: string) => {
    const { animations } = get();
    if (!searchTerm.trim()) {
      return animations;
    }
    const lowerTerm = searchTerm.toLowerCase();
    return animations.filter((animation) =>
      animation.name.toLowerCase().includes(lowerTerm)
    );
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
      _status: "CREATED",
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
      _status: animation._status === "SYNCED" ? "UPDATED" : animation._status,
    };

    await db.userAnimations.update(
      id,
      updatedAnimation as Partial<UserAnimation>
    );
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

    if (animation._status === "CREATED") {
      await db.userAnimations.delete(animationId);
    } else {
      await db.userAnimations.update(animationId, { _status: "DELETED" });
    }

    set((state) => ({
      animations: state.animations.filter((a) => a.id !== animationId),
    }));
  },

  setUploadedAnimation: (animation: Animation | null) => {
    set({ uploadedAnimation: animation });
  },

  syncAnimations: async (onlineUserId: string, localUserId: string) => {
    set({ error: null });
    try {
      // Fetch all local animations
      const localAnimations = await db.userAnimations
        .where({ userId: localUserId })
        .toArray();

      // Prepare the animations for sync
      const animationsForSync = localAnimations.map((animation) => ({
        id: animation.id,
        name: animation.name,
        jsonContent: animation.jsonContent,
        createdAt: animation.createdAt,
        updatedAt: animation.updatedAt,
        _status: animation._status,
        _lastSyncedAt: animation._lastSyncedAt,
      }));

      // Perform the sync mutation
      const { data } = await client.mutate({
        mutation: SYNC_ANIMATIONS,
        variables: { userId: onlineUserId, animations: animationsForSync },
      });

      const syncedAnimations =
        (
          data.syncAnimations as (UserAnimation & { jsonContent: string })[]
        ).map((syncedAnimation) => ({
          ...syncedAnimation,
          jsonContent:
            typeof syncedAnimation.jsonContent === "string"
              ? JSON.parse(syncedAnimation.jsonContent)
              : syncedAnimation.jsonContent,
        })) || [];

      console.log("Synced animations:", syncedAnimations);

      // Update local database with all returned animations
      await db.transaction("rw", db.userAnimations, async () => {
        // First, mark all existing animations as potentially outdated
        await db.userAnimations
          .where({ userId: localUserId })
          .modify({ _status: "MODIFIED" });

        for (const syncedAnimation of syncedAnimations) {
          const localAnimation = await db.userAnimations.get({
            id: syncedAnimation.id,
            userId: localUserId,
          });

          if (localAnimation) {
            console.log("Updating existing animation:", syncedAnimation.id);
            // Update existing animation
            await db.userAnimations.update(syncedAnimation.id, {
              ...syncedAnimation,
              userId: localUserId,
              _status: "SYNCED",
              _lastSyncedAt: new Date().toISOString(),
            });
          } else {
            console.log("Adding new animation:", syncedAnimation.id);
            // Add new animation
            await db.userAnimations.add({
              ...syncedAnimation,
              userId: localUserId,
              _status: "SYNCED",
              _lastSyncedAt: new Date().toISOString(),
            });
          }
        }

        // Remove any animations that are still marked as modified (they were deleted on the server)
        await db.userAnimations
          .where({ userId: localUserId, _status: "MODIFIED" })
          .delete();
      });

      // Update the state with all synced animations
      set({
        animations: syncedAnimations.map((a) => ({
          ...a,
          userId: localUserId,
        })),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to sync animations:", error);
      alert("Failed to sync animations");
      set({ loading: false });
    }
  },
}));
