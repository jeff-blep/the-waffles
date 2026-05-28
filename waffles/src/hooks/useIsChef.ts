"use client";

import { useState, useEffect } from "react";
import { useUser } from "./useUser";

// Returns true if the current viewer is the Chef for this waffle.
// Respects the DEV view-as override stored in localStorage (set by DevViewToggle).
// Override is read in useEffect so the initial render matches the server (no hydration mismatch).
export function useIsChef(chefId: string): boolean {
  const { authUser } = useUser();
  const [devOverride, setDevOverride] = useState<string | null>(null);

  useEffect(() => {
    setDevOverride(localStorage.getItem("waffles_devView"));
  }, []);

  if (devOverride === "chef")  return true;
  if (devOverride === "diner") return false;
  return authUser?.id === chefId;
}
