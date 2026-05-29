"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useIsChef } from "@/hooks/useIsChef";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";

interface Seat {
  id: string;
  seat_number: number;
  status: string;
  holder_id: string | null;
}

interface HolderProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rep_score: number;
  stack_tier: string;
}

interface SeatGridProps {
  seats: Seat[];
  totalSeats: number;
  allowChoice: boolean;
  seatPrice: number;
  waffleId: string;
  waffleStatus: string;
  chefId: string;
  holderProfiles: Record<string, HolderProfile>;
}

const STACK_EMOJIS: Record<string, number> = {
  short_stack: 1,
  fresh_stack: 2,
  rising_stack: 3,
  buttery_stack: 4,
  golden_stack: 5,
};

export default function SeatGrid({
  seats,
  totalSeats,
  allowChoice,
  seatPrice,
  waffleId,
  waffleStatus,
  chefId,
  holderProfiles,
}: SeatGridProps) {
  const { authUser } = useUser();
  const isChef = useIsChef(chefId);
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<number[] | null>(null);
  const [modalData, setModalData] = useState<{ profile: HolderProfile; seatNum: number } | null>(null);

  const seatMap = new Map(seats.map((s) => [s.seat_number, s]));
  const isActive = waffleStatus === "active";

  async function handleClaim() {
    if (claiming) return;
    setClaiming(true);
    setClaimError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)("claim_seats", {
      p_waffle_id:    waffleId,
      p_seat_numbers: allowChoice ? selected : [],
      p_quantity:     allowChoice ? 0 : quantity,
    }) as { data: { claimed_seats: number[]; waffle_filled: boolean } | null; error: { message: string } | null };

    setClaiming(false);

    if (error) {
      setClaimError(error.message);
      return;
    }

    setClaimSuccess(data?.claimed_seats ?? []);
    setSelected([]);
    router.refresh();
  }

  function handleSeatClick(num: number) {
    const seat = seatMap.get(num);
    const isTaken = seat && seat.status !== "available";

    // Taken seat with a known profile → open modal
    if (isTaken && seat.holder_id && holderProfiles[seat.holder_id]) {
      setModalData({ profile: holderProfiles[seat.holder_id], seatNum: num });
      return;
    }

    // Available seat — chef can't pick, respect allowChoice
    if (isChef || !allowChoice || !isActive) return;
    if (isTaken) return;

    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  }

  function getSeatStyle(num: number): string {
    const seat = seatMap.get(num);
    const isTaken = seat && seat.status !== "available";
    const isMine = seat?.holder_id === authUser?.id && !isChef;
    const isSelectedByMe = selected.includes(num);

    if (isMine)          return "bg-blue-100 border-blue-300 text-blue-700 cursor-default";
    if (isTaken)         return "bg-gray-300 border-gray-400 text-gray-500 cursor-pointer";
    if (isSelectedByMe)  return "bg-orange-400 border-orange-500 text-white scale-105 cursor-pointer";
    if (isChef)          return "bg-green-50 border-green-300 text-green-700 cursor-default";
    return "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 cursor-pointer";
  }

  function renderSeatContent(num: number) {
    const seat = seatMap.get(num);
    const isTaken = seat && seat.status !== "available";
    const holderId = seat?.holder_id;
    const profile = holderId ? holderProfiles[holderId] : null;

    if (isTaken && profile) {
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Avatar profile={profile} size="sm" />
          <span className="text-[9px] font-medium leading-none">{num}</span>
        </div>
      );
    }

    return <span className="text-xs font-medium">{num}</span>;
  }

  const totalSelected = selected.length;
  const totalCost = (totalSelected * seatPrice) / 100;

  const cols =
    totalSeats <= 20  ? "grid-cols-5" :
    totalSeats <= 100 ? "grid-cols-10" :
                        "grid-cols-10";

  return (
    <div>
      {/* Success banner */}
      {claimSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 flex items-start gap-2">
          <span className="text-green-500 mt-0.5">✓</span>
          <div>
            <span className="font-semibold">Seats reserved!</span>
            {" "}Seat{claimSuccess.length > 1 ? "s" : ""}{" "}
            {claimSuccess.sort((a, b) => a - b).join(", ")} are yours.
            <span className="block text-xs text-green-600 mt-0.5">
              In Phase 1 these are sandbox holds — real payment auth comes in Phase 2.
            </span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {claimError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{claimError}</span>
        </div>
      )}

      {/* Context-aware heading */}
      {isChef ? (
        <h2 className="text-base font-semibold text-gray-900 mb-4">Seat status</h2>
      ) : isActive ? (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            {allowChoice ? "Select your seat" : "Seat map"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {allowChoice
              ? "Tap any open seat to select it — you can pick multiple. Each seat is one entry in The Draw."
              : "Seats are randomly assigned — pick how many you want below."}
          </p>
        </div>
      ) : (
        <h2 className="text-base font-semibold text-gray-900 mb-4">Seats</h2>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-green-300 bg-green-50" />
          Available
        </div>
        {!isChef && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-orange-500 bg-orange-400" />
            Selected
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-gray-400 bg-gray-300" />
          Taken
        </div>
        {authUser && !isChef && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-blue-300 bg-blue-100" />
            Yours
          </div>
        )}
      </div>

      {/* Chef view-only notice */}
      {isChef && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          You are viewing this Waffle as the Chef.
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${cols} gap-1.5`}>
        {Array.from({ length: totalSeats }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleSeatClick(num)}
            className={`aspect-square rounded border transition-all flex items-center justify-center ${getSeatStyle(num)}`}
          >
            {renderSeatContent(num)}
          </button>
        ))}
      </div>

      {/* Random quantity picker — shown when allowChoice is false */}
      {isActive && !isChef && authUser && !allowChoice && !claimSuccess && (
        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">How many seats?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm flex items-center justify-center"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(seats.filter(s => s.status === "available").length, q + 1))}
                className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm border-t border-orange-200 pt-2">
            <span className="text-gray-600">{quantity} seat{quantity > 1 ? "s" : ""} × ${(seatPrice / 100).toFixed(2)}</span>
            <span className="font-semibold text-gray-900">${((quantity * seatPrice) / 100).toFixed(2)}</span>
          </div>
          {claimError && (
            <p className="text-xs text-red-600">{claimError}</p>
          )}
          <button
            type="button"
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-2.5 rounded-lg bg-orange-400 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {claiming ? "Reserving…" : `Reserve ${quantity} seat${quantity > 1 ? "s" : ""} — $${((quantity * seatPrice) / 100).toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Specific seat selection summary + checkout */}
      {isActive && !isChef && allowChoice && selected.length > 0 && !claimSuccess && (
        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-700">
              {totalSelected} seat{totalSelected > 1 ? "s" : ""} selected
            </span>
            <span className="font-semibold text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
          {claimError && (
            <p className="text-xs text-red-600 mb-2">{claimError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSelected([]); setClaimError(null); }}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming}
              className="flex-grow py-2 rounded-lg bg-orange-400 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              {claiming ? "Reserving…" : `Reserve ${totalSelected} seat${totalSelected > 1 ? "s" : ""} — $${totalCost.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}

      {isActive && !isChef && !authUser && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          <a href="/auth/login" className="text-orange-500 hover:underline">Sign in</a> to reserve seats.
        </p>
      )}

      {!isActive && !isChef && (
        <p className="mt-4 text-sm text-gray-400 text-center">
          This Waffle is {waffleStatus} — seats are no longer available.
        </p>
      )}

      {/* Seat holder profile modal */}
      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalData(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-72 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalData(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center gap-2">
              <Avatar profile={modalData.profile} size="lg" />

              <div>
                <div className="font-semibold text-gray-900 text-base">
                  {modalData.profile.display_name || modalData.profile.username}
                </div>
                <div className="text-xs text-gray-400">@{modalData.profile.username}</div>
              </div>

              <div className="text-lg">
                {"🧇".repeat(STACK_EMOJIS[modalData.profile.stack_tier] ?? 1)}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{modalData.profile.rep_score.toFixed(1)}</span>
                <span>rep</span>
              </div>

              <div className="mt-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                Holding seat #{modalData.seatNum}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
