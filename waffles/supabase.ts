/**
 * src/lib/supabase.ts
 *
 * Two clients:
 *   createBrowserClient() - use in Client Components, hooks
 *   createServerClient() - use in Server Components, API routes, middleware
 *
 * The @supabase/ssr package handles cookie-based auth automatically.
 * Never use the old @supabase/auth-helpers-nextjs package.
 */

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { createServerClient as _createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// ─── Browser client (singleton) ──────────────────────────────────────────────
// Call this in Client Components and custom hooks.

export function createBrowserClient() {
  return _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Server client ────────────────────────────────────────────────────────────
// Call this inside Server Components, Route Handlers, and Server Actions.
// Reads + writes cookies automatically via next/headers.

export async function createServerClient() {
  const cookieStore = await cookies();

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component - safe to ignore
            // Middleware will handle session refresh
          }
        },
      },
    }
  );
}

// ─── Admin client (service role - server only) ────────────────────────────────
// Use ONLY in trusted server contexts (admin routes, background jobs).
// NEVER expose service role key to the browser.

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must only be called server-side.");
  }
  return _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
