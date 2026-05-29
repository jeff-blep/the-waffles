import Link from "next/link";

const CATEGORY_EMOJI: Record<string, string> = {
  "Collectibles":          "🎖️",
  "Electronics":           "💻",
  "Firearms & Ammo":       "🔫",
  "Jewelry & Watches":     "💎",
  "Sports & Outdoors":     "⛺",
  "Tools & Equipment":     "🔧",
  "Toys & Games":          "🎮",
  "Fashion & Accessories": "👗",
  "Art & Antiques":        "🎨",
  "Gift Cards & Vouchers": "🎁",
  "Event Tickets":         "🎟️",
  "Other":                 "📦",
};

const TIER_EMOJI: Record<string, string> = {
  golden_stack:  "🧇🧇🧇🧇🧇",
  buttery_stack: "🧇🧇🧇🧇",
  rising_stack:  "🧇🧇🧇",
  fresh_stack:   "🧇🧇",
  short_stack:   "🧇",
};

export interface ListingCardData {
  id: string;
  title: string;
  category: string;
  seat_price: number;
  total_seats: number;
  total_pot: number | null;
  deadline: string;
  waffle_items: Array<{ photo_urls: string[] | null; declared_value: number }> | null;
  chef: { username: string; display_name: string | null; stack_tier: string } | null;
  seats_sold: number;
}

export default function ListingCard({
  id, title, category, seat_price, total_seats, total_pot,
  waffle_items, chef, seats_sold,
}: ListingCardData) {
  const photo = waffle_items?.[0]?.photo_urls?.[0] ?? null;
  const fillPercent = total_seats > 0 ? Math.round((seats_sold / total_seats) * 100) : 0;
  const seatsLeft = total_seats - seats_sold;
  const categoryEmoji = CATEGORY_EMOJI[category] ?? "📦";
  const tierEmoji = TIER_EMOJI[chef?.stack_tier ?? "short_stack"] ?? "🧇";

  return (
    <Link
      href={`/listings/${id}`}
      className="group block bg-white rounded-waffle shadow-card hover:shadow-raised transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="h-44 bg-amber-50 flex items-center justify-center overflow-hidden relative">
        {photo ? (
          <img
            src={photo}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl select-none">{categoryEmoji}</span>
        )}
        {/* Seats-left badge */}
        {seatsLeft <= 5 && seatsLeft > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
            {seatsLeft} left!
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Category */}
        <span className="inline-block text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
          {categoryEmoji} {category}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 -mt-1">
          {title}
        </h3>

        {/* Chef */}
        <p className="text-xs text-gray-400">
          {tierEmoji} by {chef?.display_name || chef?.username || "Unknown Chef"}
        </p>

        {/* Fill progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{seats_sold} / {total_seats} seats</span>
            <span className="font-semibold text-gray-900">{fillPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-orange-400 h-1.5 rounded-full"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ${(seat_price / 100).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 ml-1">/ seat</span>
          </div>
          <span className="text-xs font-medium text-gray-500">
            Prize: ${((waffle_items?.[0]?.declared_value ?? 0) / 100).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
