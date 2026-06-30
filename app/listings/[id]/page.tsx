"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

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
  price: number | string | null;
  currency: string | null;
  city: string | null;
  description: string | null;
  status: string | null;
  category: string | null;
  created_at: string;
  seller_country: string | null;
  originality_declaration: string | null;
  verification_status: string | null;
  ai_public_label: string | null;
  ai_admin_note: string | null;
  details: Record<string, unknown> | null;
};

type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number | null;
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = typeof params?.id === "string" ? params.id : "";

  const [listing, setListing] = useState<Listing | null>(null);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, [listingId]);

  async function loadPage() {
    if (!listingId) return;

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listingData) {
      setListing(null);
      setImages([]);
      setSelectedImage(null);
      setLoading(false);
      setMessage("İlan bulunamadı veya görüntüleme yetkin yok.");
      return;
    }

    const typedListing = listingData as Listing;
    setListing(typedListing);

    const { data: imageData } = await supabase
      .from("listing_images")
      .select("*")
      .eq("listing_id", listingId)
      .order("sort_order", { ascending: true });

    const typedImages = (imageData ?? []) as ListingImage[];

    setImages(typedImages);
    setSelectedImage(typedImages[0]?.image_url ?? null);

    const { count } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("listing_id", listingId);

    setFavoriteCount(count ?? 0);

    if (user) {
      const { data: favoriteData } = await supabase
        .from("favorites")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsFavorite(Boolean(favoriteData));
    } else {
      setIsFavorite(false);
    }

    setLoading(false);
  }

  const isOwner = useMemo(() => {
    return Boolean(currentUserId && listing?.user_id === currentUserId);
  }, [currentUserId, listing]);

  const formattedPrice = useMemo(() => {
    if (!listing?.price) return "Fiyat belirtilmedi";

    const numericPrice =
      typeof listing.price === "number"
        ? listing.price
        : Number(listing.price);

    if (!Number.isFinite(numericPrice)) {
      return `${listing.price} ${listing.currency || "TL"}`;
    }

    return `${numericPrice.toLocaleString("tr-TR")} ${
      listing.currency || "TL"
    }`;
  }, [listing]);

  async function toggleFavorite() {
    if (!listing) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (user.id === listing.user_id) {
      setMessage("Kendi ilanını favorilere ekleyemezsin.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("listing_id", listing.id)
        .eq("user_id", user.id);

      if (error) {
        setMessage("Favoriden çıkarılamadı: " + error.message);
      } else {
        setIsFavorite(false);
        setFavoriteCount((current) => Math.max(current - 1, 0));
      }

      setActionLoading(false);
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      listing_id: listing.id,
      user_id: user.id,
    });

    if (error) {
      setMessage("Favoriye eklenemedi: " + error.message);
      setActionLoading(false);
      return;
    }

    setIsFavorite(true);
    setFavoriteCount((current) => current + 1);

    if (listing.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: listing.user_id,
        actor_id: user.id,
        actor_email: user.email ?? null,
        listing_id: listing.id,
        type: "favorite_added",
        title: "İlanın favorilere eklendi",
        body: `"${listing.title}" başlıklı ilanın bir kullanıcı tarafından favorilere eklendi.`,
        is_read: false,
      });
    }

    setActionLoading(false);
  }

  async function contactSeller() {
    if (!listing) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (user.id === listing.user_id) {
      setMessage("Kendi ilanına mesaj gönderemezsin.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", user.id)
      .eq("seller_id", listing.user_id)
      .maybeSingle();

    if (existingConversation?.id) {
      router.push("/messages");
      return;
    }

    const { error } = await supabase.from("conversations").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
    });

    if (error) {
      setMessage("Konuşma başlatılamadı: " + error.message);
      setActionLoading(false);
      return;
    }

    router.push("/messages");
  }

  async function updateListingStatus(nextStatus: "sold" | "removed") {
    if (!listing || !isOwner) return;

    const confirmed = window.confirm(
      nextStatus === "sold"
        ? "Bu ilanı satıldı olarak işaretlemek istiyor musun?"
        : "Bu ilanı yayından kaldırmak istiyor musun?"
    );

    if (!confirmed) return;

    setActionLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        status: nextStatus,
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setMessage("İlan güncellenemedi: " + error.message);
    } else {
      setListing({
        ...listing,
        status: nextStatus,
      });
      setMessage(
        nextStatus === "sold"
          ? "İlan satıldı olarak işaretlendi."
          : "İlan yayından kaldırıldı."
      );
    }

    setActionLoading(false);
  }

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
          <h1 className="text-3xl font-black">İlan bulunamadı</h1>

          <p className="mt-4 text-sm leading-7 text-neutral-400">
            {message || "Bu ilan silinmiş, yayından kaldırılmış veya erişime kapatılmış olabilir."}
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-neutral-200"
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
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/listings"
            className="w-fit rounded-full border border-neutral-800 px-5 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            ← Markete Dön
          </Link>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={listing.status} />
            <span className="rounded-full border border-neutral-800 px-4 py-2 text-xs font-bold text-neutral-400">
              {favoriteCount} favori
            </span>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {selectedImage ? (
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-[4/5] overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950"
                title="Fotoğrafı tam boy aç"
              >
                <img
                  src={selectedImage}
                  alt={listing.title}
                  className="h-full w-full object-contain"
                />

                <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                  Tam boy aç
                </div>
              </a>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] border border-neutral-800 bg-neutral-900 text-neutral-500">
                Fotoğraf yok
              </div>
            )}

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`aspect-square overflow-hidden rounded-2xl border bg-neutral-950 ${
                      selectedImage === image.image_url
                        ? "border-white"
                        : "border-neutral-800"
                    }`}
                    title="Fotoğrafı seç"
                  >
                    <img
                      src={image.image_url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              <p className="text-sm text-neutral-500">
                {listing.category || "Futbol ürünü"}
              </p>

              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                {listing.title}
              </h1>

              <p className="mt-5 text-4xl font-black">{formattedPrice}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoBox label="Kulüp" value={listing.club} />
                <InfoBox label="Sezon" value={listing.season} />
                <InfoBox label="Marka" value={listing.brand} />
                <InfoBox label="Beden" value={listing.size} />
                <InfoBox label="Kondisyon" value={listing.condition} />
                <InfoBox label="Şehir" value={listing.city} />
                <InfoBox label="Ülke" value={listing.seller_country} />
                <InfoBox label="Orijinallik" value={listing.authenticity} />
              </div>

              {listing.ai_public_label && (
                <div className="mt-5 rounded-2xl border border-yellow-800 bg-yellow-950 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                    elF kalite kontrol
                  </p>

                  <p className="mt-2 text-sm leading-7 text-yellow-100">
                    {listing.ai_public_label}
                  </p>
                </div>
              )}

              {listing.description && (
                <div className="mt-6">
                  <h2 className="text-xl font-black">Açıklama</h2>

                  <p className="mt-3 whitespace-pre-line text-sm leading-8 text-neutral-400">
                    {listing.description}
                  </p>
                </div>
              )}

              {listing.originality_declaration && (
                <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                    Satıcı beyanı
                  </p>

                  <p className="mt-2 text-sm leading-7 text-neutral-300">
                    {listing.originality_declaration}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {!isOwner && (
                  <>
                    <button
                      onClick={contactSeller}
                      disabled={actionLoading}
                      className="rounded-full bg-white px-6 py-4 text-sm font-black text-black hover:bg-neutral-200 disabled:opacity-60"
                    >
                      Satıcıya Mesaj Gönder
                    </button>

                    <button
                      onClick={toggleFavorite}
                      disabled={actionLoading}
                      className="rounded-full border border-neutral-800 px-6 py-4 text-sm font-black text-neutral-200 hover:bg-neutral-900 disabled:opacity-60"
                    >
                      {isFavorite ? "Favoriden Çıkar" : "Favoriye Ekle"}
                    </button>
                  </>
                )}

                {isOwner && (
                  <>
                    <Link
                      href={`/edit-listing/${listing.id}`}
                      className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-black hover:bg-neutral-200"
                    >
                      İlanı Düzenle
                    </Link>

                    {listing.status !== "sold" && (
                      <button
                        onClick={() => updateListingStatus("sold")}
                        disabled={actionLoading}
                        className="rounded-full border border-emerald-800 px-6 py-4 text-sm font-black text-emerald-300 hover:bg-emerald-950 disabled:opacity-60"
                      >
                        Satıldı Yap
                      </button>
                    )}

                    {listing.status !== "removed" && (
                      <button
                        onClick={() => updateListingStatus("removed")}
                        disabled={actionLoading}
                        className="rounded-full border border-red-900 px-6 py-4 text-sm font-black text-red-300 hover:bg-red-950 disabled:opacity-60"
                      >
                        Yayından Kaldır
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-black">Güvenli alışveriş notu</h2>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                Ürün hakkında detaylı bilgi almak için site içi mesajlaşmayı
                kullan. Ödeme, teslimat ve ürün doğrulama süreçlerinde dikkatli
                ol. Şüpheli durumlarda işlem yapmadan önce satıcıdan ek fotoğraf
                ve bilgi iste.
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
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-neutral-200">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "active") {
    return (
      <span className="rounded-full border border-emerald-800 bg-emerald-950 px-4 py-2 text-xs font-black text-emerald-300">
        Yayında
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2 text-xs font-black text-yellow-300">
        Onay Bekliyor
      </span>
    );
  }

  if (status === "sold") {
    return (
      <span className="rounded-full border border-blue-800 bg-blue-950 px-4 py-2 text-xs font-black text-blue-300">
        Satıldı
      </span>
    );
  }

  if (status === "removed") {
    return (
      <span className="rounded-full border border-red-900 bg-red-950 px-4 py-2 text-xs font-black text-red-300">
        Yayından Kaldırıldı
      </span>
    );
  }

  return (
    <span className="rounded-full border border-neutral-800 px-4 py-2 text-xs font-black text-neutral-400">
      {status || "Durum yok"}
    </span>
  );
}