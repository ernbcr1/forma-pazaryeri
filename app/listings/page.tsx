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
  price: number;
  city: string | null;
  status: string;
  category: string;
  ai_public_label: string | null;
  created_at: string;
  listing_images: ListingImage[] | null;
};

type FavoriteCount = {
  listing_id: string;
  favorite_count: number;
};

type Favorite = {
  listing_id: string;
};

const categories = [
  { key: "all", label: "Tümü" },
  { key: "shirt", label: "Forma" },
  { key: "training", label: "Antrenman" },
  { key: "boots", label: "Krampon" },
  { key: "scarf", label: "Atkı" },
  { key: "jacket", label: "Ceket" },
  { key: "shorts", label: "Şort" },
  { key: "goalkeeper", label: "Kaleci" },
  { key: "accessory", label: "Aksesuar" },
  { key: "collectible", label: "Koleksiyon" },
];

const brandOptions = [
  "Tümü",
  "Adidas",
  "Nike",
  "Puma",
  "Umbro",
  "Kappa",
  "Macron",
  "Joma",
  "Hummel",
  "Castore",
  "New Balance",
  "Mizuno",
  "Le Coq Sportif",
  "Lotto",
  "Diadora",
  "Errea",
  "Kelme",
  "Reebok",
  "Under Armour",
  "Belirtilmiyor",
  "Diğer",
];

const sizeOptions = [
  "Tümü",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "Çocuk XS",
  "Çocuk S",
  "Çocuk M",
  "Çocuk L",
  "Çocuk XL",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "40.5",
  "41",
  "42",
  "42.5",
  "43",
  "44",
  "44.5",
  "45",
  "46",
  "47",
  "Standart",
  "Tek beden",
  "Belirtilmiyor",
];

