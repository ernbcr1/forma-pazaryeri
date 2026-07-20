"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type CategoryOption = {
  key: string;
  label: string;
  helper: string;
};

const MAX_FILES = 8;
const MAX_FILE_SIZE_MB = 6;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

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

  const selectedCategory = useMemo(() => {
    return categoryOptions.find((option) => option.key === category);
  }, [category]);

  const formProgress = useMemo(() => {
    let score = 0;

    if (title.trim()) score += 1;
    if (club.trim()) score += 1;
    if (price && Number(price) > 0) score += 1;
    if (description.trim().length >= 20) score += 1;
    if (files.length > 0) score += 1;
    if (originalityDeclaration) score += 1;

    return Math.round((score / 6) * 100);
  }, [title, club, price, description, files.length, originalityDeclaration]);

  function showMessage(
    nextMessage: string,
    nextType: "info" | "success" | "error" = "info"
  ) {
    setMessage(nextMessage);
    setMessageType(nextType);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

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

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    const oversizedFiles = imageFiles.filter(
      (file) => file.size > MAX_FILE_SIZE_BYTES
    );

    const validFiles = imageFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE_BYTES
    );

    if (imageFiles.length !== selectedFiles.length) {
      showMessage("Sadece görsel dosyaları yükleyebilirsin.", "error");
    }

    if (oversizedFiles.length > 0) {
      showMessage(
        `Bazı fotoğraflar ${MAX_FILE_SIZE_MB}MB üzerinde olduğu için eklenmedi.`,
        "error"
      );
    }

    const remainingSlots = MAX_FILES - files.length;

    if (remainingSlots <= 0) {
      showMessage(`En fazla ${MAX_FILES} fotoğraf ekleyebilirsin.`, "error");
      event.target.value = "";
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      showMessage(
        `En fazla ${MAX_FILES} fotoğraf eklenebilir. Fazla fotoğraflar alınmadı.`,
        "info"
      );
    }

    setFiles((currentFiles) => [...currentFiles, ...filesToAdd]);

    event.target.value = "";
  }

  function removeSelectedFile(index: number) {
    setFiles((currentFiles) =>
      currentFiles.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function moveFile(index: number, direction: "up" | "down") {
    setFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= nextFiles.length) {
        return currentFiles;
      }

      const currentFile = nextFiles[index];
      nextFiles[index] = nextFiles[targetIndex];
      nextFiles[targetIndex] = currentFile;

      return nextFiles;
    });
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
      showMessage("İlan başlığı boş olamaz.", "error");
      return;
    }

    if (!club.trim()) {
      showMessage("Kulüp / takım alanı boş olamaz.", "error");
      return;
    }

    if (!size.trim()) {
      showMessage("Beden / numara seçmelisin.", "error");
      return;
    }

    if (!price || Number(price) <= 0) {
      showMessage("Geçerli bir fiyat girmelisin.", "error");
      return;
    }

    if (files.length === 0) {
      showMessage("En az 1 ürün fotoğrafı eklemelisin.", "error");
      return;
    }

    if (!originalityDeclaration) {
      showMessage("Orijinallik beyanını onaylamalısın.", "error");
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
          photo_count: files.length,
        },
      })
      .select("id")
      .single();

    if (listingError) {
      showMessage("İlan oluşturulamadı: " + listingError.message, "error");
      setLoading(false);
      return;
    }

    const listingId = listingData.id as string;
    const imageRows = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const safeFileName =
        file.name
          .toLowerCase()
          .replaceAll(" ", "-")
          .replace(/[^a-z0-9.\-_]/g, "") || `foto-${index}.jpg`;

      const storagePath = `${user.id}/${listingId}/${Date.now()}-${index}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        showMessage("Fotoğraf yüklenemedi: " + uploadError.message, "error");
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
      showMessage(
        "Fotoğraf kayıtları oluşturulamadı: " + imageInsertError.message,
        "error"
      );
      setLoading(false);
      return;
    }

    showMessage(
      "İlan başarıyla oluşturuldu. Admin kontrolünden sonra yayına alınacak.",
      "success"
    );

    setLoading(false);

    setTimeout(() => {
      window.location.href = "/profile";
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white md:px-8 md:py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem] md:p-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />

              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-yellow-300">
                elFormazione
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Yeni ilan oluştur.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Ürün bilgilerini net gir, fotoğrafları kaliteli yükle ve
              orijinallik beyanını onayla. İlan admin kontrolünden sonra yayına
              alınır.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <MiniPill>Komisyonsuz pazar</MiniPill>
              <MiniPill>elF Check</MiniPill>
              <MiniPill>Orijinal ürün odaklı</MiniPill>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              İlan Hazırlığı
            </p>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-neutral-400">
                <span>Doluluk</span>
                <span>{formProgress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${formProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-neutral-400">
              <ChecklistItem active={Boolean(title.trim())}>
                Başlık girildi
              </ChecklistItem>

              <ChecklistItem active={Boolean(club.trim())}>
                Kulüp / takım girildi
              </ChecklistItem>

              <ChecklistItem active={Boolean(price && Number(price) > 0)}>
                Fiyat girildi
              </ChecklistItem>

              <ChecklistItem active={files.length > 0}>
                Fotoğraf eklendi
              </ChecklistItem>

              <ChecklistItem active={originalityDeclaration}>
                Orijinallik beyanı onaylandı
              </ChecklistItem>
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

        <form
          ref={formRef}
          onSubmit={createListing}
          onKeyDown={handleFormKeyDown}
          className="space-y-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:rounded-[2.4rem] md:p-8"
        >
          <FormSection
            step="01"
            title="Kategori"
            description="Ürünün doğru kategoride görünmesi filtreleme ve arama için önemli."
          >
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
                  <p className="font-black">{option.label}</p>

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

            {selectedCategory && (
              <p className="mt-3 text-xs leading-6 text-neutral-500">
                Seçili kategori:{" "}
                <span className="font-black text-neutral-300">
                  {selectedCategory.label}
                </span>
              </p>
            )}
          </FormSection>

          <FormSection
            step="02"
            title="Ürün Bilgileri"
            description="Başlık, takım, sezon, marka ve beden bilgilerini net seç."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="İlan Başlığı">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Örn: 2004/05 Galatasaray İç Saha Forması"
                  className="input-style"
                />
              </Field>

              <Field label="Kulüp / Takım">
                <input
                  value={club}
                  onChange={(event) => setClub(event.target.value)}
                  placeholder="Örn: Galatasaray, Milan, Real Madrid"
                  className="input-style"
                />
              </Field>

              <Field label="Sezon">
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
              </Field>

              <Field label="Marka">
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
              </Field>

              {brand === "Diğer" && (
                <Field label="Diğer Marka">
                  <input
                    value={customBrand}
                    onChange={(event) => setCustomBrand(event.target.value)}
                    placeholder="Marka adını yaz"
                    className="input-style"
                  />
                </Field>
              )}

              <Field label={category === "boots" ? "Numara" : "Beden"}>
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
              </Field>

              <Field label="Kondisyon">
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
              </Field>

              <Field label="Orijinallik Durumu">
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
              </Field>

              <Field label="Şehir">
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
              </Field>

              <Field label="Fiyat (TL)">
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="Örn: 2500"
                  className="input-style"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            step="03"
            title="Açıklama"
            description="Kusur, ölçü, fatura, etiket ve orijinallik detaylarını burada belirt."
          >
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Örn: Ürün temiz kondisyondadır. Yaka etiketi duruyor. Baskılarda çatlama yok. Ölçü ve detay fotoğrafları eklendi."
              className="input-style min-h-40"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Enter: alt satır · Ctrl + Enter: ilanı onaya gönderir
            </p>
          </FormSection>

          <FormSection
            step="04"
            title="Fotoğraflar"
            description="Ön, arka, etiket, yaka, logo, baskı ve kusur detaylarını ekle."
          >
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-neutral-700 bg-neutral-900 px-5 py-8 text-center hover:border-neutral-500">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <span className="text-3xl">📸</span>

                <span className="mt-3 text-sm font-black text-white">
                  Fotoğraf seç
                </span>

                <span className="mt-2 max-w-md text-xs leading-6 text-neutral-500">
                  En fazla {MAX_FILES} fotoğraf ekleyebilirsin. Her fotoğraf en
                  fazla {MAX_FILE_SIZE_MB}MB olabilir.
                </span>
              </label>

              {files.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                    >
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="h-36 w-full object-cover"
                      />

                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-neutral-300">
                              {index === 0 ? "Kapak fotoğrafı" : `${index + 1}. fotoğraf`}
                            </p>

                            <p className="mt-1 truncate text-xs text-neutral-500">
                              {file.name}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-neutral-950 px-2 py-1 text-[10px] font-black text-neutral-400">
                            {formatFileSize(file.size)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => moveFile(index, "up")}
                            disabled={index === 0}
                            className="rounded-full border border-neutral-800 px-3 py-2 text-xs font-bold text-neutral-400 hover:bg-neutral-800 disabled:opacity-35"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() => moveFile(index, "down")}
                            disabled={index === files.length - 1}
                            className="rounded-full border border-neutral-800 px-3 py-2 text-xs font-bold text-neutral-400 hover:bg-neutral-800 disabled:opacity-35"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="ml-auto rounded-full border border-red-800 bg-red-950 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-900"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection
            step="05"
            title="Orijinallik Beyanı"
            description="elFormazione replika/sahte ürün odaklı bir pazar yeri değildir."
          >
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
          </FormSection>

          <div className="sticky bottom-4 z-20 rounded-[1.7rem] border border-neutral-800 bg-neutral-950/92 p-3 shadow-2xl backdrop-blur md:static md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/profile"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Vazgeç
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-white px-8 py-3 text-sm font-black text-black hover:bg-neutral-200 disabled:opacity-50"
              >
                {loading ? "İlan oluşturuluyor..." : "İlanı Onaya Gönder"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.8rem] border border-neutral-800 bg-neutral-950/45 p-4 md:rounded-[2rem] md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 text-xs font-black text-neutral-400">
              {step}
            </span>

            <h2 className="text-xl font-black tracking-tight text-white">
              {title}
            </h2>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-neutral-200">
        {label}
      </label>

      {children}
    </div>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-black text-neutral-400">
      {children}
    </span>
  );
}

function ChecklistItem({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
          active ? "bg-white text-black" : "border border-neutral-800 text-neutral-600"
        }`}
      >
        {active ? "✓" : "•"}
      </span>

      <span className={active ? "text-neutral-200" : "text-neutral-500"}>
        {children}
      </span>
    </div>
  );
}

function formatFileSize(size: number) {
  const mb = size / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)}MB`;
  }

  return `${Math.round(size / 1024)}KB`;
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