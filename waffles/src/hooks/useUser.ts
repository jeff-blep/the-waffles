"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { WaffleUser } from "@/types";

interface UseUserReturn {
  // Supabase auth user (email, id, etc.)
  authUser: User | null;
  // Our extended user profile from public.users
  profile: WaffleUser | null;
  loading: boolean;
  // Convenience flags
  isLoggedIn: boolean;
  isBasic: boolean;
  isIdVerified: boolean;
  isMod: boolean;
  isPrincipal: boolean;
  isBanned: boolean;
  signOut: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const supabase = createClient();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WaffleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
      if (user) fetchProfile(user.id);
      else setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ?? null;
        setAuthUser(user);
        if (user) fetchProfile(user.id);
        else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as unknown as WaffleUser);
    }
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
  }

  return {
    authUser,
    profile,
    loading,
    isLoggedIn: !!authUser,
    isBasic: profile?.tier === "basic" || profile?.tier === "id_verified",
    isIdVerified: profile?.tier === "id_verified",
    isMod: profile?.role === "mod" || profile?.role === "principal",
    isPrincipal: profile?.role === "principal",
    isBanned: profile?.is_banned ?? false,
    signOut,
  };
}
