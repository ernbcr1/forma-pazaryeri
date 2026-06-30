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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, [listingId]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, images.length, selectedImageIndex]);

  const selectedImage = images[selectedImageIndex]?.image_url ?? null;

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
      setSelectedImageIndex(0);
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
    setSelectedImageIndex(0);

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
      typeof listing.price === "number" ? listing.price : Number(listing.price);

    if (!Number.isFinite(numericPrice)) {
      return `${listing.price} ${listing.currency || "TL"}`;
    }

    return `${numericPrice.toLocaleString("tr-TR")} ${listing.currency || "TL"}`;
  }, [listing]);

  function openLightbox(index: number) {
    setSelectedImageIndex(index);
    setZoomed(false);
    setZoomPosition({
      x: 50,
      y: 50,
    });
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
    setZoomed(false);
    setZoomPosition({
      x: 50,
      y: 50,
    });
  }

  function showNextImage() {
    if (images.length <= 1) return;

    setZoomed(false);
    setZoomPosition({
      x: 50,
      y: 50,
    });
    setSelectedImageIndex((current) =>
      current + 1 >= images.length ? 0 : current + 1
    );
  }

  function showPreviousImage() {
    if (images.length <= 1) return;

    setZoomed(false);
    setZoomPosition({
      x: 50,
      y: 50,
    });
    setSelectedImageIndex((current) =>
      current - 1 < 0 ? images.length - 1 : current - 1
    );
  }

  function handleZoomMove(event: React.MouseEvent<HTMLImageElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

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
            {message ||
              "Bu ilan silinmiş, yayından kaldırılmış veya erişime kapatılmış olabilir."}
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
              <button
                type="button"
                onClick={() => openLightbox(selectedImageIndex)}
                className="relative block aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950 text-left"
                title="Fotoğrafı büyüt"
              >
                <img
                  src={selectedImage}
                  alt={listing.title}
                  className="h-full w-full object-contain"
                />

                <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                  🔍 İncele
                </div>
              </button>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] border border-neutral-800 bg-neutral-900 text-neutral-500">
                Fotoğraf yok
              </div>
            )}

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-2xl border bg-neutral-950 ${
                      selectedImageIndex === index
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

      {lightboxOpen && selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 px-4 py-5 backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{listing.title}</p>

                <p className="mt-1 text-xs text-neutral-400">
                  Fotoğraf {selectedImageIndex + 1} / {images.length}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setZoomed((current) => !current);
                    setZoomPosition({
                      x: 50,
                      y: 50,
                    });
                  }}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/10"
                >
                  {zoomed ? "Uzaklaştır" : "🔍 Bölgesel Büyüt"}
                </button>

                <button
                  onClick={closeLightbox}
                  className="rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-neutral-200"
                >
                  Kapat
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black">
              {images.length > 1 && (
                <button
                  onClick={showPreviousImage}
                  className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-black text-black hover:bg-white md:left-5"
                  title="Önceki fotoğraf"
                >
                  ‹
                </button>
              )}

              <div className="h-full w-full overflow-auto">
                <div className="flex min-h-full min-w-full items-center justify-center p-4">
                  <img
                    src={selectedImage}
                    alt={listing.title}
                    onMouseMove={handleZoomMove}
                    onClick={() => setZoomed((current) => !current)}
                    className={`max-h-[78vh] max-w-full object-contain transition-transform duration-150 ${
                      zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                    style={{
                      transform: zoomed ? "scale(2.35)" : "scale(1)",
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                  />
                </div>
              </div>

              {images.length > 1 && (
                <button
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl font-black text-black hover:bg-white md:right-5"
                  title="Sonraki fotoğraf"
                >
                  ›
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setZoomed(false);
                      setZoomPosition({
                        x: 50,
                        y: 50,
                      });
                    }}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-neutral-950 ${
                      selectedImageIndex === index
                        ? "border-white"
                        : "border-white/15"
                    }`}
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

            {zoomed && (
              <p className="mt-3 text-center text-xs text-neutral-400">
                İmleci fotoğraf üzerinde gezdirerek arma, etiket, dikiş ve baskı
                detaylarını bölgesel olarak inceleyebilirsin.
              </p>
            )}
          </div>
        </div>
      )}
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

      <p className="mt-2 text-sm font-bold text-neutral-200">{value || "-"}</p>
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