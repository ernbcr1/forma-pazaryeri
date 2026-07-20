"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type ListingImage = {
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
  verification_status: string | null;
  ai_public_label: string | null;
  ai_admin_note: string | null;
  created_at: string;
  listing_images: ListingImage[] | null;
};

type FavoriteCount = {
  listing_id: string;
  favorite_count: number;
};

type Favorite = {
  user_id: string;
};

type FilterKey =
  | "all"
  | "active"
  | "pending"
  | "needs_revision"
  | "sold"
  | "removed";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>(
    {}
  );

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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
    setUserEmail(user.email ?? null);

    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        listing_images(
          image_url,
          sort_order
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      showMessage("İlanların yüklenemedi: " + error.message, "error", false);
      setLoading(false);
      return;
    }

    const listingData = (data ?? []) as Listing[];
    setListings(listingData);

    const { data: countData } = await supabase
      .from("listing_favorite_counts")
      .select("*");

    const countMap: Record<string, number> = {};

    ((countData ?? []) as FavoriteCount[]).forEach((item) => {
      countMap[item.listing_id] = item.favorite_count;
    });

    setFavoriteCounts(countMap);
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

  async function notifyFavoriters(
    listing: Listing,
    type: "listing_sold" | "listing_removed"
  ) {
    if (!currentUserId) return;

    const { data: favoriteData } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("listing_id", listing.id);

    const favorites = (favoriteData ?? []) as Favorite[];

    const notificationRows = favorites
      .filter((favorite) => favorite.user_id !== currentUserId)
      .map((favorite) => ({
        user_id: favorite.user_id,
        actor_id: currentUserId,
        actor_email: userEmail,
        listing_id: listing.id,
        type,
        title:
          type === "listing_sold"
            ? `Favorilediğiniz "${listing.title}" satıldı.`
            : `Favorilediğiniz "${listing.title}" yayından kaldırıldı.`,
        body:
          type === "listing_sold"
            ? "Favorilerinize eklediğiniz bu ilan satıldı olarak işaretlendi."
            : "Favorilerinize eklediğiniz bu ilan satıcı tarafından yayından kaldırıldı.",
      }));

    if (notificationRows.length === 0) return;

    await supabase.from("notifications").upsert(notificationRows, {
      onConflict: "user_id,actor_id,listing_id,type",
    });

    window.dispatchEvent(new Event("notifications-updated"));
  }

  async function markAsSold(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan satıldı olarak işaretlensin mi?`
    );

    if (!confirmAction) return;

    setActionLoadingId(listing.id);
    showMessage("İlan satıldı olarak güncelleniyor...", "info");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "sold",
        ai_public_label: "Satıldı",
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      showMessage("İlan güncellenemedi: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    await notifyFavoriters(listing, "listing_sold");

    setListings((currentListings) =>
      currentListings.map((item) =>
        item.id === listing.id
          ? {
              ...item,
              status: "sold",
              ai_public_label: "Satıldı",
            }
          : item
      )
    );

    showMessage("İlan satıldı olarak işaretlendi.", "success");
    setActionLoadingId(null);
  }

  async function removeFromSale(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan yayından kaldırılsın mı?`
    );

    if (!confirmAction) return;

    setActionLoadingId(listing.id);
    showMessage("İlan yayından kaldırılıyor...", "info");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "removed",
        ai_public_label: "Yayından kaldırıldı",
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      showMessage("İlan yayından kaldırılamadı: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    await notifyFavoriters(listing, "listing_removed");

    setListings((currentListings) =>
      currentListings.map((item) =>
        item.id === listing.id
          ? {
              ...item,
              status: "removed",
              ai_public_label: "Yayından kaldırıldı",
            }
          : item
      )
    );

    showMessage("İlan yayından kaldırıldı.", "success");
    setActionLoadingId(null);
  }

  async function sendBackToReview(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan tekrar admin onayına gönderilsin mi?`
    );

    if (!confirmAction) return;

    setActionLoadingId(listing.id);
    showMessage("İlan tekrar onaya gönderiliyor...", "info");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "pending",
        verification_status: "not_checked",
        ai_public_label: "elF Check bekleniyor",
        ai_admin_note: null,
        requires_manual_review: true,
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      showMessage("İlan tekrar onaya gönderilemedi: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    setListings((currentListings) =>
      currentListings.map((item) =>
        item.id === listing.id
          ? {
              ...item,
              status: "pending",
              verification_status: "not_checked",
              ai_public_label: "elF Check bekleniyor",
              ai_admin_note: null,
            }
          : item
      )
    );

    setActiveFilter("pending");
    showMessage("İlan tekrar admin onayına gönderildi.", "success");
    setActionLoadingId(null);
  }

  async function permanentlyDeleteListing(listing: Listing) {
    const firstConfirm = window.confirm(
      `"${listing.title}" kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misin?`
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "Son kez onayla: Bu ilan, profilinden tamamen kaldırılacak."
    );

    if (!secondConfirm) return;

    setActionLoadingId(listing.id);
    showMessage("İlan kalıcı olarak siliniyor...", "info");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      showMessage("İlan silinemedi: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    setListings((currentListings) =>
      currentListings.filter((item) => item.id !== listing.id)
    );

    showMessage("İlan kalıcı olarak silindi.", "success");
    setActionLoadingId(null);
  }

  const counts = useMemo(() => {
    return {
      total: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      pending: listings.filter((listing) => listing.status === "pending").length,
      needs_revision: listings.filter(
        (listing) => listing.status === "needs_revision"
      ).length,
      sold: listings.filter((listing) => listing.status === "sold").length,
      removed: listings.filter((listing) => listing.status === "removed").length,
    };
  }, [listings]);

  const totalFavorites = useMemo(() => {
    return listings.reduce((total, listing) => {
      return total + (favoriteCounts[listing.id] ?? 0);
    }, 0);
  }, [listings, favoriteCounts]);

  const filteredListings = useMemo(() => {
    if (activeFilter === "all") return listings;

    return listings.filter((listing) => listing.status === activeFilter);
  }, [listings, activeFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">Profil yükleniyor...</p>
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
                Kullanıcı Paneli
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              İlanlarını yönet.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Yayındaki, onay bekleyen, satılan ve kaldırılan ilanlarını tek
              yerden takip et. Gerekirse fiyat/açıklama düzenle veya ilanı
              tekrar onaya gönder.
            </p>

            <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-600">
                Hesap
              </p>

              <p className="mt-1 truncate text-sm font-bold text-neutral-300">
                {userEmail}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create-listing"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Yeni İlan Ver
              </Link>

              <Link
                href="/favorites"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Favorilerim
              </Link>

              <Link
                href="/messages"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Mesajlar
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Özet
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Toplam İlan" value={String(counts.total)} />
              <StatCard label="Toplam Favori" value={String(totalFavorites)} />
              <StatCard label="Yayında" value={String(counts.active)} />
              <StatCard label="Onay Bekleyen" value={String(counts.pending)} />
              <StatCard
                label="Düzenleme"
                value={String(counts.needs_revision)}
              />
              <StatCard label="Satılan" value={String(counts.sold)} />
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
              active={activeFilter === "pending"}
              onClick={() => setActiveFilter("pending")}
              label="Onay Bekleyen"
              count={counts.pending}
            />

            <FilterButton
              active={activeFilter === "needs_revision"}
              onClick={() => setActiveFilter("needs_revision")}
              label="Düzenleme"
              count={counts.needs_revision}
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
          </div>
        </div>

        {listings.length === 0 ? (
          <EmptyState />
        ) : filteredListings.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-black">Bu bölümde ilan yok</h2>

            <p className="mt-3 text-sm leading-7 text-neutral-400">
              Seçtiğin filtreye ait ilan bulunmuyor. Üstteki filtrelerden
              başka bir durumu seçebilirsin.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredListings.map((listing) => {
              const coverImage = getCoverImage(listing);
              const isActionLoading = actionLoadingId === listing.id;
              const favoriteCount = favoriteCounts[listing.id] ?? 0;

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900 p-4 md:p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="group overflow-hidden rounded-[1.6rem] border border-neutral-800 bg-neutral-950"
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className={`h-56 w-full object-cover transition duration-300 group-hover:scale-[1.035] lg:h-full ${
                            listing.status === "sold" ||
                            listing.status === "removed" ||
                            listing.status === "rejected"
                              ? "opacity-60 grayscale"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-56 items-center justify-center text-sm text-neutral-600 lg:h-full">
                          Görsel yok
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className={statusClass(listing.status)}>
                          {statusText(listing.status)}
                        </span>

                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-bold text-neutral-300">
                          {categoryText(listing.category)}
                        </span>

                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-bold text-neutral-300">
                          ♥ {favoriteCount} favori
                        </span>

                        {listing.ai_public_label && (
                          <span className="rounded-full border border-blue-800 bg-blue-950 px-3 py-1.5 text-xs font-bold text-blue-300">
                            {listing.ai_public_label}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <Link href={`/listings/${listing.id}`}>
                            <h2 className="text-2xl font-black leading-tight tracking-tight hover:text-yellow-100 md:text-3xl">
                              {listing.title}
                            </h2>
                          </Link>

                          <p className="mt-2 text-sm text-neutral-500">
                            {listing.club || "Kulüp yok"} •{" "}
                            {listing.season || "Sezon yok"} •{" "}
                            {listing.city || "Şehir yok"}
                          </p>
                        </div>

                        <p className="shrink-0 text-3xl font-black">
                          {Number(listing.price).toLocaleString("tr-TR")}₺
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <InfoBox label="Marka" value={listing.brand} />
                        <InfoBox label="Beden / Numara" value={listing.size} />
                        <InfoBox label="Kondisyon" value={listing.condition} />
                        <InfoBox
                          label="Orijinallik"
                          value={listing.authenticity}
                        />
                      </div>

                      {listing.ai_admin_note && (
                        <div className="mt-5 rounded-3xl border border-yellow-900 bg-yellow-950/40 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                            Admin Notu
                          </p>

                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-yellow-100">
                            {listing.ai_admin_note}
                          </p>
                        </div>
                      )}

                      {listing.status === "needs_revision" && (
                        <div className="mt-4 rounded-3xl border border-yellow-800 bg-yellow-950/30 p-4">
                          <p className="font-black text-yellow-300">
                            Bu ilan için düzenleme istendi
                          </p>

                          <p className="mt-2 text-sm leading-6 text-yellow-100/80">
                            Düzenleme ekranında fiyat ve açıklamayı güncelle.
                            Kaydettiğinde ilan tekrar admin onayına düşer.
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-800"
                        >
                          Görüntüle
                        </Link>

                        {(listing.status === "active" ||
                          listing.status === "pending" ||
                          listing.status === "needs_revision") && (
                          <Link
                            href={`/edit-listing/${listing.id}`}
                            className="rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-900"
                          >
                            Fiyat / Açıklama Düzenle
                          </Link>
                        )}

                        {listing.status === "active" && (
                          <button
                            onClick={() => markAsSold(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-purple-800 bg-purple-950 px-4 py-2 text-sm font-bold text-purple-300 hover:bg-purple-900 disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "İşleniyor..."
                              : "Satıldı Olarak İşaretle"}
                          </button>
                        )}

                        {listing.status === "active" && (
                          <button
                            onClick={() => removeFromSale(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "İşleniyor..."
                              : "Yayından Kaldır"}
                          </button>
                        )}

                        {(listing.status === "removed" ||
                          listing.status === "rejected") && (
                          <button
                            onClick={() => sendBackToReview(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-blue-800 bg-blue-950 px-4 py-2 text-sm font-bold text-blue-300 hover:bg-blue-900 disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "İşleniyor..."
                              : "Tekrar Onaya Gönder"}
                          </button>
                        )}

                        {(listing.status === "removed" ||
                          listing.status === "rejected") && (
                          <button
                            onClick={() => permanentlyDeleteListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-red-800 bg-red-950 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-900 disabled:opacity-50"
                          >
                            {isActionLoading ? "İşleniyor..." : "Kalıcı Sil"}
                          </button>
                        )}
                      </div>

                      <p className="mt-4 text-xs font-medium text-neutral-600">
                        Oluşturulma: {formatDate(listing.created_at)}
                      </p>
                    </div>
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
      <h2 className="text-3xl font-black">Henüz ilan yok</h2>

      <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
        İlk ilanını oluşturduğunda burada görünecek. Fotoğrafları ekle, ürün
        bilgilerini gir ve admin kontrolüne gönder.
      </p>

      <Link
        href="/create-listing"
        className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-200"
      >
        İlk İlanı Oluştur
      </Link>
    </div>
  );
}

function getCoverImage(listing: Listing) {
  const images = listing.listing_images ?? [];

  if (images.length === 0) return null;

  const sortedImages = [...images].sort(
    (first, second) => first.sort_order - second.sort_order
  );

  return sortedImages[0]?.image_url ?? null;
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
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-neutral-200">
        {value || "Belirtilmiyor"}
      </p>
    </div>
  );
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
  if (status === "pending") return "Onay bekliyor";
  if (status === "active") return "Yayında";
  if (status === "sold") return "Satıldı";
  if (status === "rejected") return "Reddedildi";
  if (status === "needs_revision") return "Düzenleme gerekli";
  if (status === "removed") return "Yayından kaldırıldı";
  return status;
}

function statusClass(status: string) {
  const baseClass =
    "rounded-full border px-3 py-1.5 text-xs font-black";

  if (status === "active") {
    return `${baseClass} border-emerald-800 bg-emerald-950 text-emerald-300`;
  }

  if (status === "pending") {
    return `${baseClass} border-blue-800 bg-blue-950 text-blue-300`;
  }

  if (status === "sold") {
    return `${baseClass} border-purple-800 bg-purple-950 text-purple-300`;
  }

  if (status === "removed") {
    return `${baseClass} border-red-900 bg-red-950 text-red-300`;
  }

  if (status === "needs_revision") {
    return `${baseClass} border-yellow-800 bg-yellow-950 text-yellow-300`;
  }

  if (status === "rejected") {
    return `${baseClass} border-red-900 bg-red-950 text-red-300`;
  }

  return `${baseClass} border-neutral-800 bg-neutral-950 text-neutral-300`;
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