const cityOptions = [
  "Tümü",
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>(
    {}
  );
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("Tümü");
  const [selectedSize, setSelectedSize] = useState("Tümü");
  const [selectedCity, setSelectedCity] = useState("Tümü");
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);
    setCurrentUserEmail(user?.email ?? null);

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select(
        `
        *,
        listing_images(image_url, sort_order)
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (listingError) {
      setMessage("İlanlar yüklenemedi: " + listingError.message);
      setLoading(false);
      return;
    }

    const activeListings = (listingData ?? []) as Listing[];
    setListings(activeListings);

    const { data: countData } = await supabase
      .from("listing_favorite_counts")
      .select("*");

    const countMap: Record<string, number> = {};

    ((countData ?? []) as FavoriteCount[]).forEach((item) => {
      countMap[item.listing_id] = item.favorite_count;
    });

    setFavoriteCounts(countMap);

    if (user) {
      const { data: favoriteData } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      const userFavoriteIds = new Set(
        ((favoriteData ?? []) as Favorite[]).map((item) => item.listing_id)
      );

      setFavoriteIds(userFavoriteIds);
    } else {
      setFavoriteIds(new Set());
    }

    setLoading(false);
  }

  async function toggleFavorite(listing: Listing) {
    if (!currentUserId) {
      window.location.href = "/auth";
      return;
    }

    if (listing.user_id === currentUserId) {
      setMessage("Kendi ilanını favorilerine ekleyemezsin.");
      return;
    }

    const isFavorite = favoriteIds.has(listing.id);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("listing_id", listing.id);

      if (error) {
        setMessage("Favoriden çıkarılamadı: " + error.message);
        return;
      }

      setFavoriteIds((currentIds) => {
        const updatedIds = new Set(currentIds);
        updatedIds.delete(listing.id);
        return updatedIds;
      });

      setFavoriteCounts((currentCounts) => ({
        ...currentCounts,
        [listing.id]: Math.max((currentCounts[listing.id] ?? 1) - 1, 0),
      }));

      window.dispatchEvent(new Event("favorites-updated"));
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: currentUserId,
      listing_id: listing.id,
    });

    if (error) {
      setMessage("Favoriye eklenemedi: " + error.message);
      return;
    }

    setFavoriteIds((currentIds) => {
      const updatedIds = new Set(currentIds);
      updatedIds.add(listing.id);
      return updatedIds;
    });

    setFavoriteCounts((currentCounts) => ({
      ...currentCounts,
      [listing.id]: (currentCounts[listing.id] ?? 0) + 1,
    }));

    await supabase.from("notifications").insert({
      user_id: listing.user_id,
      actor_id: currentUserId,
      actor_email: currentUserEmail,
      listing_id: listing.id,
      type: "favorite_added",
      title: `"${listing.title}" başlıklı ilanınız favorilere eklendi.`,
      body:
        "Bir kullanıcı ilanınızı favorilerine ekledi. Bu ürün dikkat çekiyor. Satış şansınızı artırmak için ilanınızı güncel tutabilir ve gelen mesajları takip edebilirsiniz.",
    });

    window.dispatchEvent(new Event("favorites-updated"));
    window.dispatchEvent(new Event("notifications-updated"));
  }

  function clearFilters() {
    setSearchText("");
    setSelectedCategory("all");
    setSelectedBrand("Tümü");
    setSelectedSize("Tümü");
    setSelectedCity("Tümü");
    setSortType("newest");
  }

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (selectedCategory !== "all") {
      result = result.filter((listing) => listing.category === selectedCategory);
    }

    if (selectedBrand !== "Tümü") {
      result = result.filter((listing) => {
        const brand = listing.brand || "Belirtilmiyor";
        return brand === selectedBrand;
      });
    }

    if (selectedSize !== "Tümü") {
      result = result.filter((listing) => {
        const size = listing.size || "Belirtilmiyor";
        return size === selectedSize;
      });
    }

    if (selectedCity !== "Tümü") {
      result = result.filter((listing) => {
        const city = listing.city || "Belirtilmiyor";
        return city === selectedCity;
      });
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
          categoryText(listing.category),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(cleanSearch);
      });
    }

    if (sortType === "newest") {
      result.sort(
        (first, second) =>
          new Date(second.created_at).getTime() -
          new Date(first.created_at).getTime()
      );
    }

    if (sortType === "price_low") {
      result.sort((first, second) => Number(first.price) - Number(second.price));
    }

    if (sortType === "price_high") {
      result.sort((first, second) => Number(second.price) - Number(first.price));
    }

    if (sortType === "favorite_high") {
      result.sort(
        (first, second) =>
          (favoriteCounts[second.id] ?? 0) - (favoriteCounts[first.id] ?? 0)
      );
    }

    return result;
  }, [
    listings,
    selectedCategory,
    selectedBrand,
    selectedSize,
    selectedCity,
    searchText,
    sortType,
    favoriteCounts,
  ]);

  const hasActiveFilter =
    searchText.trim() ||
    selectedCategory !== "all" ||
    selectedBrand !== "Tümü" ||
    selectedSize !== "Tümü" ||
    selectedCity !== "Tümü" ||
    sortType !== "newest";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-7 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900">
          <div className="relative p-6 md:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(201,166,107,0.16),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(0,51,102,0.28),transparent_24%)]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />

                  <span className="text-[11px] font-black uppercase tracking-[0.24em] text-yellow-300">
                    elFormazione Market
                  </span>
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
                  Seçili futbol ürünleri
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
                  Orijinal ve lisanslı ürün beyanıyla yayınlanan formalar,
                  antrenman ürünleri, aksesuarlar ve koleksiyon parçaları.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/create-listing"
                  className="rounded-full bg-white px-7 py-4 text-center text-sm font-black text-black hover:bg-neutral-200"
                >
                  İlan Ver
                </Link>

                <Link
                  href="/rules"
                  className="rounded-full border border-neutral-800 px-7 py-4 text-center text-sm font-black text-neutral-200 hover:bg-neutral-900"
                >
                  İlan Kuralları
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_230px]">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Kulüp, sezon, marka, ürün ara..."
              className="w-full rounded-full border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-neutral-500"
            />

            <select
              value={sortType}
              onChange={(event) => setSortType(event.target.value)}
              className="w-full rounded-full border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm outline-none focus:border-neutral-500"
            >
              <option value="newest">En yeni</option>
              <option value="price_low">Fiyat düşükten yükseğe</option>
              <option value="price_high">Fiyat yüksekten düşüğe</option>
              <option value="favorite_high">En çok favorilenen</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-max gap-2 pb-1">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selectedCategory === category.key
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <FilterSelect
              label="Marka"
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={brandOptions}
            />

            <FilterSelect
              label="Beden / Numara"
              value={selectedSize}
              onChange={setSelectedSize}
              options={sizeOptions}
            />

            <FilterSelect
              label="Şehir"
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityOptions}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-black text-neutral-300">
              {filteredListings.length}
            </span>{" "}
            ilan gösteriliyor
            {searchText.trim() ? ` • "${searchText.trim()}" araması` : ""}
          </p>

          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="w-fit rounded-full border border-neutral-800 px-4 py-2 text-left text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              Filtreleri temizle
            </button>
          )}
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-neutral-400">
            İlanlar yükleniyor...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-black">Sonuç bulunamadı</h2>

            <p className="mt-3 text-neutral-400">
              Arama kelimesini veya filtreleri değiştirerek tekrar deneyebilirsin.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 rounded-full bg-white px-6 py-3 font-black text-black hover:bg-neutral-200"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => {
              const coverImage = getCoverImage(listing);
              const isFavorite = favoriteIds.has(listing.id);
              const favoriteCount = favoriteCounts[listing.id] ?? 0;

              return (
                <article
                  key={listing.id}
                  className="group overflow-hidden rounded-[1.9rem] border border-neutral-800 bg-neutral-900 transition duration-200 hover:-translate-y-1 hover:border-neutral-600"
                >
                  <div className="relative aspect-[4/5] bg-neutral-950">
                    <Link href={`/listings/${listing.id}`}>
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-600">
                          Görsel yok
                        </div>
                      )}
                    </Link>

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                          {categoryText(listing.category)}
                        </span>

                        <span className="rounded-full bg-yellow-950/90 px-3 py-1 text-[11px] font-bold text-yellow-300 backdrop-blur">
                          {listing.ai_public_label || "elF Check"}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleFavorite(listing)}
                        className={`shrink-0 rounded-full px-3 py-2 text-sm font-black backdrop-blur ${
                          isFavorite
                            ? "bg-white text-black"
                            : "bg-black/70 text-white hover:bg-white hover:text-black"
                        }`}
                      >
                        {isFavorite ? "♥" : "♡"} {favoriteCount}
                      </button>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/listings/${listing.id}`}>
                          <h2 className="line-clamp-2 text-base font-black leading-5 hover:text-neutral-300">
                            {listing.title}
                          </h2>
                        </Link>

                        <p className="mt-1 truncate text-sm text-neutral-500">
                          {listing.club || "Kulüp belirtilmedi"}
                          {listing.season ? ` • ${listing.season}` : ""}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-base font-black text-white">
                        {Number(listing.price).toLocaleString("tr-TR")}₺
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
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
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 text-sm">
                      <span className="truncate text-neutral-500">
                        {listing.city || "Konum yok"}
                      </span>

                      <Link
                        href={`/listings/${listing.id}`}
                        className="shrink-0 font-black text-white hover:text-neutral-300"
                      >
                        İlanı Gör →
                      </Link>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-neutral-800 bg-neutral-950 px-5 py-3 text-sm outline-none focus:border-neutral-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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