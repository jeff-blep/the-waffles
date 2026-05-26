"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

interface WaffleActionsProps {
  waffleId: string;
  chefId: string;
  status: string;
  seatPrice: number;
  totalSeats: number;
  seatsSold: number;
}

export default function WaffleActions({
  waffleId,
  chefId,
  status,
  seatPrice,
  totalSeats,
  seatsSold,
}: WaffleActionsProps) {
  const { authUser } = useUser();
  const router = useRouter();

  const isChef = authUser?.id === chefId;
  const isActive = status === "active";
  const fillPercent = totalSeats > 0 ? Math.round((seatsSold / totalSeats) * 100) : 0;
  const halfFilled = seatsSold >= Math.ceil(totalSeats * 0.5);
  const seatsRemaining = totalSeats - seatsSold;

  // Chef control panel
  if (isChef) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Chef controls
        </div>

        {/* Fill status */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Seats filled</span>
            <span className="font-semibold text-gray-900">{seatsSold} / {totalSeats}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-orange-400 h-1.5 rounded-full transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{fillPercent}% filled</span>
            <span>{seatsRemaining} seat{seatsRemaining !== 1 ? "s" : ""} remaining</span>
          </div>
        </div>

        {/* Start Mini button */}
        <div>
          <button
            type="button"
            disabled={!halfFilled || !isActive}
            onClick={() => {
              // Phase 2 - Mini Waffle creation flow
              alert("Mini Waffle creation coming in Phase 2!");
            }}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              halfFilled && isActive
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            🥞 Start a Mini Waffle
            {!halfFilled && (
              <span className="block text-xs font-normal mt-0.5 opacity-70">
                Available when 50% of seats are filled
              </span>
            )}
          </button>
          {!halfFilled && (
            <p className="text-xs text-gray-400 text-center mt-1.5">
              {Math.ceil(totalSeats * 0.5) - seatsSold} more seat{Math.ceil(totalSeats * 0.5) - seatsSold !== 1 ? "s" : ""} needed to unlock
            </p>
          )}
        </div>

        {/* Read-only notice */}
        <p className="text-xs text-gray-400 text-center">
          You cannot participate in your own Waffle.
        </p>
      </div>
    );
  }

  // Diner - not active
  if (!isActive) return null;

  // Diner - not logged in
  if (!authUser) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => router.push(`/auth/login?next=/listings/${waffleId}`)}
          className="w-full py-2.5 rounded-lg bg-orange-400 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
        >
          Sign in to buy seats
        </button>
      </div>
    );
  }

  // Diner - logged in
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs text-gray-400 text-center">
        Select seats in the grid below
      </p>
    </div>
  );
}
