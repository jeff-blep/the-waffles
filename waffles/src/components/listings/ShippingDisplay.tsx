"use client";

import { useIsChef } from "@/hooks/useIsChef";

const LABELS: Record<string, { emoji: string; chef: string; diner: string }> = {
  ship:       { emoji: "📦", chef: "Ship to winner",       diner: "Ships to you"         },
  meetup:     { emoji: "🤝", chef: "Local meetup",         diner: "Local pickup"          },
  ffl:        { emoji: "📦", chef: "Ship to winner's FFL", diner: "Ships to your FFL"     },
  ffl_meetup: { emoji: "🤝", chef: "Meet at FFL dealer",   diner: "Meet at FFL dealer"    },
};

export default function ShippingDisplay({
  chefId,
  shippingMethod,
}: {
  chefId: string;
  shippingMethod: string;
}) {
  const isChef = useIsChef(chefId);
  const info = LABELS[shippingMethod] ?? { emoji: "📦", chef: shippingMethod, diner: shippingMethod };
  const label = isChef ? info.chef : info.diner;

  return (
    <div className="flex justify-between">
      <span className="text-gray-500">Shipping</span>
      <span className="font-medium">{info.emoji} {label}</span>
    </div>
  );
}
