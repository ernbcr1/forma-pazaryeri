"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type ListingImage = {
  id?: string;
  image_url: string;
  sort_order: number;
};

type Listing = {
  id: string;
  user_id: string;
  title: string;
  club: string | null;
  season: string | null;
  brand: string | null;
  size: string | null;
  condition: string | null;
  authenticity: string | null;
  price: number;
  city: string | null;
  description: string | null;
  category: string;
  status: string;
  ai_public_label: string | null;
  ai_admin_note: string | null;
  created_at: string;
  listing_images: ListingImage[] | null;
};

type FavoriteCount = {
  listing_id: string;
  favorite_count: number;
};

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = String(params.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadListing();
  }, [listingId]);

  async function loadListing() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);
    setCurrentUserEmail(user?.email ?? null);

    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        listing_images(
          id,
          image_url,
          sort_order
        )
      `
      )
      .eq("id", listingId)
      .single();

    if (error) {
      setMessage("İlan yüklenemedi: " + error.message);
      setLoading(false);
      return;
    }

    const listingData = data as Listing;

    const sortedImages = [...(listingData.listing_images ?? [])].sort(
      (first, second) => first.sort_order - second.sort_order
    );

    const formattedListing = {
      ...listingData,
      listing_images: sortedImages,
    };

    setListing(formattedListing);
    setSelectedImageUrl(sortedImages[0]?.image_url ?? null);

    const { data: countData } = await supabase
      .from("listing_favorite_counts")
      .select("*")
      .eq("listing_id", listingId)
      .maybeSingle();

    const countRow = countData as FavoriteCount | null;
    setFavoriteCount(countRow?.favorite_count ?? 0);

    if (user) {
      const { data: favoriteData } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      setIsFavorite(Boolean(favoriteData));
    } else {
      setIsFavorite(false);
    }

    setLoading(false);
  }

  async function toggleFavorite() {
    if (!listing) return;

    if (!currentUserId) {
      window.location.href = "/auth";
      return;
    }

    if (listing.user_id === currentUserId) {
      setMessage("Kendi ilanını favorilerine ekleyemezsin.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("listing_id", listing.id);

      if (error) {
        setMessage("Favoriden çıkarılamadı: " + error.message);
        setActionLoading(false);
        return;
      }

      setIsFavorite(false);
      setFavoriteCount((currentCount) => Math.max(currentCount - 1, 0));
      window.dispatchEvent(new Event("favorites-updated"));
      setActionLoading(false);
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: currentUserId,
      listing_id: listing.id,
    });

    if (error) {
      setMessage("Favoriye eklenemedi: " + error.message);
      setActionLoading(false);
      return;
    }

    setIsFavorite(true);
    setFavoriteCount((currentCount) => currentCount + 1);

    await supabase.from("notifications").insert({
      user_id: listing.user_id,
      actor_id: currentUserId,
      actor_email: currentUserEmail,
      listing_id: listing.id,
      type: "favorite_added",
      title: `"${listing.title}" başlıklı ilanınız favorilere eklendi.`,
      body:
        "Bir kullanıcı ilanınızı favorilerine ekledi. Bu ürün dikkat çekiyor. Satış şansınızı artırmak için ilanınızı güncel tutabilir ve gelen mesajları takip edebilirsiniz.",
    });

    window.dispatchEvent(new Event("favorites-updated"));
    window.dispatchEvent(new Event("notifications-updated"));

    setActionLoading(false);
  }

  async function contactSeller() {
    if (!listing) return;

    if (!currentUserId) {
      window.location.href = "/auth";
      return;
    }

    if (listing.user_id === currentUserId) {
      setMessage("Bu ilan sana ait.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    const { data: existingConversation, error: searchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", currentUserId)
      .eq("seller_id", listing.user_id)
      .maybeSingle();

    if (searchError) {
      setMessage("Konuşma kontrol edilemedi: " + searchError.message);
      setActionLoading(false);
      return;
    }

    if (existingConversation?.id) {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", existingConversation.id);

      window.location.href = "/messages";
      return;
    }

    const { error: createError } = await supabase.from("conversations").insert({
      listing_id: listing.id,
      buyer_id: currentUserId,
      seller_id: listing.user_id,
    });

    if (createError) {
      setMessage("Konuşma oluşturulamadı: " + createError.message);
      setActionLoading(false);
      return;
    }

    window.location.href = "/messages";
  }

  const images = useMemo(() => {
    return listing?.listing_images ?? [];
  }, [listing]);

  const isOwner = Boolean(listing && currentUserId === listing.user_id);
  const isUnavailable =
    listing?.status === "sold" ||
    listing?.status === "removed" ||
    listing?.status === "rejected";

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">İlan yükleniyor...</p>
        </section>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
          <h1 className="text-2xl font-black">İlan bulunamadı</h1>

          <p className="mt-3 text-neutral-400">
            İlan silinmiş, yayından kaldırılmış veya görüntüleme yetkin olmayabilir.
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
          >
            Markete Dön
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/listings" className="hover:text-white">
            ← Markete dön
          </Link>

          <span>İlan tarihi: {formatDate(listing.created_at)}</span>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-4 md:p-5">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-neutral-800 bg-neutral-950">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={listing.title}
                  className={`aspect-[4/5] w-full object-cover md:aspect-[5/4] ${
                    isUnavailable ? "opacity-70 grayscale" : ""
                  }`}
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-neutral-600 md:aspect-[5/4]">
                  Görsel yok
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className={statusClass(listing.status)}>
                  {statusText(listing.status)}
                </span>

                <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {categoryText(listing.category)}
                </span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-6">
                {images.map((image) => (
                  <button
                    key={image.image_url}
                    type="button"
                    onClick={() => setSelectedImageUrl(image.image_url)}
                    className={`overflow-hidden rounded-2xl border bg-neutral-950 ${
                      selectedImageUrl === image.image_url
                        ? "border-white"
                        : "border-neutral-800"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={listing.title}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {listing.ai_public_label && (
                  <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-300">
                    {listing.ai_public_label}
                  </span>
                )}

                <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-300">
                  ♥ {favoriteCount} favori
                </span>

                {isOwner && (
                  <span className="rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-300">
                    Kendi ilanın
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                {listing.title}
              </h1>

              <p className="mt-4 text-sm leading-6 text-neutral-400 md:text-base">
                {listing.club || "Kulüp belirtilmedi"}
                {listing.season ? ` • ${listing.season}` : ""}
                {listing.city ? ` • ${listing.city}` : ""}
              </p>

              <p className="mt-6 text-4xl font-black">
                {Number(listing.price).toLocaleString("tr-TR")}₺
              </p>

              {isUnavailable && (
                <div className="mt-6 rounded-3xl border border-red-800 bg-red-950 p-4 text-sm leading-6 text-red-300">
                  Bu ilan şu anda aktif değil. Ürün satılmış, yayından
                  kaldırılmış veya admin tarafından reddedilmiş olabilir.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {!isOwner && listing.status === "active" && (
                  <button
                    onClick={contactSeller}
                    disabled={actionLoading}
                    className="rounded-full bg-white px-6 py-4 text-center font-bold text-black hover:bg-neutral-200 disabled:opacity-50"
                  >
                    Satıcıya Mesaj Gönder
                  </button>
                )}

                {!isOwner && (
                  <button
                    onClick={toggleFavorite}
                    disabled={actionLoading}
                    className={`rounded-full border px-6 py-4 text-center font-bold disabled:opacity-50 ${
                      isFavorite
                        ? "border-white bg-white text-black hover:bg-neutral-200"
                        : "border-neutral-700 hover:bg-neutral-800"
                    }`}
                  >
                    {isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                  </button>
                )}

                {isOwner && (
                  <Link
                    href="/profile"
                    className="rounded-full bg-white px-6 py-4 text-center font-bold text-black hover:bg-neutral-200"
                  >
                    Profilde Yönet
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-black">Ürün Bilgileri</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoBox label="Kategori" value={categoryText(listing.category)} />
                <InfoBox label="Kulüp / Takım" value={listing.club} />
                <InfoBox label="Sezon" value={listing.season} />
                <InfoBox label="Marka" value={listing.brand} />
                <InfoBox label="Beden / Numara" value={listing.size} />
                <InfoBox label="Kondisyon" value={listing.condition} />
                <InfoBox label="Orijinallik" value={listing.authenticity} />
                <InfoBox label="Şehir" value={listing.city} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-black">Açıklama</h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-400">
                {listing.description || "Bu ilan için açıklama girilmemiş."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-black">Güvenli Alışveriş Notu</h2>

              <p className="mt-4 text-sm leading-7 text-neutral-400">
                Ürün fotoğraflarını, etiketleri, kondisyon detaylarını ve
                açıklamayı dikkatlice incele. Satıcıya site içi mesajlaşma
                üzerinden ölçü, kusur, fatura/etiket ve orijinallik hakkında
                soru sorabilirsin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs text-neutral-500">{label}</p>

      <p className="mt-1 font-semibold text-neutral-200">
        {value || "Belirtilmiyor"}
      </p>
    </div>
  );
}

function categoryText(category: string) {
  if (category === "shirt") return "Forma";
  if (category === "training") return "Antrenman";
  if (category === "boots") return "Krampon";
  if (category === "scarf") return "Atkı";
  if (category === "jacket") return "Ceket";
  if (category === "shorts") return "Şort";
  if (category === "goalkeeper") return "Kaleci";
  if (category === "accessory") return "Aksesuar";
  if (category === "collectible") return "Koleksiyon";
  return category;
}

function statusText(status: string) {
  if (status === "pending") return "Onay bekliyor";
  if (status === "active") return "Yayında";
  if (status === "sold") return "Satıldı";
  if (status === "rejected") return "Reddedildi";
  if (status === "needs_revision") return "Düzenleme gerekli";
  if (status === "removed") return "Yayından kaldırıldı";
  return status;
}

function statusClass(status: string) {
  const baseClass = "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur";

  if (status === "active") {
    return `${baseClass} bg-emerald-950 text-emerald-300`;
  }

  if (status === "pending") {
    return `${baseClass} bg-blue-950 text-blue-300`;
  }

  if (status === "sold") {
    return `${baseClass} bg-purple-950 text-purple-300`;
  }

  if (status === "removed") {
    return `${baseClass} bg-red-950 text-red-300`;
  }

  if (status === "needs_revision") {
    return `${baseClass} bg-yellow-950 text-yellow-300`;
  }

  if (status === "rejected") {
    return `${baseClass} bg-red-950 text-red-300`;
  }

  return `${baseClass} bg-neutral-950 text-neutral-300`;
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}