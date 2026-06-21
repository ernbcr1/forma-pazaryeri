"use client";

import { useEffect, useState } from "react";
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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
      setMessage("Bildirimler yüklenemedi: " + error.message);
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

  async function contactSeller(notification: Notification) {
    if (!currentUserId || !notification.listings) return;

    const listing = notification.listings;

    if (listing.user_id === currentUserId) {
      setMessage("Bu ilan zaten sana ait.");
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
      setMessage("Konuşma kontrol edilemedi: " + searchError.message);
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
      setMessage("Konuşma oluşturulamadı: " + createError.message);
      setActionLoadingId(null);
      return;
    }

    window.location.href = "/messages";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-5xl">
          <p className="text-neutral-400">Bildirimler yükleniyor...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Bildirimler
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
            İlan onayları, düzenleme istekleri, favoriler ve ürün durum
            değişikliklerini buradan takip edebilirsin.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold">Henüz bildirim yok</h2>

            <p className="mt-3 text-neutral-400">
              İlanların onaylandığında, düzenleme istendiğinde veya favori
              hareketi olduğunda burada görünecek.
            </p>

            <Link
              href="/listings"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
              İlanları Keşfet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
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
                <div
                  key={notification.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4"
                >
                  <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                    <div className="h-32 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
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

                        <span className="rounded-full bg-neutral-950 px-3 py-1 text-xs text-neutral-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold">
                        {notification.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-neutral-400">
                        {notification.body}
                      </p>

                      {listing && (
                        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                          <p className="text-xs text-neutral-500">İlgili ilan</p>

                          <p className="mt-1 font-semibold text-neutral-200">
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
                            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-neutral-200"
                          >
                            İlanı Gör
                          </Link>
                        )}

                        {canEditListing && (
                          <Link
                            href={`/edit-listing/${listing.id}`}
                            className="rounded-full border border-yellow-700 bg-yellow-950 px-5 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-900"
                          >
                            İlanı Düzenle
                          </Link>
                        )}

                        {canContactSeller && (
                          <button
                            onClick={() => contactSeller(notification)}
                            disabled={actionLoadingId === notification.id}
                            className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50"
                          >
                            {actionLoadingId === notification.id
                              ? "Açılıyor..."
                              : "Satıcıyla İletişime Geç"}
                          </button>
                        )}

                        <Link
                          href="/messages"
                          className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-semibold hover:bg-neutral-800"
                        >
                          Mesajlar
                        </Link>
                      </div>
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

function getCoverImage(listing: NotificationListing | null) {
  const images = listing?.listing_images ?? [];

  if (images.length === 0) return null;

  const sortedImages = [...images].sort(
    (first, second) => first.sort_order - second.sort_order
  );

  return sortedImages[0]?.image_url ?? null;
}

function notificationTypeText(type: string) {
  if (type === "favorite_added") {
    return {
      label: "Favori bildirimi",
      className:
        "rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-300",
    };
  }

  if (type === "listing_approved") {
    return {
      label: "İlan onaylandı",
      className:
        "rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-300",
    };
  }

  if (type === "listing_needs_revision") {
    return {
      label: "Düzenleme istendi",
      className:
        "rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-300",
    };
  }

  if (type === "listing_rejected") {
    return {
      label: "İlan reddedildi",
      className:
        "rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-300",
    };
  }

  if (type === "listing_admin_removed") {
    return {
      label: "Admin yayından kaldırdı",
      className:
        "rounded-full bg-red-950 px-3 py-1 text-xs font-semibold text-red-300",
    };
  }

  if (type === "listing_sold") {
    return {
      label: "Favorilediğin ürün satıldı",
      className:
        "rounded-full bg-purple-950 px-3 py-1 text-xs font-semibold text-purple-300",
    };
  }

  if (type === "listing_removed") {
    return {
      label: "Favorilediğin ürün yayından kaldırıldı",
      className:
        "rounded-full bg-yellow-950 px-3 py-1 text-xs font-semibold text-yellow-300",
    };
  }

  return {
    label: "Bildirim",
    className:
      "rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-neutral-300",
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