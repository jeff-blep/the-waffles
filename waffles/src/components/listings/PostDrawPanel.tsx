"use client";

import { useIsChef } from "@/hooks/useIsChef";
import { useUser } from "@/hooks/useUser";
import PostDrawChef from "./PostDrawChef";
import PostDrawDiner from "./PostDrawDiner";

interface WinnerProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rep_score: number;
  stack_tier: string;
}

interface DrawRecord {
  random_org_request_id: string | null;
  audit_log_url: string | null;
  conducted_at: string;
}

interface PostDrawPanelProps {
  waffleId: string;
  chefId: string;
  status: string;
  winnerId: string | null;
  winnerSeatNumber: number | null;
  winnerPrivacy: string;
  drawnAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  totalPot: number;
  winnerProfile: WinnerProfile | null;
  drawRecord: DrawRecord | null;
}

export default function PostDrawPanel(props: PostDrawPanelProps) {
  const isChef = useIsChef(props.chefId);
  const { authUser } = useUser();
  const isWinner = !isChef && authUser?.id === props.winnerId;

  if (isChef) {
    return <PostDrawChef {...props} />;
  }
  return <PostDrawDiner {...props} isWinner={isWinner} viewerId={authUser?.id ?? null} />;
}
