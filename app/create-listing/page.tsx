"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type CategoryOption = {
  key: string;
  label: string;
  helper: string;
};

const categoryOptions: CategoryOption[] = [
  {
    key: "shirt",
    label: "Forma",
    helper: "Maç forması, taraftar forması, retro forma",
  },
  {
    key: "training",
    label: "Antrenman Ürünü",
    helper: "Antrenman üstü, eşofman, polo, sweatshirt",
  },
  {
    key: "boots",
    label: "Krampon",
    helper: "Futbol ayakkabısı, halı saha, çim saha",
  },
  {
    key: "scarf",
    label: "Atkı",
    helper: "Kulüp atkısı, maç günü atkısı, koleksiyon atkısı",
  },
  {
    key: "jacket",
    label: "Ceket / Mont",
    helper: "Kulüp ceketi, yağmurluk, eşofman üstü",
  },
  {
    key: "shorts",
    label: "Şort",
    helper: "Maç şortu, antrenman şortu",
  },
  {
    key: "goalkeeper",
    label: "Kaleci Ürünü",
    helper: "Kaleci forması, kaleci ekipmanı",
  },
  {
    key: "accessory",
    label: "Aksesuar",
    helper: "Şapka, bere, çanta, rozet, anahtarlık",
  },
  {
    key: "collectible",
    label: "Koleksiyon",
    helper: "İmzalı ürün, bilet, program, özel parça",
  },
];

const clothingSizes = [
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
];

const bootSizes = [
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
];

const oneSizeOptions = ["Standart", "Tek beden", "Belirtilmiyor"];

