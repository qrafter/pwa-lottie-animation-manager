import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db, LocalUser } from '@/db/indexedDB';
import { supabase } from '@/lib/supabaseClient';
import { UserAnimation } from '../types/userAnimation';

interface UserState {
  localUser: LocalUser | null;
  isInitialized: boolean;
  error: string | null;
}

interface UserActions {
  initializeLocalUser: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncUser: () => Promise<void>;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  localUser: null,
  isInitialized: false,
  error: null,

  initializeLocalUser: async () => {
    try {
      // First, check if we've already initialized
      if (get().isInitialized) {
        console.log('Local user already initialized');
        return;
      }
  
      // Attempt to get all users
      const users = await db.users.toArray();
  
      let user: LocalUser;
  
      if (users.length === 0) {
        // No users exist, create a new one
        user = {
          localUserId: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.users.add(user);
      } else if (users.length === 1) {
        // One user exists, use it
        user = users[0];
      } else {
        // Multiple users exist (shouldn't happen), use the first and delete others
        user = users[0];
        for (let i = 1; i < users.length; i++) {
          await db.users.delete(users[i].localUserId);
        }
        console.warn('Multiple users found in IndexedDB. Kept first, deleted others.');
      }
  
      try {
        // Check if there's an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          user.email = session.user.email;
          user.onlineUserId = session.user.id;
          await db.users.update(user.localUserId, user);
        }
      } catch (sessionError) {
        console.log('Failed to check online session. Continuing with local data.');
      }
  
      set({ localUser: user, isInitialized: true, error: null });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to initialize local user' });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const { localUser } = get();
      if (!localUser) throw new Error('No local user');

      const updatedUser: LocalUser = {
        ...localUser,
        email,
        onlineUserId: data.user?.id,
        updatedAt: new Date().toISOString(),
      };

      await db.users.update(localUser.localUserId, updatedUser);
      set({ localUser: updatedUser, error: null });

      await get().syncUser();
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to sign up' });
      throw new Error('Failed to sign up');
    }
  },

  signIn: async (email: string, password: string) => {
    set({ error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { localUser } = get();
      if (!localUser) throw new Error('No local user');

      const updatedUser: LocalUser = {
        ...localUser,
        email,
        onlineUserId: data.user?.id,
        updatedAt: new Date().toISOString(),
      };

      await db.users.update(localUser.localUserId, updatedUser);
      set({ localUser: updatedUser, error: null });

      await get().syncUser();
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to sign in' });
      throw new Error('Failed to sign in');
    }
  },

  signOut: async () => {
    try {
      // 1. Clear Supabase Session
      await supabase.auth.signOut();

      const { localUser } = get();
      if (!localUser) return;

      // 2. Update Local User Data
      const updatedUser: LocalUser = {
        ...localUser,
        email: undefined,
        onlineUserId: undefined,
        updatedAt: new Date().toISOString(),
      };
      await db.users.update(localUser.localUserId, updatedUser);

      // 3. Handle Local Data
      // Option A: Preserve Local Data
      await db.transaction('rw', db.userAnimations, async () => {
        await db.userAnimations
          .where('userId').equals(localUser.localUserId)
          .modify((animation: UserAnimation) => {
            animation._status = 'modified';
            animation._lastSyncedAt = new Date().toISOString();
          });
      });

      // 4. Update UI (This will be handled by React based on state change)
      set({ localUser: updatedUser, error: null });

      // 5. Reset Sync Status
      // This could be handled in a separate sync store or within UserStore
      // For simplicity, we'll just log it here
      console.log('Sync status reset');

      // 6. Handle Offline Mode
      // The app should now be ready to function offline
      // New local account creation will be handled when the user interacts with the app again

    } catch (error) {
      set({ error: 'Failed to log out' });
    }
  },

  syncUser: async () => {
    // ... (keep the existing syncUser logic)
  },
}));