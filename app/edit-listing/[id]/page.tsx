"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type ListingImage = {
  id: string;
  image_url: string;
  storage_path: string;
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
  originality_declaration: boolean | null;
  listing_images: ListingImage[] | null;
};

export default function EditListingPage() {
  const params = useParams();
  const listingId = String(params.id);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadListing();
  }, [listingId]);

  async function loadListing() {
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
      .from("listings")
      .select(
        `
        *,
        listing_images(
          id,
          image_url,
          storage_path,
          sort_order
        )
      `
      )
      .eq("id", listingId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      setMessage("İlan yüklenemedi: " + error.message);
      setLoading(false);
      return;
    }

    const listingData = data as Listing;

    setListing(listingData);
    setPrice(String(listingData.price || ""));
    setDescription(listingData.description || "");

    const sortedImages = [...(listingData.listing_images ?? [])].sort(
      (first, second) => first.sort_order - second.sort_order
    );

    setExistingImages(sortedImages);
    setLoading(false);
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      if (!saving) {
        formRef.current?.requestSubmit();
      }

      return;
    }

    if (event.key === "Enter" && tagName !== "textarea") {
      event.preventDefault();
    }
  }

  async function updateListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUserId || !listing) return;

    setMessage("");

    if (!price || Number(price) <= 0) {
      setMessage("Geçerli bir fiyat girmelisin.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("listings")
      .update({
        price: Number(price),
        currency: "TRY",
        description: description.trim(),
        status: "pending",
        verification_status: "not_checked",
        ai_public_label: "elF Check bekleniyor",
        ai_admin_note: null,
        ai_risk_score: null,
        requires_manual_review: true,
        details: {
          category_label: categoryText(listing.category),
          currency: "TRY",
          source: "edit-listing-price-description-only",
          editable_fields: ["price", "description"],
          category_locked: true,
        },
      })
      .eq("id", listing.id)
      .eq("user_id", currentUserId);

    if (error) {
      setMessage("İlan güncellenemedi: " + error.message);
      setSaving(false);
      return;
    }

    setMessage(
      "Fiyat ve açıklama güncellendi. İlan tekrar admin onayına gönderildi."
    );

    setSaving(false);

    setTimeout(() => {
      window.location.href = "/profile";
    }, 1200);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-5xl">
          <p className="text-neutral-400">İlan düzenleme ekranı yükleniyor...</p>
        </section>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
          <h1 className="text-2xl font-black">İlan bulunamadı</h1>

          <p className="mt-3 text-neutral-400">
            Bu ilan silinmiş olabilir veya düzenleme yetkin olmayabilir.
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
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            İlanı Düzenle
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
            Yayın bütünlüğü için bu ekranda yalnızca fiyat ve açıklama
            düzenlenebilir. Kategori, başlık, fotoğraf ve ürün özellikleri
            değiştirilemez.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={updateListing}
          onKeyDown={handleFormKeyDown}
          className="space-y-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:p-8"
        >
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-neutral-500">İlan Bilgileri</p>
                <h2 className="mt-1 text-2xl font-black">{listing.title}</h2>
              </div>

              <span className={statusClass(listing.status)}>
                {statusText(listing.status)}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ReadOnlyField label="Kategori" value={categoryText(listing.category)} />
              <ReadOnlyField label="Kulüp / Takım" value={listing.club} />
              <ReadOnlyField label="Sezon" value={listing.season} />
              <ReadOnlyField label="Marka" value={listing.brand} />
              <ReadOnlyField label="Beden / Numara" value={listing.size} />
              <ReadOnlyField label="Kondisyon" value={listing.condition} />
              <ReadOnlyField
                label="Orijinallik Durumu"
                value={listing.authenticity}
              />
              <ReadOnlyField label="Şehir" value={listing.city} />
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-900 bg-yellow-950/40 p-4 text-sm leading-6 text-yellow-200">
              Bu alanlar kilitlidir. Yanlış kategori, başlık, beden, marka veya
              fotoğraf varsa bu ilanı yayından kaldırıp doğru bilgilerle yeni
              ilan oluşturmalısın.
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <label className="mb-3 block text-sm font-semibold">
              Mevcut Fotoğraflar
            </label>

            {existingImages.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Mevcut fotoğraf bulunmuyor.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                  >
                    <img
                      src={image.image_url}
                      alt="İlan fotoğrafı"
                      className="h-32 w-full object-cover"
                    />

                    <div className="p-3">
                      <p className="text-xs text-neutral-500">
                        Fotoğraf kilitli
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fiyat (TL)
              </label>

              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                type="number"
                min="1"
                placeholder="Örn: 2500"
                className="input-style"
              />

              <p className="mt-2 text-xs text-neutral-500">
                Enter formu göndermez. Ctrl + Enter kaydeder.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Açıklama</label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ürünün kondisyonu, kusurları, ölçüleri, fatura/etiket bilgisi ve orijinallik detaylarını yaz."
              className="input-style min-h-36"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Enter: alt satır · Ctrl + Enter: fiyat ve açıklamayı kaydedip
              onaya gönderir
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/profile"
              className="rounded-full border border-neutral-700 px-6 py-3 text-center font-semibold hover:bg-neutral-800"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-white px-8 py-3 font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Fiyat ve Açıklamayı Kaydet"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold text-neutral-200">
        {value || "Belirtilmiyor"}
      </p>
    </div>
  );
}

function categoryText(category: string) {
  if (category === "shirt") return "Forma";
  if (category === "training") return "Antrenman Ürünü";
  if (category === "boots") return "Krampon";
  if (category === "scarf") return "Atkı";
  if (category === "jacket") return "Ceket / Mont";
  if (category === "shorts") return "Şort";
  if (category === "goalkeeper") return "Kaleci Ürünü";
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

  return `${baseClass} bg-neutral-900 text-neutral-300`;
}