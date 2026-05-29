"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";

const CARRIERS = [
  { value: "ups",   label: "UPS"   },
  { value: "fedex", label: "FedEx" },
  { value: "usps",  label: "USPS"  },
];

const STACK_EMOJIS: Record<string, number> = {
  short_stack: 1, fresh_stack: 2, rising_stack: 3, buttery_stack: 4, golden_stack: 5,
};

const TIMELINE_STEPS = [
  { key: "drawn",     label: "Draw complete" },
  { key: "shipped",   label: "Shipped"       },
  { key: "delivered", label: "Delivered"     },
  { key: "verified",  label: "Verified"      },
  { key: "completed", label: "Funds released"},
];

function daysUntil(dateStr: string | null, offsetDays: number): number {
  if (!dateStr) return offsetDays;
  const deadline = new Date(dateStr).getTime() + offsetDays * 86400000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 86400000));
}

function currentStepIndex(status: string): number {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

interface WinnerProfile {
  id: string; username: string; display_name: string | null;
  avatar_url: string | null; rep_score: number; stack_tier: string;
}

interface Props {
  waffleId: string;
  status: string;
  winnerId: string | null;
  winnerSeatNumber: number | null;
  drawnAt: string | null;
  shippedAt: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  totalPot: number;
  winnerProfile: WinnerProfile | null;
  [key: string]: unknown;
}

export default function PostDrawChef({ waffleId, status, winnerSeatNumber, drawnAt, shippedAt, trackingNumber: initialTracking, shippingCarrier: initialCarrier, totalPot, winnerProfile }: Props) {
  const supabase = createClient();
  const [carrier, setCarrier] = useState(initialCarrier ?? "ups");
  const [tracking, setTracking] = useState(initialTracking ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const daysLeft = daysUntil(drawnAt, 10);
  const deadlineUrgency = daysLeft <= 2 ? "text-red-600" : daysLeft <= 5 ? "text-amber-500" : "text-gray-700";
  const stepIdx = currentStepIndex(status);
  const canShip = status === "drawn";

  async function handleShip() {
    if (!tracking.trim()) { setSaveError("Please enter a tracking number."); return; }
    setSaving(true); setSaveError(null);
    const { error } = await supabase
      .from("waffles")
      .update({
        status: "shipped",
        shipping_carrier: carrier as "ups" | "fedex" | "usps",
        tracking_number: tracking.trim(),
        shipped_at: new Date().toISOString(),
      })
      .eq("id", waffleId);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    setSaved(true);
    window.location.reload();
  }

  return (
    <div className="space-y-4">

      {/* Winner reveal */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎉</span>
          <h2 className="text-base font-semibold text-gray-900">The Draw is done!</h2>
        </div>

        {winnerProfile ? (
          <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <Avatar profile={winnerProfile} size="lg" />
            <div>
              <div className="font-bold text-gray-900 text-lg">
                {winnerProfile.display_name || winnerProfile.username}
              </div>
              <div className="text-sm text-gray-500">@{winnerProfile.username}</div>
              <div className="flex items-center gap-2 mt-1">
                <span>{"🧇".repeat(STACK_EMOJIS[winnerProfile.stack_tier] ?? 1)}</span>
                <span className="text-xs text-gray-400">{winnerProfile.rep_score.toFixed(1)} rep</span>
                {winnerSeatNumber && (
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                    Seat #{winnerSeatNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-400">Winner info unavailable</div>
        )}
      </div>

      {/* Shipping action */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {canShip ? "Add tracking" : "Shipping info"}
          </h2>
          {drawnAt && (
            <div className="text-right">
              <div className={`text-lg font-bold ${deadlineUrgency}`}>{daysLeft}d</div>
              <div className="text-xs text-gray-400">to ship</div>
            </div>
          )}
        </div>

        {drawnAt && (
          <div className={`text-xs px-3 py-2 rounded-lg ${
            daysLeft <= 2 ? "bg-red-50 text-red-600 border border-red-200" :
            daysLeft <= 5 ? "bg-amber-50 text-amber-600 border border-amber-200" :
            "bg-gray-50 text-gray-500"
          }`}>
            Ship by {new Date(new Date(drawnAt).getTime() + 10 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric" })} — day 15 without tracking triggers automatic void and full refunds.
          </div>
        )}

        {canShip ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
              <div className="flex gap-2">
                {CARRIERS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCarrier(c.value)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      carrier === c.value
                        ? "border-orange-400 bg-orange-50 text-orange-800"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking number</label>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. 1Z999AA10123456784"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {saveError && <p className="text-xs text-red-500">{saveError}</p>}

            <button
              type="button"
              onClick={handleShip}
              disabled={saving || saved}
              className="w-full py-2.5 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "📦 Mark as shipped"}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Carrier</span>
              <span className="font-medium capitalize">{initialCarrier?.toUpperCase() ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking</span>
              <span className="font-medium font-mono text-xs">{initialTracking ?? "—"}</span>
            </div>
            {shippedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Shipped</span>
                <span className="font-medium">{new Date(shippedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Escrow status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Escrow</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Funds in escrow</span>
          <span className="font-semibold text-green-600">
            ${totalPot.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Funds are held in escrow and release automatically when the winner marks delivery as verified, or after 20 days from the draw — whichever comes first.
        </p>
      </div>

      {/* Transaction timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="relative">
          {TIMELINE_STEPS.map((step, i) => {
            const done = i < stepIdx;
            const current = i === stepIdx;
            return (
              <div key={step.key} className="flex items-start gap-3 mb-4 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    done    ? "bg-green-500 text-white" :
                    current ? "bg-orange-400 text-white" :
                              "bg-gray-100 text-gray-400"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${done ? "bg-green-300" : "bg-gray-100"}`} />
                  )}
                </div>
                <div className="pt-1">
                  <div className={`text-sm font-medium ${current ? "text-orange-600" : done ? "text-gray-700" : "text-gray-400"}`}>
                    {step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
