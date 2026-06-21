"use client";

import { useEffect, useState } from "react";
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

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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
      setMessage("İlanların yüklenemedi: " + error.message);
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

  async function notifyFavoriters(listing: Listing, type: "listing_sold" | "listing_removed") {
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
            ? "Favorilerinize eklediğiniz bu ilan satıldı olarak işaretlendi. Detayları görmek veya satıcıyla iletişime geçmek için bildirimi açabilirsiniz."
            : "Favorilerinize eklediğiniz bu ilan satıcı tarafından yayından kaldırıldı. Detayları görmek veya satıcıyla iletişime geçmek için bildirimi açabilirsiniz.",
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
    setMessage("İlan satıldı olarak güncelleniyor...");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "sold",
        ai_public_label: "Satıldı",
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setMessage("İlan güncellenemedi: " + error.message);
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

    setMessage("İlan satıldı olarak işaretlendi.");
    setActionLoadingId(null);
  }

  async function removeFromSale(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan yayından kaldırılsın mı?`
    );

    if (!confirmAction) return;

    setActionLoadingId(listing.id);
    setMessage("İlan yayından kaldırılıyor...");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "removed",
        ai_public_label: "Yayından kaldırıldı",
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setMessage("İlan yayından kaldırılamadı: " + error.message);
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

    setMessage("İlan yayından kaldırıldı.");
    setActionLoadingId(null);
  }

  async function sendBackToReview(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan tekrar admin onayına gönderilsin mi?`
    );

    if (!confirmAction) return;

    setActionLoadingId(listing.id);
    setMessage("İlan tekrar onaya gönderiliyor...");

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
      setMessage("İlan tekrar onaya gönderilemedi: " + error.message);
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

    setMessage("İlan tekrar admin onayına gönderildi.");
    setActionLoadingId(null);
  }

  async function permanentlyDeleteListing(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misin?`
    );

    if (!confirmAction) return;

    setActionLoadingId(listing.id);
    setMessage("İlan kalıcı olarak siliniyor...");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setMessage("İlan silinemedi: " + error.message);
      setActionLoadingId(null);
      return;
    }

    setListings((currentListings) =>
      currentListings.filter((item) => item.id !== listing.id)
    );

    setMessage("İlan kalıcı olarak silindi.");
    setActionLoadingId(null);
  }

  const totalCount = listings.length;
  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const pendingCount = listings.filter((listing) => listing.status === "pending").length;
  const revisionCount = listings.filter(
    (listing) => listing.status === "needs_revision"
  ).length;
  const soldCount = listings.filter((listing) => listing.status === "sold").length;
  const removedCount = listings.filter((listing) => listing.status === "removed").length;

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">Profil yükleniyor...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-neutral-500">elFormazione</p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                Kullanıcı Paneli
              </h1>

              <p className="mt-4 text-sm text-neutral-400 md:text-base">
                {userEmail}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create-listing"
                className="rounded-full bg-white px-6 py-3 text-center font-semibold text-black hover:bg-neutral-200"
              >
                Yeni İlan Ver
              </Link>

              <Link
                href="/favorites"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center font-semibold hover:bg-neutral-800"
              >
                Favorilerim
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <StatCard label="Toplam İlan" value={String(totalCount)} />
            <StatCard label="Yayında" value={String(activeCount)} />
            <StatCard label="Onay Bekleyen" value={String(pendingCount)} />
            <StatCard label="Düzenleme" value={String(revisionCount)} />
            <StatCard label="Satılan" value={String(soldCount)} />
            <StatCard label="Kaldırılan" value={String(removedCount)} />
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold">Henüz ilan yok</h2>

            <p className="mt-3 text-neutral-400">
              İlk ilanını oluşturduğunda burada görünecek.
            </p>

            <Link
              href="/create-listing"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
              İlk İlanı Oluştur
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {listings.map((listing) => {
              const coverImage = getCoverImage(listing);
              const isActionLoading = actionLoadingId === listing.id;
              const favoriteCount = favoriteCounts[listing.id] ?? 0;

              return (
                <div
                  key={listing.id}
                  className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-4 md:p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                    <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className={`h-52 w-full object-cover lg:h-full ${
                            listing.status === "sold" ||
                            listing.status === "removed" ||
                            listing.status === "rejected"
                              ? "opacity-60 grayscale"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center text-sm text-neutral-600">
                          Görsel yok
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className={statusClass(listing.status)}>
                          {statusText(listing.status)}
                        </span>

                        <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs text-neutral-300">
                          {categoryText(listing.category)}
                        </span>

                        <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs text-neutral-300">
                          ♥ {favoriteCount} favori
                        </span>

                        {listing.ai_public_label && (
                          <span className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-300">
                            {listing.ai_public_label}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <h2 className="text-xl font-black md:text-2xl">
                            {listing.title}
                          </h2>

                          <p className="mt-2 text-sm text-neutral-500">
                            {listing.club || "Kulüp yok"} •{" "}
                            {listing.season || "Sezon yok"} •{" "}
                            {listing.city || "Şehir yok"}
                          </p>
                        </div>

                        <p className="text-2xl font-black">
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
                          <p className="text-xs font-semibold text-yellow-300">
                            Admin Notu
                          </p>

                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-yellow-100">
                            {listing.ai_admin_note}
                          </p>
                        </div>
                      )}

                      {listing.status === "needs_revision" && (
                        <div className="mt-4 rounded-3xl border border-yellow-800 bg-yellow-950/30 p-4">
                          <p className="font-bold text-yellow-300">
                            Bu ilan için düzenleme istendi
                          </p>

                          <p className="mt-2 text-sm leading-6 text-yellow-100/80">
                            Şu anda düzenleme ekranında sadece fiyat ve açıklama
                            değiştirilebilir. Kaydettiğinde ilan tekrar admin
                            onayına düşer.
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
                        >
                          Görüntüle
                        </Link>

                        {(listing.status === "active" ||
                          listing.status === "pending" ||
                          listing.status === "needs_revision") && (
                          <Link
                            href={`/edit-listing/${listing.id}`}
                            className="rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-900"
                          >
                            Fiyat / Açıklama Düzenle
                          </Link>
                        )}

                        {listing.status === "active" && (
                          <button
                            onClick={() => markAsSold(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-purple-800 bg-purple-950 px-4 py-2 text-sm text-purple-300 hover:bg-purple-900 disabled:opacity-50"
                          >
                            Satıldı Olarak İşaretle
                          </button>
                        )}

                        {listing.status === "active" && (
                          <button
                            onClick={() => removeFromSale(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
                          >
                            Yayından Kaldır
                          </button>
                        )}

                        {(listing.status === "removed" ||
                          listing.status === "rejected") && (
                          <button
                            onClick={() => sendBackToReview(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-blue-800 bg-blue-950 px-4 py-2 text-sm text-blue-300 hover:bg-blue-900 disabled:opacity-50"
                          >
                            Tekrar Onaya Gönder
                          </button>
                        )}

                        {(listing.status === "removed" ||
                          listing.status === "rejected") && (
                          <button
                            onClick={() => permanentlyDeleteListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-300 hover:bg-red-900 disabled:opacity-50"
                          >
                            Kalıcı Sil
                          </button>
                        )}
                      </div>

                      <p className="mt-4 text-xs text-neutral-600">
                        {formatDate(listing.created_at)}
                      </p>
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
      <p className="text-xs text-neutral-500">{label}</p>

      <p className="mt-1 font-semibold text-neutral-200">
        {value || "Belirtilmiyor"}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <p className="text-2xl font-black">{value}</p>

      <p className="mt-1 text-sm text-neutral-500">{label}</p>
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
  const baseClass = "rounded-full px-3 py-1 text-xs font-semibold";

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
    hour: "2-digit",
    minute: "2-digit",
  });
}