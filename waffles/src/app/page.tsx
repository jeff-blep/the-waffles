import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import CategorySearch from "@/components/home/CategorySearch";
import ListingCard, { type ListingCardData } from "@/components/home/ListingCard";

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { category = "", q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("waffles")
    .select(`
      id, title, category, seat_price, total_seats, total_pot, deadline,
      waffle_items (photo_urls, declared_value),
      chef:users!waffles_chef_id_fkey (username, display_name, stack_tier)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(9);

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: rawWaffles } = await query;

  const waffleIds = rawWaffles?.map((w) => w.id) ?? [];
  const seatCountMap: Record<string, number> = {};

  if (waffleIds.length > 0) {
    const { data: filledSeats } = await supabase
      .from("seats")
      .select("waffle_id")
      .in("waffle_id", waffleIds)
      .neq("status", "available");

    filledSeats?.forEach((s) => {
      seatCountMap[s.waffle_id] = (seatCountMap[s.waffle_id] ?? 0) + 1;
    });
  }

  const listings: ListingCardData[] = (rawWaffles ?? []).map((w) => ({
    ...w,
    seats_sold: seatCountMap[w.id] ?? 0,
  }));

  const isFiltered = Boolean(category || q);

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 px-4 text-center">
        {/* Orange glow — top left */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-orange-300/20 blur-3xl" />
        {/* Blue glow — top right */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl" />

        <div className="relative max-w-2xl mx-auto space-y-6">
          {/* Mascot */}
          <Image
            src="/mascot.gif"
            alt="Waffles the cat"
            width={136}
            height={136}
            className="mx-auto"
            style={{ filter: "drop-shadow(0 12px 28px rgba(43,159,232,0.45)) drop-shadow(0 4px 8px rgba(0,0,0,0.18))" }}
            priority
            unoptimized
          />

          <h1 className="font-brand font-bold text-5xl sm:text-6xl tracking-tight leading-tight" style={{ color: "#2B9FE8" }}>
            Waffles
          </h1>

          <p className="text-xl sm:text-2xl font-semibold -mt-2" style={{ color: "#C27A1A" }}>
            Pull up a seat.
          </p>

          <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
            A community raffle marketplace. <span className="font-semibold text-orange-600">Chefs</span> list items,{" "}
            <span className="font-semibold text-blue-500">Diners</span> buy seats, and when all seats fill —{" "}
            <span className="font-semibold text-gray-800">The Draw</span> happens.{" "}
            No fill? No charge. Zero risk.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <a
              href="#browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-base transition-colors shadow-md text-white"
              style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8891A 100%)" }}
            >
              🧇 Browse Waffles
            </a>
            <Link
              href="/listings/create"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/80 border-2 font-bold text-base transition-colors backdrop-blur-sm hover:bg-white"
              style={{ borderColor: "#2B9FE8", color: "#2B9FE8" }}
            >
              🍳 List an Item
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">
            How it works
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            Three steps. Completely fair. Totally transparent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Step 1 — orange (Chef) */}
            <div className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-orange-100 shadow-card">
              <div className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #F5A623, #E8891A)" }}>
                1
              </div>
              <div className="text-4xl mb-3">🍳</div>
              <h3 className="font-bold text-gray-900 mb-2">Chef lists an item</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                A <span className="font-semibold text-orange-600">Chef</span> sets up a Waffle — item details, seat count, price, and deadline. The platform verifies it before it goes live.
              </p>
            </div>

            {/* Step 2 — blue (Diner) */}
            <div className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-blue-100 shadow-card">
              <div className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #2B9FE8, #1A7AC0)" }}>
                2
              </div>
              <div className="text-4xl mb-3">🪑</div>
              <h3 className="font-bold text-gray-900 mb-2">Diners buy seats</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Anyone can grab a seat as a <span className="font-semibold text-blue-500">Diner</span>. Your card is pre-authorized — not charged — until the Waffle fills completely.
              </p>
            </div>

            {/* Step 3 — draw purple/neutral */}
            <div className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-100 shadow-card">
              <div className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #9B59B6, #7D3C98)" }}>
                3
              </div>
              <div className="text-4xl mb-3">🎰</div>
              <h3 className="font-bold text-gray-900 mb-2">The Draw</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                When every seat fills, <span className="font-semibold text-gray-800">The Draw</span> runs via RANDOM.ORG — provably fair, publicly auditable. One Diner wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BROWSE ────────────────────────────────────────────── */}
      <section id="browse" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isFiltered ? "Waffles" : "Featured Waffles"}
              </h2>
              {isFiltered && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {category && <span>Category: <strong>{category}</strong></span>}
                  {category && q && <span className="mx-1">·</span>}
                  {q && <span>Search: <strong>&ldquo;{q}&rdquo;</strong></span>}
                  {" "}
                  <a href="#browse" className="text-orange-500 hover:underline">Clear</a>
                </p>
              )}
            </div>
            <Link
              href="/listings/create"
              className="shrink-0 px-4 py-2 rounded-full bg-white/70 border text-sm font-semibold hover:bg-white transition-colors backdrop-blur-sm"
              style={{ borderColor: "#2B9FE8", color: "#2B9FE8" }}
            >
              + List your item
            </Link>
          </div>

          <CategorySearch currentCategory={category} currentQuery={q} />

          <div className="mt-8">
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4">
                <div className="text-6xl">🧇</div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isFiltered ? "No Waffles match your search" : "No Waffles live yet"}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  {isFiltered
                    ? "Try a different category or clear your search."
                    : "Be the first Chef to list an item and start the community."}
                </p>
                {!isFiltered && (
                  <Link
                    href="/listings/create"
                    className="inline-flex mt-2 px-6 py-2.5 rounded-full text-white text-sm font-bold transition-colors shadow-sm"
                    style={{ background: "linear-gradient(135deg, #F5A623, #E8891A)" }}
                  >
                    🍳 Create a Waffle
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────── */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-card px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: "🔒", label: "Escrow protected",       sub: "Funds held until delivery confirmed",    color: "text-orange-600" },
            { icon: "🎲", label: "Provably fair draw",     sub: "RANDOM.ORG with public audit trail",     color: "text-blue-500"   },
            { icon: "💳", label: "Card held, not charged", sub: "Zero cost if the Waffle doesn't fill",   color: "text-orange-600" },
            { icon: "✅", label: "Verified Chefs",         sub: "ID verification required to list",       color: "text-blue-500"   },
          ].map(({ icon, label, sub, color }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <div className={`text-sm font-bold ${color}`}>{label}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-snug">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIGN UP CTA ───────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <div
          className="max-w-lg mx-auto rounded-3xl px-8 py-14 shadow-raised space-y-5 text-white"
          style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8891A 40%, #2B9FE8 100%)" }}
        >
          <Image
            src="/mascot.gif"
            alt="Waffles"
            width={72}
            height={72}
            className="mx-auto drop-shadow-md"
            unoptimized
          />
          <h2 className="text-3xl font-extrabold">Ready to pull up a seat?</h2>
          <p className="text-white/80 text-base">
            Join the community. Buy seats, list items, and be part of every Draw.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white font-bold text-base transition-colors shadow-sm hover:bg-orange-50"
            style={{ color: "#E8891A" }}
          >
            Create your account →
          </Link>
          <p className="text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="py-8 px-4 text-center text-sm">
        <p className="text-gray-400 font-medium">
          🧇 Waffles · thewaffles.co ·{" "}
          <a href="mailto:info@thewaffles.co" className="hover:text-gray-600 transition-colors">
            info@thewaffles.co
          </a>
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Waffles is not gambling. Seat purchase = chance to win, not the item itself.
        </p>
      </footer>

    </div>
  );
}
