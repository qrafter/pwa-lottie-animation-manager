import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db, LocalUser } from '@/db/indexedDB';
import { supabase } from '@/lib/supabaseClient';

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
      let user = await db.users.toCollection().first();
      if (!user) {
        user = {
          localUserId: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.users.add(user);
      }
      
      // Check if there's an active session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        user.email = session.user.email;
        user.onlineUserId = session.user.id;
        await db.users.update(user.localUserId, user);
      }

      set({ localUser: user, isInitialized: true, error: null });
    } catch (error) {
      set({ error: 'Failed to initialize local user' });
    }
  },

  signUp: async (email: string, password: string) => {
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
      set({ error: 'Failed to sign up' });
    }
  },

  signIn: async (email: string, password: string) => {
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
      set({ error: 'Failed to sign in' });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      const { localUser } = get();
      if (localUser) {
        const updatedUser: LocalUser = {
          ...localUser,
          email: undefined,
          onlineUserId: undefined,
          updatedAt: new Date().toISOString(),
        };
        await db.users.update(localUser.localUserId, updatedUser);
        set({ localUser: updatedUser, error: null });
      }
    } catch (error) {
      set({ error: 'Failed to sign out' });
    }
  },

  syncUser: async () => {
    // ... (keep the existing syncUser logic)
  },
}));