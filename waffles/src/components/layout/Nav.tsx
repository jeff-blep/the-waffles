"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export default function Nav() {
  const { authUser, profile, signOut, loading } = useUser();
  const router = useRouter();

  const initials = profile?.display_name?.[0]?.toUpperCase()
    ?? profile?.username?.[0]?.toUpperCase()
    ?? authUser?.email?.[0]?.toUpperCase()
    ?? "?";

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-amber-200/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-1.5 text-lg text-gray-900 shrink-0 font-brand">
          🧇 <span>Waffles</span>
        </Link>


        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <div className="w-20 h-8 bg-gray-100 rounded-full animate-pulse" />
          ) : authUser ? (
            <>
              <Link
                href="/listings/create"
                className="hidden sm:inline-flex px-4 py-1.5 rounded-full bg-waffle-orange hover:bg-orange-500 text-white text-sm font-medium transition-colors"
              >
                + List an Item
              </Link>
              <button
                onClick={() => signOut().then(() => router.refresh())}
                className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center hover:bg-orange-200 transition-colors"
                title="Sign out"
              >
                {initials}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "#2B9FE8" }}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-1.5 rounded-full text-white text-sm font-semibold transition-colors shadow-sm hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F5A623, #E8891A)" }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
