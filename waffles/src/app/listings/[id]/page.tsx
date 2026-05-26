import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SeatGrid from "@/components/listings/SeatGrid";
import WaffleActions from "@/components/listings/WaffleActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch waffle with chef profile and items
  const { data: waffle, error } = await supabase
    .from("waffles")
    .select(`
      *,
      chef:users!waffles_chef_id_fkey (
        id, username, display_name, avatar_url, rep_score, stack_tier
      ),
      waffle_items (*)
    `)
    .eq("id", id)
    .single();

  if (error || !waffle) notFound();

  // Fetch seats
  const { data: seats } = await supabase
    .from("seats")
    .select("*")
    .eq("waffle_id", id)
    .order("seat_number");

  const soldSeats = seats?.filter((s) => s.status !== "available").length ?? 0;
  const fillPercent = Math.round((soldSeats / waffle.total_seats) * 100);
  const totalPot = (waffle.seat_price * waffle.total_seats) / 100;
  const item = waffle.waffle_items?.[0];

  const deadlineDate = new Date(waffle.deadline);
  const deadlineStr = deadlineDate.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  const DRAW_STYLE_LABELS: Record<string, string> = {
    spin: "🎡 The Spin",
    drop: "🎯 The Drop",
    slot: "🎰 The Slot",
    roll: "🎲 The Roll",
    cage: "🏮 The Cage",
    deal: "🃏 The Deal",
  };

  const CONDITION_LABELS: Record<string, string> = {
    "A+": "A+ Mint",
    "A": "A Excellent",
    "B": "B Good",
    "C": "C Fair",
    "D": "D Poor",
    "F": "F For Parts",
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back */}
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
          ← Back to listings
        </a>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main content - left 2 cols */}
          <div className="md:col-span-2 space-y-6">

            {/* Title card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{waffle.title}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Listed by{" "}
                    <a href={`/profile/${waffle.chef?.username}`} className="text-orange-500 hover:underline font-medium">
                      {waffle.chef?.display_name || waffle.chef?.username}
                    </a>
                  </p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                  waffle.status === "active" ? "bg-green-100 text-green-700" :
                  waffle.status === "filled" ? "bg-blue-100 text-blue-700" :
                  waffle.status === "completed" ? "bg-gray-100 text-gray-600" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {waffle.status.charAt(0).toUpperCase() + waffle.status.slice(1)}
                </span>
              </div>

              {/* Fill progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{soldSeats} of {waffle.total_seats} seats filled</span>
                  <span className="font-medium text-gray-900">{fillPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-orange-400 h-2.5 rounded-full transition-all"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Item details */}
            {item && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Item details</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Condition</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {CONDITION_LABELS[item.condition] ?? item.condition}
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Est. value</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      ${(item.declared_value / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-0.5">New?</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {item.is_new ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{waffle.description}</p>
              </div>
            )}

            {/* Seat grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Pick your seat
                {!waffle.allow_seat_choice && (
                  <span className="ml-2 text-xs font-normal text-gray-400">(random assignment)</span>
                )}
              </h2>
              <SeatGrid
                seats={seats ?? []}
                totalSeats={waffle.total_seats}
                allowChoice={waffle.allow_seat_choice}
                seatPrice={waffle.seat_price}
                waffleId={waffle.id}
                waffleStatus={waffle.status}
                chefId={waffle.chef_id}
              />
            </div>

          </div>

          {/* Sidebar - right col */}
          <div className="space-y-4">

            {/* Price card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="text-3xl font-bold text-gray-900">
                ${(waffle.seat_price / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">per seat</div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total pot</span>
                  <span className="font-medium">${totalPot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Draw style</span>
                  <span className="font-medium">{DRAW_STYLE_LABELS[waffle.draw_style]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span className="font-medium">{deadlineStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">Included</span>
                </div>
              </div>

              <WaffleActions
                waffleId={waffle.id}
                chefId={waffle.chef_id}
                status={waffle.status}
                seatPrice={waffle.seat_price}
                totalSeats={waffle.total_seats}
                seatsSold={soldSeats}
              />
            </div>

            {/* Chef card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">The Chef</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                  {(waffle.chef?.display_name || waffle.chef?.username || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {waffle.chef?.display_name || waffle.chef?.username}
                  </div>
                  <div className="text-xs text-gray-400">
                    {"🧇".repeat(
                      waffle.chef?.stack_tier === "golden_stack" ? 5 :
                      waffle.chef?.stack_tier === "buttery_stack" ? 4 :
                      waffle.chef?.stack_tier === "rising_stack" ? 3 :
                      waffle.chef?.stack_tier === "fresh_stack" ? 2 : 1
                    )}
                    {" "}
                    {waffle.chef?.rep_score?.toFixed(1) ?? "0.0"} rep
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Escrow protected
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Provably fair draw
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Shipping included
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> Card held, not charged
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
