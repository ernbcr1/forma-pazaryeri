"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type ListingImage = {
  image_url: string;
  sort_order: number;
};

type ListingDetails = {
  source?: string;
  category_label?: string;
  currency?: string;
  editable_fields?: string[];
  category_locked?: boolean;
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
  currency: string | null;
  city: string | null;
  description: string | null;
  category: string;
  status: string;
  verification_status: string | null;
  ai_public_label: string | null;
  ai_admin_note: string | null;
  ai_risk_score: number | null;
  requires_manual_review: boolean | null;
  originality_declaration: boolean | null;
  created_at: string;
  details: ListingDetails | null;
  listing_images: ListingImage[] | null;
};

const statusFilterOptions = [
  { key: "all", label: "Tümü" },
  { key: "pending", label: "Onay Bekleyen" },
  { key: "active", label: "Yayında" },
  { key: "needs_revision", label: "Düzenleme Gerekli" },
  { key: "rejected", label: "Reddedilen" },
  { key: "sold", label: "Satıldı" },
  { key: "removed", label: "Yayından Kaldırılan" },
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdminAndLoadListings();
  }, []);

  async function checkAdminAndLoadListings() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminData) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    await loadListings();
  }

  async function loadListings() {
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
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("İlanlar yüklenemedi: " + error.message);
      setLoading(false);
      return;
    }

    const listingData: Listing[] = (data ?? []).map((item: any) => ({
      ...item,
      listing_images: item.listing_images ?? [],
      details: item.details ?? null,
    }));

    setListings(listingData);
    setLoading(false);
  }

  async function updateListingStatusWithOwnerNotification({
    listing,
    nextStatus,
    nextVerificationStatus,
    nextPublicLabel,
    nextAdminNote,
    notificationType,
    notificationTitle,
    notificationBody,
    successMessage,
  }: {
    listing: Listing;
    nextStatus: string;
    nextVerificationStatus: string;
    nextPublicLabel: string;
    nextAdminNote: string;
    notificationType: string;
    notificationTitle: string;
    notificationBody: string;
    successMessage: string;
  }) {
    setActionLoadingId(listing.id);
    setMessage("İlan güncelleniyor ve ilan sahibine bildirim gönderiliyor...");

    const { error } = await supabase.rpc(
      "admin_update_listing_status_and_notify_owner",
      {
        target_listing_id: listing.id,
        next_status: nextStatus,
        next_verification_status: nextVerificationStatus,
        next_public_label: nextPublicLabel,
        next_admin_note: nextAdminNote,
        notification_type: notificationType,
        notification_title: notificationTitle,
        notification_body: notificationBody,
      }
    );

    if (error) {
      setMessage("İşlem tamamlanamadı: " + error.message);
      setActionLoadingId(null);
      return;
    }

    setListings((currentListings) =>
      currentListings.map((item) =>
        item.id === listing.id
          ? {
              ...item,
              status: nextStatus,
              verification_status: nextVerificationStatus,
              ai_public_label: nextPublicLabel,
              ai_admin_note: nextAdminNote,
              requires_manual_review: false,
            }
          : item
      )
    );

    window.dispatchEvent(new Event("notifications-updated"));

    setMessage(successMessage);
    setActionLoadingId(null);
  }

  async function approveListing(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan yayına alınacak. İlan sahibine bildirim gönderilecek. Emin misin?`
    );

    if (!confirmAction) return;

    await updateListingStatusWithOwnerNotification({
      listing,
      nextStatus: "active",
      nextVerificationStatus: "admin_approved",
      nextPublicLabel: "elF Check: Onaylandı",
      nextAdminNote: "Admin kontrolünden geçti. Yayına alındı.",
      notificationType: "listing_approved",
      notificationTitle: `"${listing.title}" başlıklı ilanınız onaylandı.`,
      notificationBody:
        "İlanınız admin kontrolünden geçti ve yayına alındı. Artık kullanıcılar ilanınızı görüntüleyebilir, favorilerine ekleyebilir ve size mesaj gönderebilir.",
      successMessage: "İlan onaylandı ve ilan sahibine bildirim gönderildi.",
    });
  }

  async function requestRevision(listing: Listing) {
    const note = window.prompt(
      "Satıcıdan neyi düzeltmesini istiyorsun?",
      "Lütfen fiyatı veya açıklama bilgisini güncelleyin."
    );

    if (!note) return;

    await updateListingStatusWithOwnerNotification({
      listing,
      nextStatus: "needs_revision",
      nextVerificationStatus: "needs_more_photos",
      nextPublicLabel: "elF Check: Düzenleme gerekli",
      nextAdminNote: note,
      notificationType: "listing_needs_revision",
      notificationTitle: `"${listing.title}" başlıklı ilanınız için düzenleme istendi.`,
      notificationBody:
        note +
        " Düzenlemeyi yaptıktan sonra ilanınız tekrar admin onayına gönderilecektir.",
      successMessage:
        "Düzenleme isteği gönderildi ve ilan sahibine bildirim gönderildi.",
    });
  }

  async function rejectListing(listing: Listing) {
    const note = window.prompt(
      "Reddetme sebebini yaz:",
      "Ürün bilgileri veya orijinallik beyanı yeterli bulunmadı."
    );

    if (!note) return;

    await updateListingStatusWithOwnerNotification({
      listing,
      nextStatus: "rejected",
      nextVerificationStatus: "rejected",
      nextPublicLabel: "elF Check: Reddedildi",
      nextAdminNote: note,
      notificationType: "listing_rejected",
      notificationTitle: `"${listing.title}" başlıklı ilanınız reddedildi.`,
      notificationBody:
        note +
        " Bu ilan şu an yayında değildir. Gerekirse yeni ve doğru bilgilerle tekrar ilan oluşturabilirsiniz.",
      successMessage: "İlan reddedildi ve ilan sahibine bildirim gönderildi.",
    });
  }

  async function removeListing(listing: Listing) {
    const confirmAction = window.confirm(
      `"${listing.title}" başlıklı ilan yayından kaldırılacak. İlan sahibine bildirim gönderilecek. Emin misin?`
    );

    if (!confirmAction) return;

    await updateListingStatusWithOwnerNotification({
      listing,
      nextStatus: "removed",
      nextVerificationStatus: "rejected",
      nextPublicLabel: "elF Check: Yayından kaldırıldı",
      nextAdminNote: "Admin tarafından yayından kaldırıldı.",
      notificationType: "listing_admin_removed",
      notificationTitle: `"${listing.title}" başlıklı ilanınız yayından kaldırıldı.`,
      notificationBody:
        "İlanınız admin kontrolü sonucunda yayından kaldırıldı. Bu ilan artık listelerde görünmez. Gerekirse ilan bilgilerini kontrol edip yeni ilan oluşturabilirsiniz.",
      successMessage:
        "İlan yayından kaldırıldı ve ilan sahibine bildirim gönderildi.",
    });
  }

  function clearFilters() {
    setSelectedStatus("all");
    setSearchText("");
  }

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (selectedStatus !== "all") {
      result = result.filter((listing) => listing.status === selectedStatus);
    }

    const cleanSearch = searchText.trim().toLowerCase();

    if (cleanSearch) {
      result = result.filter((listing) => {
        const searchableText = [
          listing.title,
          listing.club,
          listing.season,
          listing.brand,
          listing.size,
          listing.condition,
          listing.city,
          listing.status,
          categoryText(listing.category),
          listing.description,
          listing.ai_admin_note,
          listing.ai_public_label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(cleanSearch);
      });
    }

    return result;
  }, [listings, selectedStatus, searchText]);

  const pendingCount = listings.filter(
    (listing) => listing.status === "pending"
  ).length;

  const activeCount = listings.filter(
    (listing) => listing.status === "active"
  ).length;

  const revisionCount = listings.filter(
    (listing) => listing.status === "needs_revision"
  ).length;

  const removedCount = listings.filter(
    (listing) => listing.status === "removed"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">Admin panel yükleniyor...</p>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
          <h1 className="text-2xl font-black">Yetkisiz erişim</h1>

          <p className="mt-3 text-neutral-400">
            Bu sayfaya sadece admin kullanıcıları erişebilir.
          </p>

          <Link
            href="/profile"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
          >
            Profile Dön
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-neutral-500">elFormazione Admin</p>

              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                İlan Onay Paneli
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
                Bekleyen, güncellenmiş, yayındaki ve kaldırılmış ilanları buradan
                kontrol edebilirsin. Admin işlemlerinde ilan sahibine otomatik
                bildirim gider.
              </p>
            </div>

            <Link
              href="/profile"
              className="rounded-full border border-neutral-700 px-6 py-3 text-center font-semibold hover:bg-neutral-800"
            >
              Profile Dön
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Onay Bekleyen" value={String(pendingCount)} />
            <StatCard label="Yayında" value={String(activeCount)} />
            <StatCard label="Düzenleme Gerekli" value={String(revisionCount)} />
            <StatCard label="Kaldırılan" value={String(removedCount)} />
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_260px]">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="İlan, kulüp, marka, şehir, not ara..."
            className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          />

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3 text-sm outline-none focus:border-neutral-500"
          >
            {statusFilterOptions.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex flex-col gap-2 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{filteredListings.length} ilan gösteriliyor</p>

          {(searchText || selectedStatus !== "all") && (
            <button
              onClick={clearFilters}
              className="text-left text-neutral-300 hover:text-white"
            >
              Filtreleri temizle
            </button>
          )}
        </div>

        {filteredListings.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold">İlan bulunamadı</h2>

            <p className="mt-3 text-neutral-400">
              Seçili filtrelere uygun ilan yok.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredListings.map((listing) => {
              const coverImage = getCoverImage(listing);
              const updateSource = listing.details?.source ?? "";
              const isPriceDescriptionEdit =
                updateSource === "edit-listing-price-description-only";
              const isActionLoading = actionLoadingId === listing.id;

              return (
                <div
                  key={listing.id}
                  className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-4 md:p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
                    <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className="h-52 w-full object-cover lg:h-full"
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

                        {isPriceDescriptionEdit && (
                          <span className="rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-300">
                            Fiyat / açıklama güncellemesi
                          </span>
                        )}

                        {listing.originality_declaration && (
                          <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs text-emerald-300">
                            Orijinallik beyanı var
                          </span>
                        )}

                        {listing.requires_manual_review && (
                          <span className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-300">
                            Manuel kontrol gerekli
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
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

                      <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
                        <p className="text-xs font-semibold text-neutral-500">
                          Açıklama
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-300">
                          {listing.description || "Açıklama yok."}
                        </p>
                      </div>

                      {listing.ai_admin_note && (
                        <div className="mt-4 rounded-3xl border border-yellow-900 bg-yellow-950/40 p-4">
                          <p className="text-xs font-semibold text-yellow-300">
                            Admin Notu
                          </p>

                          <p className="mt-2 text-sm leading-6 text-yellow-100">
                            {listing.ai_admin_note}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
                        >
                          İlanı Gör
                        </Link>

                        {listing.status !== "active" && (
                          <button
                            onClick={() => approveListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-900 disabled:opacity-50"
                          >
                            Onayla ve Yayına Al
                          </button>
                        )}

                        {listing.status !== "needs_revision" && (
                          <button
                            onClick={() => requestRevision(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-900 disabled:opacity-50"
                          >
                            Düzenleme İste
                          </button>
                        )}

                        {listing.status !== "rejected" && (
                          <button
                            onClick={() => rejectListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-red-800 bg-red-950 px-4 py-2 text-sm text-red-300 hover:bg-red-900 disabled:opacity-50"
                          >
                            Reddet
                          </button>
                        )}

                        {listing.status !== "removed" && (
                          <button
                            onClick={() => removeListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
                          >
                            Yayından Kaldır
                          </button>
                        )}
                      </div>

                      <p className="mt-4 text-xs text-neutral-600">
                        İlan ID: {listing.id} • Kullanıcı ID: {listing.user_id} •{" "}
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