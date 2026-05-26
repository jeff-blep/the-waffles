"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Seat {
  id: string;
  seat_number: number;
  status: string;
  holder_id: string | null;
}

interface UseWaffleReturn {
  waffle: Record<string, unknown> | null;
  seats: Seat[];
  loading: boolean;
  error: string | null;
  soldCount: number;
  fillPercent: number;
}

export function useWaffle(waffleId: string): UseWaffleReturn {
  const supabase = createClient();
  const [waffle, setWaffle] = useState<Record<string, unknown> | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!waffleId) return;

    async function fetchData() {
      const { data: waffleData, error: waffleErr } = await supabase
        .from("waffles")
        .select("*, waffle_items(*)")
        .eq("id", waffleId)
        .single();

      if (waffleErr) {
        setError(waffleErr.message);
        setLoading(false);
        return;
      }

      setWaffle(waffleData);

      const { data: seatData } = await supabase
        .from("seats")
        .select("*")
        .eq("waffle_id", waffleId)
        .order("seat_number");

      setSeats((seatData as Seat[]) ?? []);
      setLoading(false);
    }

    fetchData();

    // Realtime subscription for seat updates
    const channel = supabase
      .channel(`waffle-seats-${waffleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `waffle_id=eq.${waffleId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setSeats((prev) =>
              prev.map((s) =>
                s.id === (payload.new as Seat).id ? (payload.new as Seat) : s
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [waffleId]);

  const soldCount = seats.filter((s) => s.status !== "available").length;
  const totalSeats = (waffle?.total_seats as number) ?? 0;
  const fillPercent = totalSeats > 0 ? Math.round((soldCount / totalSeats) * 100) : 0;

  return { waffle, seats, loading, error, soldCount, fillPercent };
}
