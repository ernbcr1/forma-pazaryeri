"use client";

import { useEffect, useMemo, useState } from "react";
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

type FilterKey = "all" | "active" | "sold" | "removed" | "unavailable";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );

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
      showMessage("Favoriler yüklenemedi: " + error.message, "error", false);
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

  function showMessage(
    nextMessage: string,
    nextType: "info" | "success" | "error" = "info",
    scroll = true
  ) {
    setMessage(nextMessage);
    setMessageType(nextType);

    if (scroll) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  async function removeFavorite(listingId: string) {
    if (!currentUserId) return;

    const confirmAction = window.confirm(
      "Bu ilan favorilerinden çıkarılacak. Emin misin?"
    );

    if (!confirmAction) return;

    setActionLoadingId(listingId);

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", currentUserId)
      .eq("listing_id", listingId);

    if (error) {
      showMessage("Favoriden çıkarılamadı: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    setFavorites((currentFavorites) =>
      currentFavorites.filter((favorite) => favorite.listing_id !== listingId)
    );

    window.dispatchEvent(new Event("favorites-updated"));
    showMessage("İlan favorilerden çıkarıldı.", "success");
    setActionLoadingId(null);
  }

  const counts = useMemo(() => {
    return {
      total: favorites.length,
      active: favorites.filter(
        (favorite) => favorite.listings?.status === "active"
      ).length,
      sold: favorites.filter((favorite) => favorite.listings?.status === "sold")
        .length,
      removed: favorites.filter(
        (favorite) => favorite.listings?.status === "removed"
      ).length,
      unavailable: favorites.filter((favorite) => !favorite.listings).length,
    };
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (activeFilter === "all") return favorites;

    if (activeFilter === "unavailable") {
      return favorites.filter((favorite) => !favorite.listings);
    }

    return favorites.filter(
      (favorite) => favorite.listings?.status === activeFilter
    );
  }, [favorites, activeFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">Favoriler yükleniyor...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white md:px-8 md:py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem] md:p-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />

              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-yellow-300">
                Favorilerim
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Takip ettiğin ilanlar.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Beğendiğin ürünleri burada takip edebilirsin. Ürün satılsa veya
              yayından kaldırılsa bile favorilerinde görünmeye devam eder.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Marketi Keşfet
              </Link>

              <Link
                href="/profile"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Profilime Dön
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Favori Özeti
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Toplam" value={String(counts.total)} />
              <StatCard label="Yayında" value={String(counts.active)} />
              <StatCard label="Satıldı" value={String(counts.sold)} />
              <StatCard label="Kaldırıldı" value={String(counts.removed)} />
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-black text-neutral-200">
                Favori takibi
              </p>

              <p className="mt-2 text-xs leading-6 text-neutral-500">
                Satılan ve kaldırılan ürünleri de burada görmeye devam edersin.
                Böylece takip ettiğin parçaların durumunu kaçırmazsın.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
              messageType === "success"
                ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                : messageType === "error"
                  ? "border-red-900 bg-red-950 text-red-300"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            <FilterButton
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
              label="Tümü"
              count={counts.total}
            />

            <FilterButton
              active={activeFilter === "active"}
              onClick={() => setActiveFilter("active")}
              label="Yayında"
              count={counts.active}
            />

            <FilterButton
              active={activeFilter === "sold"}
              onClick={() => setActiveFilter("sold")}
              label="Satıldı"
              count={counts.sold}
            />

            <FilterButton
              active={activeFilter === "removed"}
              onClick={() => setActiveFilter("removed")}
              label="Kaldırıldı"
              count={counts.removed}
            />

            <FilterButton
              active={activeFilter === "unavailable"}
              onClick={() => setActiveFilter("unavailable")}
              label="Silinmiş"
              count={counts.unavailable}
            />
          </div>
        </div>

        {favorites.length === 0 ? (
          <EmptyState />
        ) : filteredFavorites.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-black">Bu bölümde favori yok</h2>

            <p className="mt-3 text-sm leading-7 text-neutral-400">
              Seçtiğin filtreye ait favori ilan bulunmuyor. Üstteki filtrelerden
              başka bir durumu seçebilirsin.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFavorites.map((favorite) => {
              const listing = favorite.listings;
              const isActionLoading = actionLoadingId === favorite.listing_id;

              if (!listing) {
                return (
                  <article
                    key={favorite.id}
                    className="rounded-[2rem] border border-red-900 bg-red-950/65 p-5 text-red-100"
                  >
                    <div className="flex h-48 items-center justify-center rounded-[1.5rem] border border-red-800 bg-red-950 text-center text-sm text-red-200/80">
                      Bu ilan artık görüntülenemiyor.
                    </div>

                    <h2 className="mt-5 text-xl font-black">
                      İlan silinmiş olabilir
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-red-100/75">
                      Favorilediğin bu ürün kalıcı olarak silinmiş veya erişime
                      kapatılmış olabilir.
                    </p>

                    <button
                      onClick={() => removeFavorite(favorite.listing_id)}
                      disabled={isActionLoading}
                      className="mt-5 rounded-full border border-red-700 px-4 py-2 text-sm font-black text-red-100 hover:bg-red-900 disabled:opacity-50"
                    >
                      {isActionLoading ? "Çıkarılıyor..." : "Favoriden Çıkar"}
                    </button>
                  </article>
                );
              }

              const coverImage = getCoverImage(listing);
              const isPassive =
                listing.status === "sold" || listing.status === "removed";

              return (
                <article
                  key={favorite.id}
                  className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900"
                >
                  <Link href={`/listings/${listing.id}`}>
                    <div className="relative aspect-[4/5] bg-neutral-950">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className={`h-full w-full object-cover transition duration-300 hover:scale-[1.035] ${
                            isPassive ? "opacity-55 grayscale" : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-600">
                          Görsel yok
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white backdrop-blur">
                          {categoryText(listing.category)}
                        </span>

                        <span className={statusClass(listing.status)}>
                          {statusText(listing.status)}
                        </span>
                      </div>

                      {listing.ai_public_label && (
                        <div className="absolute right-3 top-3 rounded-full bg-blue-950/90 px-3 py-1 text-xs font-black text-blue-300 backdrop-blur">
                          {listing.ai_public_label}
                        </div>
                      )}

                      {isPassive && (
                        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/80 p-3 text-center text-sm font-black text-white backdrop-blur">
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
                          <h2 className="line-clamp-2 text-base font-black leading-5 hover:text-yellow-100">
                            {listing.title}
                          </h2>
                        </Link>

                        <p className="mt-1 truncate text-sm text-neutral-500">
                          {listing.club || "Kulüp belirtilmedi"}
                          {listing.season ? ` • ${listing.season}` : ""}
                        </p>
                      </div>

                      <p className="shrink-0 whitespace-nowrap text-lg font-black">
                        {Number(listing.price).toLocaleString("tr-TR")}₺
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-bold text-neutral-400">
                      {listing.brand && (
                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
                          {listing.brand}
                        </span>
                      )}

                      {listing.size && (
                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
                          {listing.size}
                        </span>
                      )}

                      {listing.condition && (
                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
                          {listing.condition}
                        </span>
                      )}

                      {listing.city && (
                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
                          {listing.city}
                        </span>
                      )}
                    </div>

                    {isPassive && (
                      <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-xs leading-5 text-neutral-400">
                        {listing.status === "sold"
                          ? "Favorilediğin bu ürün satıldı. Benzer ürünler için marketi takip edebilirsin."
                          : "Favorilediğin bu ürün yayından kaldırıldı. Satıcı ürünü tekrar onaya gönderebilir veya benzer ürünler ekleyebilir."}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4 text-sm">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="font-black text-white hover:text-yellow-100"
                      >
                        İlanı Gör →
                      </Link>

                      <button
                        onClick={() => removeFavorite(listing.id)}
                        disabled={isActionLoading}
                        className="rounded-full border border-red-800 bg-red-950 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-900 disabled:opacity-50"
                      >
                        {isActionLoading ? "Çıkarılıyor..." : "Çıkar"}
                      </button>
                    </div>

                    <p className="mt-3 text-[11px] font-medium text-neutral-600">
                      Favoriye eklenme: {formatDate(favorite.created_at)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
      <h2 className="text-3xl font-black">Henüz favori ilan yok</h2>

      <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
        İlanları gezerken beğendiğin ürünleri favorilerine ekleyebilirsin.
        Favoriye aldığın ürünler burada takip edilir.
      </p>

      <Link
        href="/listings"
        className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-200"
      >
        İlanları Keşfet
      </Link>
    </div>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-3xl font-black">{value}</p>

      <p className="mt-1 text-xs font-bold text-neutral-500">{label}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-black transition ${
        active
          ? "border-white bg-white text-black"
          : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
      }`}
    >
      {label}
      <span
        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
          active ? "bg-black/10 text-black" : "bg-neutral-950 text-neutral-400"
        }`}
      >
        {count}
      </span>
    </button>
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
    "rounded-full border px-3 py-1 text-xs font-black backdrop-blur";

  if (status === "active") {
    return `${baseClass} border-emerald-800 bg-emerald-950/90 text-emerald-300`;
  }

  if (status === "sold") {
    return `${baseClass} border-purple-800 bg-purple-950/90 text-purple-300`;
  }

  if (status === "removed") {
    return `${baseClass} border-red-900 bg-red-950/90 text-red-300`;
  }

  if (status === "pending") {
    return `${baseClass} border-blue-800 bg-blue-950/90 text-blue-300`;
  }

  if (status === "needs_revision") {
    return `${baseClass} border-yellow-800 bg-yellow-950/90 text-yellow-300`;
  }

  if (status === "rejected") {
    return `${baseClass} border-red-900 bg-red-950/90 text-red-300`;
  }

  return `${baseClass} border-neutral-800 bg-neutral-950/90 text-neutral-300`;
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}