"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import type { ItemCondition, DrawStyle } from "@/types";

const CATEGORIES = [
  "Collectibles",
  "Electronics",
  "Firearms & Ammo",
  "Jewelry & Watches",
  "Sports & Outdoors",
  "Tools & Equipment",
  "Toys & Games",
  "Fashion & Accessories",
  "Art & Antiques",
  "Gift Cards & Vouchers",
  "Event Tickets",
  "Other",
];

const CONDITIONS: { value: ItemCondition; grade: string; name: string; description: string }[] = [
  { value: "A+", grade: "A+", name: "Mint",        description: "Brand new, never used, original packaging" },
  { value: "A",  grade: "A",  name: "Excellent",   description: "Like new, minimal signs of handling" },
  { value: "B",  grade: "B",  name: "Good",        description: "Light use, minor wear, fully functional" },
  { value: "C",  grade: "C",  name: "Fair",        description: "Noticeable wear, fully functional" },
  { value: "D",  grade: "D",  name: "Poor",        description: "Heavy wear or minor damage, functional" },
  { value: "F",  grade: "N/A", name: "Not Applicable", description: "Condition doesn't apply — tickets, gift cards, digital items, etc." },
];

const DRAW_STYLES: { value: DrawStyle; label: string; emoji: string; description: string }[] = [
  { value: "spin", label: "The Spin",  emoji: "🎡", description: "Spinning wheel" },
  { value: "drop", label: "The Drop",  emoji: "🎯", description: "Plinko ball drop" },
  { value: "cage", label: "The Lotto", emoji: "🏮", description: "Lotto ball blower" },
];

