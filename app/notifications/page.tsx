"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type ListingImage = {
  image_url: string;
  sort_order: number;
};

type NotificationListing = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  club: string | null;
  status: string;
  listing_images: ListingImage[] | null;
};

type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  actor_email: string | null;
  listing_id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  listings: NotificationListing | null;
};

type FilterKey = "all" | "unread" | "listing" | "favorite" | "status";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
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
      .from("notifications")
      .select(
        `
        *,
        listings(
          id,
          user_id,
          title,
          price,
          club,
          status,
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
      showMessage("Bildirimler yüklenemedi: " + error.message, "error", false);
      setLoading(false);
      return;
    }

    const notificationData: Notification[] = (data ?? []).map((item: any) => ({
      ...item,
      listings: Array.isArray(item.listings)
        ? item.listings[0] ?? null
        : item.listings ?? null,
    }));

    setNotifications(notificationData);

    const unreadIds = notificationData
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds)
        .eq("user_id", user.id);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      window.dispatchEvent(new Event("notifications-updated"));
    }

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

  async function contactSeller(notification: Notification) {
    if (!currentUserId || !notification.listings) return;

    const listing = notification.listings;

    if (listing.user_id === currentUserId) {
      showMessage("Bu ilan zaten sana ait.", "info");
      return;
    }

    setActionLoadingId(notification.id);
    setMessage("");

    const { data: existingConversation, error: searchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", currentUserId)
      .eq("seller_id", listing.user_id)
      .maybeSingle();

    if (searchError) {
      showMessage("Konuşma kontrol edilemedi: " + searchError.message, "error");
      setActionLoadingId(null);
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
      showMessage("Konuşma oluşturulamadı: " + createError.message, "error");
      setActionLoadingId(null);
      return;
    }

    window.location.href = "/messages";
  }

  async function deleteNotification(notificationId: string) {
    const confirmAction = window.confirm(
      "Bu bildirim silinecek. Emin misin?"
    );

    if (!confirmAction) return;

    setActionLoadingId(notificationId);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", currentUserId);

    if (error) {
      showMessage("Bildirim silinemedi: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );

    showMessage("Bildirim silindi.", "success");
    setActionLoadingId(null);
  }

  async function clearAllNotifications() {
    if (notifications.length === 0 || !currentUserId) return;

    const confirmAction = window.confirm(
      "Tüm bildirimlerin silinecek. Emin misin?"
    );

    if (!confirmAction) return;

    setActionLoadingId("clear-all");

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", currentUserId);

    if (error) {
      showMessage("Bildirimler silinemedi: " + error.message, "error");
      setActionLoadingId(null);
      return;
    }

    setNotifications([]);
    showMessage("Tüm bildirimler silindi.", "success");
    setActionLoadingId(null);
  }

  const counts = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((notification) => !notification.is_read)
        .length,
      listing: notifications.filter((notification) =>
        isListingNotification(notification.type)
      ).length,
      favorite: notifications.filter((notification) =>
        isFavoriteNotification(notification.type)
      ).length,
      status: notifications.filter((notification) =>
        isStatusNotification(notification.type)
      ).length,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;

    if (activeFilter === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (activeFilter === "listing") {
      return notifications.filter((notification) =>
        isListingNotification(notification.type)
      );
    }

    if (activeFilter === "favorite") {
      return notifications.filter((notification) =>
        isFavoriteNotification(notification.type)
      );
    }

    if (activeFilter === "status") {
      return notifications.filter((notification) =>
        isStatusNotification(notification.type)
      );
    }

    return notifications;
  }, [notifications, activeFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">Bildirimler yükleniyor...</p>
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
                Bildirimler
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Hareketleri takip et.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              İlan onayları, düzenleme istekleri, favoriler ve favorilediğin
              ürünlerin durum değişikliklerini buradan takip edebilirsin.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Profilime Git
              </Link>

              <Link
                href="/messages"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Mesajlar
              </Link>

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={actionLoadingId === "clear-all"}
                  className="rounded-full border border-red-800 bg-red-950 px-6 py-3 text-center text-sm font-black text-red-300 hover:bg-red-900 disabled:opacity-50"
                >
                  {actionLoadingId === "clear-all"
                    ? "Siliniyor..."
                    : "Tümünü Temizle"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Bildirim Özeti
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Toplam" value={String(counts.total)} />
              <StatCard label="Okunmamış" value={String(counts.unread)} />
              <StatCard label="İlan" value={String(counts.listing)} />
              <StatCard label="Favori" value={String(counts.favorite)} />
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-black text-neutral-200">
                Bilgilendirme
              </p>

              <p className="mt-2 text-xs leading-6 text-neutral-500">
                Bildirim sayfası açıldığında okunmamış bildirimler otomatik
                olarak okundu kabul edilir ve üst menüdeki rozet düşer.
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
              active={activeFilter === "unread"}
              onClick={() => setActiveFilter("unread")}
              label="Okunmamış"
              count={counts.unread}
            />

            <FilterButton
              active={activeFilter === "listing"}
              onClick={() => setActiveFilter("listing")}
              label="İlan"
              count={counts.listing}
            />

            <FilterButton
              active={activeFilter === "favorite"}
              onClick={() => setActiveFilter("favorite")}
              label="Favori"
              count={counts.favorite}
            />

            <FilterButton
              active={activeFilter === "status"}
              onClick={() => setActiveFilter("status")}
              label="Durum"
              count={counts.status}
            />
          </div>
        </div>

        {notifications.length === 0 ? (
          <EmptyState />
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-black">Bu bölümde bildirim yok</h2>

            <p className="mt-3 text-sm leading-7 text-neutral-400">
              Seçtiğin filtreye ait bildirim bulunmuyor. Üstteki filtrelerden
              başka bir tür seçebilirsin.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNotifications.map((notification) => {
              const listing = notification.listings;
              const coverImage = getCoverImage(listing);
              const notificationType = notificationTypeText(notification.type);

              const canContactSeller =
                currentUserId &&
                listing &&
                listing.user_id !== currentUserId &&
                (notification.type === "listing_sold" ||
                  notification.type === "listing_removed");

              const canEditListing =
                listing &&
                listing.user_id === currentUserId &&
                notification.type === "listing_needs_revision";

              return (
                <article
                  key={notification.id}
                  className={`rounded-[2rem] border p-4 md:p-5 ${
                    notification.is_read
                      ? "border-neutral-800 bg-neutral-900"
                      : "border-yellow-800 bg-yellow-950/20"
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[132px_1fr]">
                    <Link
                      href={listing ? `/listings/${listing.id}` : "/profile"}
                      className="overflow-hidden rounded-[1.4rem] border border-neutral-800 bg-neutral-950"
                    >
                      <div className="h-36 md:h-full md:min-h-36">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={listing?.title ?? "İlan"}
                            className={`h-full w-full object-cover ${
                              listing?.status === "sold" ||
                              listing?.status === "removed" ||
                              listing?.status === "rejected"
                                ? "opacity-60 grayscale"
                                : ""
                            }`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                            Görsel yok
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={notificationType.className}>
                          {notificationType.label}
                        </span>

                        {listing?.status && (
                          <span className={statusClass(listing.status)}>
                            {statusText(listing.status)}
                          </span>
                        )}

                        {!notification.is_read && (
                          <span className="rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-xs font-black text-yellow-300">
                            Yeni
                          </span>
                        )}

                        <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs font-bold text-neutral-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>

                      <h2 className="text-xl font-black leading-tight md:text-2xl">
                        {notification.title}
                      </h2>

                      <p className="mt-2 text-sm leading-7 text-neutral-400">
                        {notification.body}
                      </p>

                      {listing && (
                        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-600">
                            İlgili ilan
                          </p>

                          <p className="mt-2 font-black text-neutral-200">
                            {listing.title}
                          </p>

                          <p className="mt-1 text-sm text-neutral-500">
                            {listing.club || "Kulüp belirtilmedi"} •{" "}
                            {Number(listing.price).toLocaleString("tr-TR")}₺
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {listing && (
                          <Link
                            href={`/listings/${listing.id}`}
                            className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black hover:bg-neutral-200"
                          >
                            İlanı Gör
                          </Link>
                        )}

                        {canEditListing && listing && (
                          <Link
                            href={`/edit-listing/${listing.id}`}
                            className="rounded-full border border-yellow-700 bg-yellow-950 px-5 py-2.5 text-sm font-black text-yellow-300 hover:bg-yellow-900"
                          >
                            İlanı Düzenle
                          </Link>
                        )}

                        {canContactSeller && (
                          <button
                            onClick={() => contactSeller(notification)}
                            disabled={actionLoadingId === notification.id}
                            className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-black text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
                          >
                            {actionLoadingId === notification.id
                              ? "Açılıyor..."
                              : "Satıcıyla İletişime Geç"}
                          </button>
                        )}

                        <Link
                          href="/messages"
                          className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-black text-neutral-300 hover:bg-neutral-800"
                        >
                          Mesajlar
                        </Link>

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          disabled={actionLoadingId === notification.id}
                          className="rounded-full border border-red-800 bg-red-950 px-5 py-2.5 text-sm font-black text-red-300 hover:bg-red-900 disabled:opacity-50"
                        >
                          {actionLoadingId === notification.id
                            ? "Siliniyor..."
                            : "Sil"}
                        </button>
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

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
      <h2 className="text-3xl font-black">Henüz bildirim yok</h2>

      <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
        İlanların onaylandığında, düzenleme istendiğinde veya favori hareketi
        olduğunda bildirimler burada görünecek.
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

function getCoverImage(listing: NotificationListing | null) {
  const images = listing?.listing_images ?? [];

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

function isListingNotification(type: string) {
  return (
    type === "listing_approved" ||
    type === "listing_needs_revision" ||
    type === "listing_rejected" ||
    type === "listing_admin_removed"
  );
}

function isFavoriteNotification(type: string) {
  return type === "favorite_added";
}

function isStatusNotification(type: string) {
  return type === "listing_sold" || type === "listing_removed";
}

function notificationTypeText(type: string) {
  if (type === "favorite_added") {
    return {
      label: "Favori bildirimi",
      className:
        "rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-300",
    };
  }

  if (type === "listing_approved") {
    return {
      label: "İlan onaylandı",
      className:
        "rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-300",
    };
  }

  if (type === "listing_needs_revision") {
    return {
      label: "Düzenleme istendi",
      className:
        "rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-xs font-black text-yellow-300",
    };
  }

  if (type === "listing_rejected") {
    return {
      label: "İlan reddedildi",
      className:
        "rounded-full border border-red-900 bg-red-950 px-3 py-1 text-xs font-black text-red-300",
    };
  }

  if (type === "listing_admin_removed") {
    return {
      label: "Admin yayından kaldırdı",
      className:
        "rounded-full border border-red-900 bg-red-950 px-3 py-1 text-xs font-black text-red-300",
    };
  }

  if (type === "listing_sold") {
    return {
      label: "Favorilediğin ürün satıldı",
      className:
        "rounded-full border border-purple-800 bg-purple-950 px-3 py-1 text-xs font-black text-purple-300",
    };
  }

  if (type === "listing_removed") {
    return {
      label: "Favorilediğin ürün yayından kaldırıldı",
      className:
        "rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-xs font-black text-yellow-300",
    };
  }

  return {
    label: "Bildirim",
    className:
      "rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-300",
  };
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
  const baseClass = "rounded-full border px-3 py-1 text-xs font-black";

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