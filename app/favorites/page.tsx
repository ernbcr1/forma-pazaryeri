"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type ListingImage = {
  image_url: string;
  sort_order: number;
};

type FavoriteListing = {
  id: string;
  title: string;
  club: string | null;
  season: string | null;
  brand: string | null;
  size: string | null;
  condition: string | null;
  price: number;
  city: string | null;
  status: string;
  category: string;
  ai_public_label: string | null;
  user_id: string;
  listing_images: ListingImage[] | null;
};

type FavoriteItem = {
  id: string;
  listing_id: string;
  created_at: string;
  listings: FavoriteListing | null;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        listing_id,
        created_at,
        listings(
          id,
          title,
          club,
          season,
          brand,
          size,
          condition,
          price,
          city,
          status,
          category,
          ai_public_label,
          user_id,
          listing_images(
            image_url,
            sort_order
          )
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Favoriler yüklenemedi: " + error.message);
      setLoading(false);
      return;
    }

    const formattedFavorites: FavoriteItem[] = (data ?? []).map((item: any) => {
      return {
        id: item.id,
        listing_id: item.listing_id,
        created_at: item.created_at,
        listings: Array.isArray(item.listings)
          ? item.listings[0] ?? null
          : item.listings ?? null,
      };
    });

    setFavorites(formattedFavorites);
    setLoading(false);
  }

  async function removeFavorite(listingId: string) {
    if (!currentUserId) return;

    const confirmAction = window.confirm(
      "Bu ilan favorilerinden çıkarılacak. Emin misin?"
    );

    if (!confirmAction) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", currentUserId)
      .eq("listing_id", listingId);

    if (error) {
      setMessage("Favoriden çıkarılamadı: " + error.message);
      return;
    }

    setFavorites((currentFavorites) =>
      currentFavorites.filter((favorite) => favorite.listing_id !== listingId)
    );

    window.dispatchEvent(new Event("favorites-updated"));
    setMessage("İlan favorilerden çıkarıldı.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">Favoriler yükleniyor...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Favorilerim
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
            Takip ettiğin ilanları burada görebilirsin. Ürün satılsa veya
            yayından kaldırılsa bile favorilerinde görünmeye devam eder.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold">Henüz favori ilan yok</h2>

            <p className="mt-3 text-neutral-400">
              İlanları gezerken beğendiğin ürünleri favorilerine
              ekleyebilirsin.
            </p>

            <Link
              href="/listings"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
              İlanları Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => {
              const listing = favorite.listings;

              if (!listing) {
                return (
                  <div
                    key={favorite.id}
                    className="rounded-3xl border border-red-900 bg-red-950 p-5 text-red-200"
                  >
                    <h2 className="font-bold">Bu ilan artık görüntülenemiyor</h2>
                    <p className="mt-2 text-sm text-red-200/80">
                      İlan kalıcı olarak silinmiş olabilir.
                    </p>

                    <button
                      onClick={() => removeFavorite(favorite.listing_id)}
                      className="mt-4 rounded-full border border-red-700 px-4 py-2 text-sm hover:bg-red-900"
                    >
                      Favoriden Çıkar
                    </button>
                  </div>
                );
              }

              const coverImage = getCoverImage(listing);
              const isPassive =
                listing.status === "sold" || listing.status === "removed";

              return (
                <div
                  key={favorite.id}
                  className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
                >
                  <Link href={`/listings/${listing.id}`}>
                    <div className="relative aspect-[4/5] bg-neutral-950">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className={`h-full w-full object-cover ${
                            isPassive ? "opacity-55 grayscale" : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-600">
                          Görsel yok
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
                          {categoryText(listing.category)}
                        </span>

                        <span className={statusClass(listing.status)}>
                          {statusText(listing.status)}
                        </span>
                      </div>

                      {isPassive && (
                        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/80 p-3 text-center text-sm font-bold text-white backdrop-blur">
                          {listing.status === "sold"
                            ? "Bu ürün satıldı"
                            : "Bu ürün yayından kaldırıldı"}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/listings/${listing.id}`}>
                          <h2 className="line-clamp-2 font-bold leading-5 hover:text-neutral-300">
                            {listing.title}
                          </h2>
                        </Link>

                        <p className="mt-1 truncate text-sm text-neutral-500">
                          {listing.club || "Kulüp belirtilmedi"}
                          {listing.season ? ` • ${listing.season}` : ""}
                        </p>
                      </div>

                      <p className="whitespace-nowrap font-black">
                        {Number(listing.price).toLocaleString("tr-TR")}₺
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                      {listing.brand && (
                        <span className="rounded-full bg-neutral-950 px-3 py-1">
                          {listing.brand}
                        </span>
                      )}

                      {listing.size && (
                        <span className="rounded-full bg-neutral-950 px-3 py-1">
                          {listing.size}
                        </span>
                      )}

                      {listing.condition && (
                        <span className="rounded-full bg-neutral-950 px-3 py-1">
                          {listing.condition}
                        </span>
                      )}

                      {listing.city && (
                        <span className="rounded-full bg-neutral-950 px-3 py-1">
                          {listing.city}
                        </span>
                      )}
                    </div>

                    {isPassive && (
                      <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-xs leading-5 text-neutral-400">
                        {listing.status === "sold"
                          ? "Favorilediğin bu ürün satıldı. Benzer ürünler için satıcının diğer ilanlarını inceleyebilir veya mesajlarını takip edebilirsin."
                          : "Favorilediğin bu ürün yayından kaldırıldı. Satıcı benzer ürünler ekleyebilir; diğer ilanları takip edebilirsin."}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4 text-sm">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="font-medium text-white hover:text-neutral-300"
                      >
                        İlanı Gör →
                      </Link>

                      <button
                        onClick={() => removeFavorite(listing.id)}
                        className="rounded-full border border-red-800 bg-red-950 px-3 py-2 text-xs text-red-300 hover:bg-red-900"
                      >
                        Favoriden Çıkar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function getCoverImage(listing: FavoriteListing) {
  const images = listing.listing_images ?? [];

  if (images.length === 0) return null;

  const sortedImages = [...images].sort(
    (first, second) => first.sort_order - second.sort_order
  );

  return sortedImages[0]?.image_url ?? null;
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
  if (status === "active") return "Yayında";
  if (status === "pending") return "Onay bekliyor";
  if (status === "sold") return "Satıldı";
  if (status === "removed") return "Yayından kaldırıldı";
  if (status === "needs_revision") return "Düzenleme gerekli";
  if (status === "rejected") return "Reddedildi";
  return status;
}

function statusClass(status: string) {
  const baseClass =
    "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur";

  if (status === "active") {
    return `${baseClass} bg-emerald-950/90 text-emerald-300`;
  }

  if (status === "sold") {
    return `${baseClass} bg-purple-950/90 text-purple-300`;
  }

  if (status === "removed") {
    return `${baseClass} bg-red-950/90 text-red-300`;
  }

  if (status === "pending") {
    return `${baseClass} bg-blue-950/90 text-blue-300`;
  }

  if (status === "needs_revision") {
    return `${baseClass} bg-yellow-950/90 text-yellow-300`;
  }

  if (status === "rejected") {
    return `${baseClass} bg-red-950/90 text-red-300`;
  }

  return `${baseClass} bg-neutral-950/90 text-neutral-300`;
}