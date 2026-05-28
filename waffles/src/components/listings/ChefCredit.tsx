"use client";

import { useState } from "react";
import { useIsChef } from "@/hooks/useIsChef";
import Avatar from "@/components/ui/Avatar";

interface ChefProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rep_score: number;
  stack_tier: string;
}

const STACK_EMOJIS: Record<string, number> = {
  short_stack: 1,
  fresh_stack: 2,
  rising_stack: 3,
  buttery_stack: 4,
  golden_stack: 5,
};

export default function ChefCredit({
  chef,
  chefId,
}: {
  chef: ChefProfile;
  chefId: string;
}) {
  const isViewerChef = useIsChef(chefId);
  const [modalOpen, setModalOpen] = useState(false);

  if (isViewerChef) {
    return (
      <p className="text-gray-500 text-sm mt-1">
        Listed by <span className="font-medium text-gray-700">you</span>
      </p>
    );
  }

  return (
    <>
      <p className="text-gray-500 text-sm mt-1">
        Listed by{" "}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-orange-500 hover:underline font-medium"
        >
          {chef.display_name || chef.username}
        </button>
      </p>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-72 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>

            <div className="flex flex-col items-center text-center gap-2">
              <Avatar profile={chef} size="lg" />

              <div>
                <div className="font-semibold text-gray-900 text-base">
                  {chef.display_name || chef.username}
                </div>
                <div className="text-xs text-gray-400">@{chef.username}</div>
              </div>

              <div className="text-lg">
                {"🧇".repeat(STACK_EMOJIS[chef.stack_tier] ?? 1)}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{chef.rep_score.toFixed(1)}</span>
                <span>rep</span>
              </div>

              <div className="mt-1 px-3 py-1.5 bg-orange-50 rounded-full text-xs text-orange-600 font-medium">
                Chef
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
