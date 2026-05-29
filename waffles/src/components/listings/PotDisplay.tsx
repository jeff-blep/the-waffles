"use client";

import { useIsChef } from "@/hooks/useIsChef";

export default function PotDisplay({
  chefId,
  totalPot,
  declaredValue,
}: {
  chefId: string;
  totalPot: number;
  declaredValue: number;
}) {
  const isChef = useIsChef(chefId);
  const label = isChef ? "Seat revenue" : "Item value";
  const value = isChef ? totalPot : declaredValue / 100;

  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">
        ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
