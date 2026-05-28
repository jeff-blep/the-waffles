"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";

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

function currentStepIndex(status: string): number {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

interface WinnerProfile {
  id: string; username: string; display_name: string | null;
  avatar_url: string | null; rep_score: number; stack_tier: string;
}

interface DrawRecord {
  random_org_request_id: string | null;
  audit_log_url: string | null;
  conducted_at: string;
}

interface Props {
  waffleId: string;
  status: string;
  winnerId: string | null;
  winnerSeatNumber: number | null;
  winnerPrivacy: string;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  winnerProfile: WinnerProfile | null;
  drawRecord: DrawRecord | null;
  isWinner: boolean;
  viewerId: string | null;
  [key: string]: unknown;
}

export default function PostDrawDiner({
  waffleId, status, winnerSeatNumber, winnerPrivacy,
  trackingNumber, shippingCarrier, shippedAt, deliveredAt,
  winnerProfile, drawRecord, isWinner,
}: Props) {
  const supabase = createClient();
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const stepIdx = currentStepIndex(status);
  const canVerify = isWinner && status === "delivered";

  async function handleVerify() {
    setVerifying(true); setVerifyError(null);
    const { error } = await supabase
      .from("waffles")
      .update({ status: "verified" })
      .eq("id", waffleId);
    setVerifying(false);
    if (error) { setVerifyError(error.message); return; }
    window.location.reload();
  }

  // Determine how much of the winner to show based on privacy setting
  const showFullWinner  = winnerPrivacy === "public"  || isWinner;
  const showPartialWinner = winnerPrivacy === "partial" || showFullWinner;

  return (
    <div className="space-y-4">

      {/* Winner announcement */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-base font-semibold text-gray-900">
            {isWinner ? "You won! 🎉" : "Draw complete — we have a winner"}
          </h2>
        </div>

        {isWinner && (
          <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800 font-medium">
            Congratulations! You're getting this item. The Chef will ship it within 10 days — keep an eye on this page for tracking info.
          </div>
        )}

        {showFullWinner && winnerProfile ? (
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Avatar profile={winnerProfile} size="md" />
            <div>
              <div className="font-semibold text-gray-900">
                {winnerProfile.display_name || winnerProfile.username}
              </div>
              <div className="text-xs text-gray-500">@{winnerProfile.username}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">{"🧇".repeat(STACK_EMOJIS[winnerProfile.stack_tier] ?? 1)}</span>
                {winnerSeatNumber && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    Seat #{winnerSeatNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : showPartialWinner ? (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-gray-600">
            @{winnerProfile?.username ?? "winner"} won
            {winnerSeatNumber ? ` — Seat #${winnerSeatNumber}` : ""}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-400">
            The winner has chosen to keep their identity private.
          </div>
        )}
      </div>

      {/* Shipping status */}
      {(trackingNumber || status !== "drawn") && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Shipping</h2>
          {trackingNumber ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Carrier</span>
                <span className="font-medium">{shippingCarrier?.toUpperCase() ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking</span>
                <span className="font-mono text-xs font-medium">{trackingNumber}</span>
              </div>
              {shippedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipped</span>
                  <span className="font-medium">{new Date(shippedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              )}
              {deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span className="font-medium text-green-600">{new Date(deliveredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Tracking info will appear here once the Chef ships the item.</p>
          )}

          {/* Winner verify button */}
          {canVerify && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Received your item? Let the platform know so funds are released to the Chef.</p>
              {verifyError && <p className="text-xs text-red-500 mb-2">{verifyError}</p>}
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {verifying ? "Verifying..." : "✓ I received this item"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Draw audit */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Verify the draw</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          This draw was conducted using RANDOM.ORG's certified true random number generator. The result is cryptographically signed and independently verifiable.
        </p>

        {drawRecord?.random_org_request_id ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Audit ID</span>
              <span className="font-mono text-xs">{drawRecord.random_org_request_id}</span>
            </div>
            {drawRecord.audit_log_url && (
              <a
                href={drawRecord.audit_log_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 rounded-lg border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                🔍 Verify on RANDOM.ORG →
              </a>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">
            Draw audit record will appear here after the draw engine is integrated
          </div>
        )}

        {drawRecord?.conducted_at && (
          <p className="text-xs text-gray-400">
            Draw conducted {new Date(drawRecord.conducted_at).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      {/* Timeline */}
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