const brandOptions = [
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

const seasonOptions = [
  "2025/26",
  "2024/25",
  "2023/24",
  "2022/23",
  "2021/22",
  "2020/21",
  "2019/20",
  "2018/19",
  "2017/18",
  "2016/17",
  "2015/16",
  "2014/15",
  "2013/14",
  "2012/13",
  "2011/12",
  "2010/11",
  "2009/10",
  "2008/09",
  "2007/08",
  "2006/07",
  "2005/06",
  "2004/05",
  "2003/04",
  "2002/03",
  "2001/02",
  "2000/01",
  "1990'lar",
  "1980'ler",
  "Vintage",
  "Belirtilmiyor",
];

const conditionOptions = [
  "Yeni / Etiketli",
  "Yeni / Etiketsiz",
  "Çok iyi",
  "İyi",
  "Kullanılmış",
  "Koleksiyonluk",
  "Defolu / Detay açıklamada",
];

const authenticityOptions = [
  "Orijinal / Lisanslı ürün",
  "Mağaza / fatura mevcut",
  "Vintage orijinal",
  "Oyuncu versiyon / player issue",
  "Maçta giyilmiş / match worn iddiası",
  "Orijinallik kontrolü gerekli",
];

const cityOptions = [
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

export default function CreateListingPage() {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("shirt");
  const [club, setClub] = useState("");
  const [season, setSeason] = useState("2025/26");
  const [brand, setBrand] = useState("Adidas");
  const [customBrand, setCustomBrand] = useState("");
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState("Çok iyi");
  const [authenticity, setAuthenticity] = useState("Orijinal / Lisanslı ürün");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [description, setDescription] = useState("");
  const [originalityDeclaration, setOriginalityDeclaration] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sizeOptions = useMemo(() => {
    if (category === "boots") return bootSizes;

    if (
      category === "scarf" ||
      category === "accessory" ||
      category === "collectible"
    ) {
      return oneSizeOptions;
    }

    return clothingSizes;
  }, [category]);

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);

    if (nextCategory === "boots") {
      setSize("42");
      return;
    }

    if (
      nextCategory === "scarf" ||
      nextCategory === "accessory" ||
      nextCategory === "collectible"
    ) {
      setSize("Standart");
      return;
    }

    setSize("M");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) return;

    const allowedFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    const nextFiles = [...files, ...allowedFiles].slice(0, 8);
    setFiles(nextFiles);
  }

  function removeSelectedFile(index: number) {
    setFiles((currentFiles) =>
      currentFiles.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      if (!loading) {
        formRef.current?.requestSubmit();
      }

      return;
    }

    if (event.key === "Enter" && tagName !== "textarea") {
      event.preventDefault();
    }
  }

  async function createListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    if (!title.trim()) {
      setMessage("İlan başlığı boş olamaz.");
      return;
    }

    if (!club.trim()) {
      setMessage("Kulüp / takım alanı boş olamaz.");
      return;
    }

    if (!size.trim()) {
      setMessage("Beden / numara seçmelisin.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setMessage("Geçerli bir fiyat girmelisin.");
      return;
    }

    if (files.length === 0) {
      setMessage("En az 1 ürün fotoğrafı eklemelisin.");
      return;
    }

    if (!originalityDeclaration) {
      setMessage("Orijinallik beyanını onaylamalısın.");
      return;
    }

    setLoading(true);

    const finalBrand = brand === "Diğer" ? customBrand.trim() : brand;

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        title: title.trim(),
        category,
        club: club.trim(),
        season,
        brand: finalBrand || "Belirtilmiyor",
        size,
        condition,
        authenticity,
        price: Number(price),
        currency: "TRY",
        city,
        description: description.trim(),
        status: "pending",
        originality_declaration: originalityDeclaration,
        verification_status: "not_checked",
        ai_public_label: "elF Check bekleniyor",
        ai_admin_note: null,
        ai_risk_score: null,
        requires_manual_review: true,
        seller_country: "TR",
        details: {
          category_label: categoryText(category),
          currency: "TRY",
          source: "create-listing-form",
        },
      })
      .select("id")
      .single();

    if (listingError) {
      setMessage("İlan oluşturulamadı: " + listingError.message);
      setLoading(false);
      return;
    }

    const listingId = listingData.id as string;
    const imageRows = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const safeFileName = file.name
        .toLowerCase()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9.\-_]/g, "");

      const storagePath = `${user.id}/${listingId}/${Date.now()}-${index}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setMessage("Fotoğraf yüklenemedi: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(storagePath);

      imageRows.push({
        listing_id: listingId,
        image_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        sort_order: index,
      });
    }

    const { error: imageInsertError } = await supabase
      .from("listing_images")
      .insert(imageRows);

    if (imageInsertError) {
      setMessage(
        "Fotoğraf kayıtları oluşturulamadı: " + imageInsertError.message
      );
      setLoading(false);
      return;
    }

    setMessage(
      "İlan başarıyla oluşturuldu. Admin kontrolünden sonra yayına alınacak."
    );

    setLoading(false);

    setTimeout(() => {
      window.location.href = "/profile";
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Yeni İlan Ekle
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
            Ürün bilgilerini seçeneklerden seçerek gir. Böylece ilan daha
            düzenli görünür ve filtrelerde daha doğru çalışır.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={createListing}
          onKeyDown={handleFormKeyDown}
          className="space-y-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Ürün Kategorisi
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleCategoryChange(option.key)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    category === option.key
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 bg-neutral-950 text-white hover:border-neutral-600"
                  }`}
                >
                  <p className="font-bold">{option.label}</p>

                  <p
                    className={`mt-2 text-xs leading-5 ${
                      category === option.key
                        ? "text-black/70"
                        : "text-neutral-500"
                    }`}
                  >
                    {option.helper}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                İlan Başlığı
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Örn: 2004/05 Galatasaray İç Saha Forması"
                className="input-style"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Kulüp / Takım
              </label>

              <input
                value={club}
                onChange={(event) => setClub(event.target.value)}
                placeholder="Örn: Galatasaray, Milan, Real Madrid"
                className="input-style"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Sezon</label>

              <select
                value={season}
                onChange={(event) => setSeason(event.target.value)}
                className="input-style"
              >
                {seasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Marka</label>

              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="input-style"
              >
                {brandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {brand === "Diğer" && (
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Diğer Marka
                </label>

                <input
                  value={customBrand}
                  onChange={(event) => setCustomBrand(event.target.value)}
                  placeholder="Marka adını yaz"
                  className="input-style"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                {category === "boots" ? "Numara" : "Beden"}
              </label>

              <select
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className="input-style"
              >
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {category === "boots" ? `EU ${option}` : option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Kondisyon
              </label>

              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="input-style"
              >
                {conditionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Orijinallik Durumu
              </label>

              <select
                value={authenticity}
                onChange={(event) => setAuthenticity(event.target.value)}
                className="input-style"
              >
                {authenticityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Şehir</label>

              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="input-style"
              >
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

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
              Enter: alt satır · Ctrl + Enter: ilanı onaya gönderir
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <label className="mb-3 block text-sm font-semibold">
              Fotoğraflar
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400"
            />

            <p className="mt-3 text-xs leading-5 text-neutral-500">
              En fazla 8 fotoğraf ekleyebilirsin. Ön, arka, etiket, yaka,
              kondisyon ve detay fotoğrafları önerilir.
            </p>

            {files.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-32 w-full object-cover"
                    />

                    <div className="p-3">
                      <p className="truncate text-xs text-neutral-400">
                        {file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="mt-3 rounded-full border border-red-800 bg-red-950 px-3 py-2 text-xs text-red-300 hover:bg-red-900"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex gap-3 rounded-3xl border border-neutral-800 bg-neutral-950 p-5 text-sm leading-6 text-neutral-300">
            <input
              type="checkbox"
              checked={originalityDeclaration}
              onChange={(event) =>
                setOriginalityDeclaration(event.target.checked)
              }
              className="mt-1"
            />

            <span>
              Bu ürünün replika/sahte olmadığını, ilan bilgilerinin doğru
              olduğunu ve elFormazione kalite kontrol sürecine tabi olacağını
              kabul ediyorum.
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/profile"
              className="rounded-full border border-neutral-700 px-6 py-3 text-center font-semibold hover:bg-neutral-800"
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-8 py-3 font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? "İlan oluşturuluyor..." : "İlanı Onaya Gönder"}
            </button>
          </div>
        </form>
      </section>
    </main>
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