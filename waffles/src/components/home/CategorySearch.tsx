"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  { label: "All",                  emoji: "✨", value: "" },
  { label: "Collectibles",         emoji: "🎖️", value: "Collectibles" },
  { label: "Electronics",          emoji: "💻", value: "Electronics" },
  { label: "Jewelry & Watches",    emoji: "💎", value: "Jewelry & Watches" },
  { label: "Sports & Outdoors",    emoji: "⛺", value: "Sports & Outdoors" },
  { label: "Tools & Equipment",    emoji: "🔧", value: "Tools & Equipment" },
  { label: "Toys & Games",         emoji: "🎮", value: "Toys & Games" },
  { label: "Fashion & Accessories",emoji: "👗", value: "Fashion & Accessories" },
  { label: "Art & Antiques",       emoji: "🎨", value: "Art & Antiques" },
  { label: "Gift Cards & Vouchers",emoji: "🎁", value: "Gift Cards & Vouchers" },
  { label: "Event Tickets",        emoji: "🎟️", value: "Event Tickets" },
  { label: "Other",                emoji: "📦", value: "Other" },
];

interface Props {
  currentCategory: string;
  currentQuery: string;
}

export default function CategorySearch({ currentCategory, currentQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(currentQuery);

  function navigate(category: string, q: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    const search = params.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}#browse`);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); navigate(currentCategory, query); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Waffles..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-waffle-orange hover:bg-orange-500 text-white text-sm font-medium rounded-full transition-colors"
        >
          Search
        </button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => navigate(cat.value, query)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              currentCategory === cat.value
                ? "bg-orange-400 text-white border-orange-400"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            <span>{cat.emoji}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
