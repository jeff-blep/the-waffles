"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";

interface Seat {
  id: string;
  seat_number: number;
  status: string;
  holder_id: string | null;
}

interface SeatGridProps {
  seats: Seat[];
  totalSeats: number;
  allowChoice: boolean;
  seatPrice: number;
  waffleId: string;
  waffleStatus: string;
  chefId: string;
}

export default function SeatGrid({
  seats,
  totalSeats,
  allowChoice,
  seatPrice,
  waffleId,
  waffleStatus,
  chefId,
}: SeatGridProps) {
  const { authUser } = useUser();
  const [selected, setSelected] = useState<number[]>([]);

  const seatMap = new Map(seats.map((s) => [s.seat_number, s]));
  const isActive = waffleStatus === "active";
  const isChef = authUser?.id === chefId;

  function toggleSeat(num: number) {
    if (isChef || !allowChoice || !isActive) return;
    const seat = seatMap.get(num);
    if (seat && seat.status !== "available") return;
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  }

  function getSeatStyle(num: number): string {
    const seat = seatMap.get(num);
    const isTaken = seat && seat.status !== "available";
    const isMine = seat?.holder_id === authUser?.id && !isChef;
    const isSelectedByMe = selected.includes(num);

    if (isMine)         return "bg-blue-100 border-blue-300 text-blue-700 cursor-default";
    if (isTaken)        return "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";
    if (isSelectedByMe) return "bg-orange-400 border-orange-500 text-white scale-105 cursor-pointer";
    if (isChef)         return "bg-white border-gray-200 text-gray-500 cursor-default";
    return "bg-white border-gray-200 text-gray-700 hover:border-orange-300 cursor-pointer";
  }

  const totalSelected = selected.length;
  const totalCost = (totalSelected * seatPrice) / 100;

  const cols =
    totalSeats <= 20  ? "grid-cols-5" :
    totalSeats <= 100 ? "grid-cols-10" :
                        "grid-cols-10";

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-gray-200 bg-white" />
          Available
        </div>
        {!isChef && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-orange-500 bg-orange-400" />
            Selected
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-gray-200 bg-gray-100" />
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
          You are viewing this as the Chef. Seat selection is disabled.
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${cols} gap-1.5`}>
        {Array.from({ length: totalSeats }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => toggleSeat(num)}
            disabled={isChef || !isActive || seatMap.get(num)?.status !== "available"}
            className={`
              aspect-square rounded border text-xs font-medium transition-all
              ${getSeatStyle(num)}
            `}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Selection summary + checkout - diners only */}
      {isActive && !isChef && selected.length > 0 && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-700">
              {totalSelected} seat{totalSelected > 1 ? "s" : ""} selected
            </span>
            <span className="font-semibold text-gray-900">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected([])}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Sandbox mode: Would checkout ${totalSelected} seat(s) for $${totalCost.toFixed(2)}\nSeats: ${selected.join(", ")}`);
              }}
              className="flex-grow py-2 rounded-lg bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
            >
              Reserve {totalSelected} seat{totalSelected > 1 ? "s" : ""} - ${totalCost.toFixed(2)}
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
          This Waffle is {waffleStatus} - seats are no longer available.
        </p>
      )}
    </div>
  );
}
