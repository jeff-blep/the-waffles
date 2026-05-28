import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SeatGrid from "@/components/listings/SeatGrid";
import WaffleActions from "@/components/listings/WaffleActions";
import ChefCredit from "@/components/listings/ChefCredit";
import PotDisplay from "@/components/listings/PotDisplay";
import ShippingDisplay from "@/components/listings/ShippingDisplay";
import PostDrawPanel from "@/components/listings/PostDrawPanel";
import DevViewToggle from "@/components/dev/DevViewToggle";

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

  // Fetch profiles for everyone currently holding a seat
  const holderIds = [...new Set(
    seats?.filter((s) => s.holder_id).map((s) => s.holder_id as string) ?? []
  )];
  let holderProfiles: Record<string, { id: string; username: string; display_name: string | null; avatar_url: string | null; rep_score: number; stack_tier: string }> = {};
  if (holderIds.length > 0) {
    const { data: profiles } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, rep_score, stack_tier")
      .in("id", holderIds);
    if (profiles) {
      holderProfiles = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  // Fetch winner profile if draw has happened
  const postDrawStatuses = ["drawn","shipped","delivered","verified","completed","disputed"];
  const isPostDraw = postDrawStatuses.includes(waffle.status);

  let winnerProfile: { id: string; username: string; display_name: string | null; avatar_url: string | null; rep_score: number; stack_tier: string } | null = null;
  if (isPostDraw && waffle.winner_id) {
    const { data: wp } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, rep_score, stack_tier")
      .eq("id", waffle.winner_id)
      .single();
    winnerProfile = wp ?? null;
  }

  // Fetch draw record for audit info
  let drawRecord: { random_org_request_id: string | null; audit_log_url: string | null; conducted_at: string } | null = null;
  if (isPostDraw) {
    const { data: dr } = await supabase
      .from("draws")
      .select("random_org_request_id, audit_log_url, conducted_at")
      .eq("waffle_id", id)
      .single();
    drawRecord = dr ?? null;
  }

  const soldSeats = seats?.filter((s) => s.status !== "available").length ?? 0;
  const fillPercent = Math.round((soldSeats / waffle.total_seats) * 100);
  const totalPot = (waffle.seat_price * waffle.total_seats) / 100;
  const item = waffle.waffle_items?.[0];

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isViewerChef = currentUser?.id === waffle.chef_id;

  const deadlineDate = new Date(waffle.deadline);
  const deadlineStr = deadlineDate.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  const DRAW_STYLE_LABELS: Record<string, string> = {
    spin: "🎡 The Spin",
    drop: "🎯 The Drop",
    cage: "🏮 The Lotto",
  };

  const CONDITION_INFO: Record<string, { grade: string; name: string; description: string }> = {
    "A+": { grade: "A+",  name: "Mint",           description: "Brand new, never used, original packaging" },
    "A":  { grade: "A",   name: "Excellent",       description: "Like new, minimal signs of handling" },
    "B":  { grade: "B",   name: "Good",            description: "Light use, minor wear, fully functional" },
    "C":  { grade: "C",   name: "Fair",            description: "Noticeable wear, fully functional" },
    "D":  { grade: "D",   name: "Poor",            description: "Heavy wear or minor damage, functional" },
    "F":  { grade: "N/A", name: "Not Applicable",  description: "Condition doesn't apply — tickets, gift cards, digital items, etc." },
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
                  {waffle.chef && (
                    <ChefCredit chef={waffle.chef} chefId={waffle.chef_id} />
                  )}
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

                {item.photo_urls?.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                    <img
                      src={item.photo_urls[0]}
                      alt={item.title}
                      className="w-full max-h-72 object-contain bg-gray-50"
                    />
                    {item.photo_urls.length > 1 && (
                      <div className="flex gap-2 p-2 overflow-x-auto">
                        {item.photo_urls.slice(1).map((url: string, i: number) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Photo ${i + 2}`}
                            className="h-16 w-16 object-cover rounded border border-gray-200 shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(() => {
                  const cond = CONDITION_INFO[item.condition];
                  return (
                    <div className="w-fit flex items-start gap-3 mb-4 px-3 py-3 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-orange-200 text-orange-800 shrink-0 mt-0.5">
                        {cond?.grade ?? item.condition}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">{cond?.name ?? item.condition}</span>
                          {item.is_new && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Brand new</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-snug">{cond?.description}</div>
                      </div>
                    </div>
                  );
                })()}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-gray-600 text-sm leading-relaxed">{waffle.description}</p>
              </div>
            )}

            {/* Seat grid (active only) or post-draw panel */}
            {isPostDraw ? (
              <PostDrawPanel
                waffleId={waffle.id}
                chefId={waffle.chef_id}
                status={waffle.status}
                winnerId={waffle.winner_id}
                winnerSeatNumber={waffle.winner_seat_number}
                winnerPrivacy={waffle.winner_privacy}
                drawnAt={waffle.drawn_at}
                shippedAt={waffle.shipped_at}
                deliveredAt={waffle.delivered_at}
                trackingNumber={waffle.tracking_number}
                shippingCarrier={waffle.shipping_carrier}
                totalPot={totalPot}
                winnerProfile={winnerProfile}
                drawRecord={drawRecord}
              />
            ) : waffle.status === "filled" ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center space-y-2">
                <div className="text-3xl">🎰</div>
                <h2 className="text-base font-semibold text-gray-900">All seats filled — draw pending</h2>
                <p className="text-sm text-gray-500">The draw will be conducted shortly. Stay tuned!</p>
              </div>
            ) : waffle.status === "voided" ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center space-y-2">
                <div className="text-3xl">❌</div>
                <h2 className="text-base font-semibold text-gray-900">This Waffle has been voided</h2>
                <p className="text-sm text-gray-500">All pre-authorizations have been released. No one was charged.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <SeatGrid
                  seats={seats ?? []}
                  totalSeats={waffle.total_seats}
                  allowChoice={waffle.allow_seat_choice}
                  seatPrice={waffle.seat_price}
                  waffleId={waffle.id}
                  waffleStatus={waffle.status}
                  chefId={waffle.chef_id}
                  holderProfiles={holderProfiles}
                />
              </div>
            )}

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
                <PotDisplay
                  chefId={waffle.chef_id}
                  totalPot={totalPot}
                  declaredValue={item?.declared_value ?? 0}
                />
                <div className="flex justify-between">
                  <span className="text-gray-500">Draw style</span>
                  <span className="font-medium">{DRAW_STYLE_LABELS[waffle.draw_style]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span className="font-medium">{deadlineStr}</span>
                </div>
                <ShippingDisplay
                  chefId={waffle.chef_id}
                  shippingMethod={waffle.shipping_method}
                />
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
      <DevViewToggle />
    </div>
  );
}