const LIVE_DRAW_THRESHOLD = 500000; // $5,000 in cents
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTOS = 10;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function formatCurrency(cents: number): string {
  if (cents === 0) return "";
  return (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyInput(val: string): number {
  const cleaned = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

// Interpret a yyyy-mm-dd date input as 11:59:59.999 PM in the user's local timezone.
function endOfDayLocal(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export default function CreateWafflePage() {
  const router = useRouter();
  const supabase = createClient();
  const { isLoggedIn, loading } = useUser();

  // Item details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<ItemCondition>("A");
  const [declaredValueDisplay, setDeclaredValueDisplay] = useState("");
  const [declaredValueCents, setDeclaredValueCents] = useState(0);

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<"ship" | "meetup" | "ffl" | "ffl_meetup">("ship");
  const [fflModalOpen, setFflModalOpen] = useState(false);
  const [fflAcknowledged, setFflAcknowledged] = useState(false);

  const isFirearms = category === "Firearms & Ammo";

  // When category changes to Firearms, force FFL and open the modal
  useEffect(() => {
    if (isFirearms) {
      setShippingMethod("ffl");
      if (!fflAcknowledged) setFflModalOpen(true);
    } else {
      if (shippingMethod === "ffl" || shippingMethod === "ffl_meetup") setShippingMethod("ship");
    }
  }, [isFirearms]);

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Seat structure
  const [seatPriceDisplay, setSeatPriceDisplay] = useState("");
  const [seatPriceCents, setSeatPriceCents] = useState(0);
  const [totalSeats, setTotalSeats] = useState("");
  const [allowSeatChoice, setAllowSeatChoice] = useState(true);

  // Draw config
  const [drawStyle, setDrawStyle] = useState<DrawStyle>("spin");
  const [wantsLiveDraw, setWantsLiveDraw] = useState(false);
  const [deadline, setDeadline] = useState("");

  // State
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Computed
  const totalSeatsInt = parseInt(totalSeats || "0");
  const totalPotCents = seatPriceCents * totalSeatsInt;
  const totalPot = totalPotCents / 100;
  const platformFeeCents = Math.round(totalPotCents * 0.1);
  const liveDrawFeeCents = wantsLiveDraw ? Math.round(totalPotCents * 0.05) : 0;
  const totalFeesCents = platformFeeCents + liveDrawFeeCents;
  const chefPayout = (totalPotCents - totalFeesCents) / 100;
  const potExceedsLiveThreshold = totalPotCents >= LIVE_DRAW_THRESHOLD;

  // Pot cap: total pot cannot exceed 110% of declared value
  const potCapCents = Math.round(declaredValueCents * 1.1);
  const potOverCap = totalPotCents > 0 && declaredValueCents > 0 && totalPotCents > potCapCents;

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/auth/login?next=/listings/create");
    }
  }, [loading, isLoggedIn, router]);

  if (loading || !isLoggedIn) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const minDateStr = tomorrow.toISOString().split("T")[0];
  const maxDateStr = maxDate.toISOString().split("T")[0];

  function handleDeclaredValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDeclaredValueDisplay(raw);
    setDeclaredValueCents(parseCurrencyInput(raw));
  }

  function handleDeclaredValueBlur() {
    if (declaredValueCents > 0) {
      setDeclaredValueDisplay(formatCurrency(declaredValueCents));
    }
  }

  function handleSeatPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setSeatPriceDisplay(raw);
    setSeatPriceCents(parseCurrencyInput(raw));
  }

  function handleSeatPriceBlur() {
    if (seatPriceCents > 0) {
      setSeatPriceDisplay(formatCurrency(seatPriceCents));
    }
  }

  function processFiles(files: File[]) {
    if (files.length === 0) return;

    const accepted: File[] = [];
    const rejections: string[] = [];

    for (const file of files) {
      // HEIC/HEIF: iPhones default to these; browsers can't render them inline.
      const isHeic = /\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type);
      if (isHeic) {
        rejections.push(`${file.name} is HEIC — convert to JPG first.`);
        continue;
      }
      if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
        rejections.push(`${file.name} is not a supported image format.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        rejections.push(`${file.name} is ${mb} MB — limit is 10 MB.`);
        continue;
      }
      accepted.push(file);
    }

    setPhotoError(rejections.length > 0 ? rejections.join(" ") : null);
    if (accepted.length > 0) {
      setPhotos((prev) => [...prev, ...accepted].slice(0, MAX_PHOTOS));
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    // Reset so picking the same file again still triggers onChange.
    e.target.value = "";
    processFiles(files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(
    waffleId: string,
    itemId: string,
    uploadedPaths: string[]
  ): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${waffleId}/${itemId}/${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("waffle-photos")
        .upload(path, photo, { contentType: photo.type });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      const { data } = supabase.storage.from("waffle-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (photos.length === 0) {
      setPhotoError("At least one photo is required.");
      return;
    }
    if (seatPriceCents < 500) {
      setError("Seat price must be at least $5.00.");
      return;
    }
    if (totalSeatsInt < 10) {
      setError("Minimum 10 seats required.");
      return;
    }
    if (declaredValueCents < 5000) {
      setError("Item value must be at least $50.00.");
      return;
    }
    if (potOverCap) {
      setError(
        `Total pot ($${(totalPotCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}) cannot exceed 110% of item value ($${(potCapCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}). Lower your seat price or reduce seats.`
      );
      return;
    }
    if (!deadline) {
      setError("Please set a deadline.");
      return;
    }
    if (isFirearms && !fflAcknowledged) {
      setError("You must acknowledge the FFL transfer requirements before listing a firearm.");
      return;
    }

    setSubmitting(true);
    setUploading(true);

    let createdWaffleId: string | null = null;
    const uploadedPaths: string[] = [];

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("create_waffle", {
        p_title: title,
        p_description: description,
        p_category: category,
        p_seat_price: seatPriceCents,
        p_total_seats: totalSeatsInt,
        p_allow_seat_choice: allowSeatChoice,
        p_draw_style: drawStyle,
        p_draw_type: wantsLiveDraw ? "live" : "automated",
        p_deadline: endOfDayLocal(deadline).toISOString(),
        p_shipping_method: shippingMethod,
        p_item: {
          title,
          description,
          condition,
          is_new: condition === "A+",
          declared_value: declaredValueCents,
        },
      });

      if (rpcError) throw rpcError;

      const { waffle_id, item_id } = rpcData as { waffle_id: string; item_id: string };
      createdWaffleId = waffle_id;

      const photoUrls = await uploadPhotos(waffle_id, item_id, uploadedPaths);
      setUploading(false);

      const { error: updateError } = await supabase
        .from("waffle_items")
        .update({ photo_urls: photoUrls })
        .eq("id", item_id);

      if (updateError) throw updateError;

      router.push(`/listings/${waffle_id}`);
    } catch (err: unknown) {
      // Roll back: delete the waffle row (cascades to items + seats) and
      // any photos that already made it to storage.
      if (createdWaffleId) {
        await supabase.from("waffles").delete().eq("id", createdWaffleId);
      }
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("waffle-photos").remove(uploadedPaths);
      }
      console.error("create_waffle error:", err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Something went wrong. Please try again.";
      setError(message);
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🧇 Create a Waffle</h1>
          <p className="text-gray-500 mt-1">List your item and set up your raffle.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Item Details */}
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Item details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nike Air Jordan 1 Retro High OG"
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item in detail. Include any defects, accessories, original packaging, etc."
                required
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Declared value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={declaredValueDisplay}
                    onChange={handleDeclaredValueChange}
                    onBlur={handleDeclaredValueBlur}
                    placeholder="0.00"
                    required
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum $50.00</p>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCondition(c.value)}
                    className={`text-left px-3 py-3 rounded-lg border transition-colors ${
                      condition === c.value
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        condition === c.value
                          ? "bg-orange-200 text-orange-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {c.grade}
                      </span>
                      <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 leading-snug">{c.description}</div>
                  </button>
                ))}
              </div>
            </div>

          </section>

          {/* Shipping */}
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>

            {isFirearms ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "ffl" as const,        emoji: "📦", label: "Ship to FFL",      description: "You ship the firearm to the winner's FFL dealer" },
                    { value: "ffl_meetup" as const, emoji: "🤝", label: "Meet at local FFL", description: "Hand off in person at a licensed FFL dealer" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setShippingMethod(opt.value);
                        if (!fflAcknowledged) setFflModalOpen(true);
                      }}
                      className={`text-left px-3 py-3 rounded-lg border transition-colors ${
                        shippingMethod === opt.value
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{opt.emoji}</span>
                        <span className="font-semibold text-sm text-gray-900">{opt.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 leading-snug">{opt.description}</div>
                    </button>
                  ))}
                </div>

                {!fflAcknowledged ? (
                  <button
                    type="button"
                    onClick={() => setFflModalOpen(true)}
                    className="text-xs text-orange-500 hover:underline font-medium"
                  >
                    Review and acknowledge FFL requirements →
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span>✓</span> FFL requirements acknowledged
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "ship" as const,   emoji: "📦", label: "Ship it",       description: "You ship the item to the winner" },
                  { value: "meetup" as const, emoji: "🤝", label: "Local meetup",  description: "Hand off in person — details via messaging" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setShippingMethod(opt.value)}
                    className={`text-left px-3 py-3 rounded-lg border transition-colors ${
                      shippingMethod === opt.value
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base">{opt.emoji}</span>
                      <span className="font-semibold text-sm text-gray-900">{opt.label}</span>
                    </div>
                    <div className="text-xs text-gray-400 leading-snug">{opt.description}</div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Photos */}
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
              <span className="text-xs text-gray-400">{photos.length}/{MAX_PHOTOS}</span>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <label
              className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging
                  ? "border-orange-400 bg-orange-50"
                  : photoError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50"
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{isDragging ? "⬇️" : "📷"}</div>
                <p className="text-sm text-gray-500">
                  {isDragging ? "Drop to add photos" : photos.length === 0 ? "Upload photos (at least 1 required)" : "Add more photos"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP, or GIF — up to 10 MB each (no HEIC)</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            {photoError && (
              <p className="text-xs text-red-500">{photoError}</p>
            )}
          </section>

          {/* Seat Structure */}
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Seat structure</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seat price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={seatPriceDisplay}
                    onChange={handleSeatPriceChange}
                    onBlur={handleSeatPriceBlur}
                    placeholder="0.00"
                    required
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum $5.00</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total seats</label>
                <input
                  type="number"
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  placeholder="0"
                  min="10"
                  step="1"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 10 seats</p>
              </div>
            </div>

            {/* Pot cap warning */}
            {potOverCap && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                Total pot exceeds 110% of declared item value. Reduce seat price or number of seats.
              </div>
            )}

            {/* Pot summary */}
            {seatPriceCents > 0 && totalSeatsInt > 0 && !potOverCap && (
              <div className="bg-amber-50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total pot</span>
                  <span className="font-medium text-gray-900">
                    ${totalPot.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform fee (10%)</span>
                  <span className="text-gray-500">
                    - ${(platformFeeCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {wantsLiveDraw && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Live draw fee (5%)</span>
                    <span className="text-gray-500">
                      - ${(liveDrawFeeCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-amber-200 pt-1.5">
                  <span className="font-medium text-gray-700">Your payout</span>
                  <span className="font-semibold text-green-600">
                    ${chefPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="seat-choice"
                checked={allowSeatChoice}
                onChange={(e) => setAllowSeatChoice(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="seat-choice" className="text-sm text-gray-700">
                Allow buyers to pick their own seat number
              </label>
            </div>
          </section>

          {/* Draw Config */}
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Draw settings</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Draw style</label>
              <div className="grid grid-cols-3 gap-2">
                {DRAW_STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setDrawStyle(s.value)}
                    className={`px-3 py-3 rounded-lg border text-sm transition-colors ${
                      drawStyle === s.value
                        ? "border-orange-400 bg-orange-50 text-orange-800"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="text-xl mb-1">{s.emoji}</div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live draw option - only appears when pot >= $5,000 */}
            {potExceedsLiveThreshold && (
              <div className={`rounded-lg border-2 p-4 transition-colors ${
                wantsLiveDraw ? "border-orange-400 bg-orange-50" : "border-gray-200"
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="live-draw"
                    checked={wantsLiveDraw}
                    onChange={(e) => setWantsLiveDraw(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <label htmlFor="live-draw" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">🎱 Upgrade to Live Draw</span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        +5%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Real bingo-ball blower, human operator, streamed live and recorded.
                      Available for pots over $5,000. Additional 5% fee applies.
                    </p>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={minDateStr}
                max={maxDateStr}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum 30 days. Draws at 11:59 PM your local time on the selected day, or earlier if all seats fill first.
              </p>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || potOverCap || (isFirearms && !fflAcknowledged)}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {uploading ? "Uploading photos..." : submitting ? "Creating your Waffle..." : "🧇 List this Waffle"}
          </button>

        </form>

        {/* FFL acknowledgment modal */}
        {fflModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setFflModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔒</span>
                <h3 className="text-lg font-bold text-gray-900">Firearms Transfer Requirements</h3>
              </div>

              <div className="text-sm text-gray-600 space-y-3 mb-6 leading-relaxed">
                <p>
                  Federal law requires all firearm transfers to be conducted through a licensed Federal Firearms Licensee (FFL). By listing this item on Waffles, you acknowledge and agree to the following:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-gray-500">
                  <li>The winning Diner must provide a valid FFL destination dealer before claiming their prize.</li>
                  <li>You will ship the firearm directly to the winner's FFL dealer — not to the winner personally.</li>
                  <li>All applicable state and federal laws governing firearm transfers apply and are your responsibility to comply with.</li>
                  <li>FFL transfer fees are assumed to be included in the seat price you set.</li>
                  <li>Waffles reserves the right to cancel or suspend any firearms listing at any time, for any reason, without liability.</li>
                  <li>Misrepresentation of a firearm's legal status is grounds for immediate account termination and may be reported to authorities.</li>
                </ul>
                <p className="text-gray-500">
                  This platform operates in compliance with all applicable federal and state firearms regulations. Listings that violate these requirements will be removed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFflAcknowledged(true);
                  setFflModalOpen(false);
                }}
                className="w-full bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                I understand and acknowledge these requirements
              </button>

              <button
                type="button"
                onClick={() => {
                  setFflModalOpen(false);
                  setCategory(CATEGORIES[0]);
                }}
                className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
              >
                Cancel — change category
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
