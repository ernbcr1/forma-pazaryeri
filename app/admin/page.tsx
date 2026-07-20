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
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );

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
      showMessage("İlanlar yüklenemedi: " + error.message, "error", false);
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
    showMessage(
      "İlan güncelleniyor ve ilan sahibine bildirim gönderiliyor...",
      "info"
    );

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
      showMessage("İşlem tamamlanamadı: " + error.message, "error");
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

    showMessage(successMessage, "success");
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

  const counts = useMemo(() => {
    return {
      total: listings.length,
      pending: listings.filter((listing) => listing.status === "pending")
        .length,
      active: listings.filter((listing) => listing.status === "active").length,
      revision: listings.filter(
        (listing) => listing.status === "needs_revision"
      ).length,
      rejected: listings.filter((listing) => listing.status === "rejected")
        .length,
      sold: listings.filter((listing) => listing.status === "sold").length,
      removed: listings.filter((listing) => listing.status === "removed")
        .length,
      manual: listings.filter((listing) => listing.requires_manual_review)
        .length,
    };
  }, [listings]);

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
          listing.id,
          listing.user_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(cleanSearch);
      });
    }

    return result;
  }, [listings, selectedStatus, searchText]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">Admin panel yükleniyor...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
          <h1 className="text-3xl font-black">Yetkisiz erişim</h1>

          <p className="mt-3 text-sm leading-7 text-neutral-400">
            Bu sayfaya sadece admin kullanıcıları erişebilir.
          </p>

          <Link
            href="/profile"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-200"
          >
            Profile Dön
          </Link>
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
                elFormazione Admin
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              İlan onay paneli.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Bekleyen, güncellenmiş, yayındaki ve kaldırılmış ilanları buradan
              kontrol edebilirsin. Admin işlemlerinde ilan sahibine otomatik
              bildirim gider.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Profile Dön
              </Link>

              <Link
                href="/admin/announcements"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Duyurular
              </Link>

              <Link
                href="/admin/analytics"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                İstatistikler
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Admin Özeti
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Toplam" value={String(counts.total)} />
              <StatCard label="Onay Bekleyen" value={String(counts.pending)} />
              <StatCard label="Yayında" value={String(counts.active)} />
              <StatCard label="Manuel Kontrol" value={String(counts.manual)} />
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-black text-neutral-200">
                Kontrol notu
              </p>

              <p className="mt-2 text-xs leading-6 text-neutral-500">
                Onay, reddetme ve düzenleme isteği işlemleri ilan sahibine
                otomatik bildirim gönderir.
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

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_280px]">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="İlan, kulüp, marka, şehir, not, ilan ID veya kullanıcı ID ara..."
            className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3 text-sm font-semibold outline-none placeholder:text-neutral-600 focus:border-neutral-500"
          />

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3 text-sm font-semibold outline-none focus:border-neutral-500"
          >
            {statusFilterOptions.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            <FilterButton
              active={selectedStatus === "all"}
              onClick={() => setSelectedStatus("all")}
              label="Tümü"
              count={counts.total}
            />

            <FilterButton
              active={selectedStatus === "pending"}
              onClick={() => setSelectedStatus("pending")}
              label="Onay Bekleyen"
              count={counts.pending}
            />

            <FilterButton
              active={selectedStatus === "active"}
              onClick={() => setSelectedStatus("active")}
              label="Yayında"
              count={counts.active}
            />

            <FilterButton
              active={selectedStatus === "needs_revision"}
              onClick={() => setSelectedStatus("needs_revision")}
              label="Düzenleme"
              count={counts.revision}
            />

            <FilterButton
              active={selectedStatus === "rejected"}
              onClick={() => setSelectedStatus("rejected")}
              label="Reddedilen"
              count={counts.rejected}
            />

            <FilterButton
              active={selectedStatus === "sold"}
              onClick={() => setSelectedStatus("sold")}
              label="Satıldı"
              count={counts.sold}
            />

            <FilterButton
              active={selectedStatus === "removed"}
              onClick={() => setSelectedStatus("removed")}
              label="Kaldırılan"
              count={counts.removed}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 text-sm font-bold text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
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
            <h2 className="text-2xl font-black">İlan bulunamadı</h2>

            <p className="mt-3 text-sm leading-7 text-neutral-400">
              Seçili filtrelere uygun ilan yok.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredListings.map((listing) => {
              const coverImage = getCoverImage(listing);
              const updateSource = listing.details?.source ?? "";
              const isPriceDescriptionEdit =
                updateSource === "edit-listing-price-description-only";
              const isActionLoading = actionLoadingId === listing.id;

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900 p-4 md:p-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[210px_1fr]">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="group overflow-hidden rounded-[1.6rem] border border-neutral-800 bg-neutral-950"
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className={`h-60 w-full object-cover transition duration-300 group-hover:scale-[1.035] lg:h-full ${
                            listing.status === "sold" ||
                            listing.status === "removed" ||
                            listing.status === "rejected"
                              ? "opacity-60 grayscale"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="flex h-60 items-center justify-center text-sm text-neutral-600 lg:h-full">
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

                        {isPriceDescriptionEdit && (
                          <span className="rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1.5 text-xs font-bold text-yellow-300">
                            Fiyat / açıklama güncellemesi
                          </span>
                        )}

                        {listing.originality_declaration && (
                          <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-300">
                            Orijinallik beyanı var
                          </span>
                        )}

                        {listing.requires_manual_review && (
                          <span className="rounded-full border border-blue-800 bg-blue-950 px-3 py-1.5 text-xs font-bold text-blue-300">
                            Manuel kontrol gerekli
                          </span>
                        )}

                        {listing.ai_public_label && (
                          <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-bold text-neutral-300">
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

                      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_320px]">
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-600">
                            Açıklama
                          </p>

                          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-neutral-300">
                            {listing.description || "Açıklama yok."}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-600">
                            Teknik Bilgi
                          </p>

                          <div className="mt-3 space-y-2 text-xs leading-5 text-neutral-400">
                            <p>
                              <span className="text-neutral-600">İlan ID:</span>{" "}
                              {listing.id}
                            </p>

                            <p>
                              <span className="text-neutral-600">
                                Kullanıcı ID:
                              </span>{" "}
                              {listing.user_id}
                            </p>

                            <p>
                              <span className="text-neutral-600">
                                Oluşturma:
                              </span>{" "}
                              {formatDate(listing.created_at)}
                            </p>

                            <p>
                              <span className="text-neutral-600">
                                Doğrulama:
                              </span>{" "}
                              {listing.verification_status || "Yok"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {listing.ai_admin_note && (
                        <div className="mt-4 rounded-3xl border border-yellow-900 bg-yellow-950/40 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                            Admin Notu
                          </p>

                          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-yellow-100">
                            {listing.ai_admin_note}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-800"
                        >
                          İlanı Gör
                        </Link>

                        {listing.status !== "active" && (
                          <button
                            onClick={() => approveListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-900 disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "İşleniyor..."
                              : "Onayla ve Yayına Al"}
                          </button>
                        )}

                        {listing.status !== "needs_revision" && (
                          <button
                            onClick={() => requestRevision(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-900 disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "İşleniyor..."
                              : "Düzenleme İste"}
                          </button>
                        )}

                        {listing.status !== "rejected" && (
                          <button
                            onClick={() => rejectListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-red-800 bg-red-950 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-900 disabled:opacity-50"
                          >
                            {isActionLoading ? "İşleniyor..." : "Reddet"}
                          </button>
                        )}

                        {listing.status !== "removed" && (
                          <button
                            onClick={() => removeListing(listing)}
                            disabled={isActionLoading}
                            className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                          >
                            {isActionLoading
                              ? "İşleniyor..."
                              : "Yayından Kaldır"}
                          </button>
                        )}
                      </div>
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
  const baseClass = "rounded-full border px-3 py-1.5 text-xs font-black";

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