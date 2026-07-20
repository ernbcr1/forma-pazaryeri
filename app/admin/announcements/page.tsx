"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  placement: string;
  announcement_type: string;
  is_active: boolean;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const MAX_IMAGE_SIZE_MB = 6;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

type FilterKey = "all" | "active" | "passive" | "home" | "global";

export default function AdminAnnouncementsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [placement, setPlacement] = useState("home");
  const [announcementType, setAnnouncementType] = useState("info");
  const [priority, setPriority] = useState("0");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  async function checkAdminAndLoad() {
    setCheckingAdmin(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      setLoading(false);
      showMessage("Bu sayfayı görüntülemek için giriş yapmalısın.", "error", false);
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) {
      showMessage("Admin kontrolü yapılamadı: " + adminError.message, "error", false);
      setIsAdmin(false);
      setCheckingAdmin(false);
      setLoading(false);
      return;
    }

    if (!adminData) {
      showMessage("Bu sayfayı görüntülemek için admin yetkisi gerekli.", "error", false);
      setIsAdmin(false);
      setCheckingAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    setCheckingAdmin(false);
    await loadAnnouncements();
  }

  async function loadAnnouncements() {
    setLoading(true);

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      showMessage("Duyurular alınamadı: " + error.message, "error", false);
    } else {
      setAnnouncements((data ?? []) as Announcement[]);
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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showMessage("Sadece görsel dosyası yükleyebilirsin.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showMessage(
        `Duyuru görseli en fazla ${MAX_IMAGE_SIZE_MB}MB olabilir.`,
        "error"
      );
      event.target.value = "";
      return;
    }

    setImageFile(file);
    event.target.value = "";
  }

  async function uploadImage(file: File) {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeName =
      file.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "")
        .toLowerCase() || `announcement.${fileExt}`;

    const filePath = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("announcement-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("announcement-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleCreateAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      showMessage("Duyuru başlığı zorunlu.", "error");
      return;
    }

    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      showMessage("Bitiş tarihi başlangıç tarihinden sonra olmalı.", "error");
      return;
    }

    if (buttonLink.trim() && !buttonLink.trim().startsWith("/")) {
      showMessage("Buton linki site içi olmalı. Örn: /create-listing", "error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("announcements").insert({
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        button_text: buttonText.trim() || null,
        button_link: buttonLink.trim() || null,
        placement,
        announcement_type: announcementType,
        is_active: true,
        priority: Number(priority) || 0,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        created_by: user?.id ?? null,
      });

      if (error) {
        showMessage("Duyuru eklenemedi: " + error.message, "error");
      } else {
        showMessage("Duyuru başarıyla eklendi.", "success");
        resetForm();
        await loadAnnouncements();
      }
    } catch (error) {
      showMessage(
        error instanceof Error
          ? "Görsel yüklenemedi: " + error.message
          : "Duyuru eklenirken bilinmeyen hata oluştu.",
        "error"
      );
    }

    setSaving(false);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setButtonText("");
    setButtonLink("");
    setPlacement("home");
    setAnnouncementType("info");
    setPriority("0");
    setStartsAt("");
    setEndsAt("");
    setImageFile(null);
    setPreviewUrl("");
  }

  async function toggleActive(announcement: Announcement) {
    setMessage("");

    const { error } = await supabase
      .from("announcements")
      .update({
        is_active: !announcement.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", announcement.id);

    if (error) {
      showMessage("Duyuru güncellenemedi: " + error.message, "error");
    } else {
      showMessage(
        announcement.is_active ? "Duyuru pasifleştirildi." : "Duyuru aktif yapıldı.",
        "success"
      );
      await loadAnnouncements();
    }
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm("Bu duyuruyu silmek istediğine emin misin?");

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Son kez onayla: Duyuru kalıcı olarak silinecek."
    );

    if (!secondConfirm) return;

    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      showMessage("Duyuru silinemedi: " + error.message, "error");
    } else {
      showMessage("Duyuru silindi.", "success");
      await loadAnnouncements();
    }
  }

  const counts = useMemo(() => {
    return {
      total: announcements.length,
      active: announcements.filter((item) => item.is_active).length,
      passive: announcements.filter((item) => !item.is_active).length,
      home: announcements.filter((item) => item.placement === "home").length,
      global: announcements.filter((item) => item.placement === "global").length,
    };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (activeFilter === "all") return announcements;

    if (activeFilter === "active") {
      return announcements.filter((announcement) => announcement.is_active);
    }

    if (activeFilter === "passive") {
      return announcements.filter((announcement) => !announcement.is_active);
    }

    if (activeFilter === "home") {
      return announcements.filter((announcement) => announcement.placement === "home");
    }

    if (activeFilter === "global") {
      return announcements.filter(
        (announcement) => announcement.placement === "global"
      );
    }

    return announcements;
  }, [announcements, activeFilter]);

  if (checkingAdmin || loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">Duyuru paneli yükleniyor...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
          <h1 className="text-3xl font-black">Yetki gerekli</h1>

          <p className="mt-4 text-sm leading-7 text-neutral-400">{message}</p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-200"
          >
            Ana Sayfaya Dön
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
                Admin Duyurular
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Duyuruları yönet.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Ana sayfada veya tüm sitede gösterilecek görselli/yazılı
              duyuruları buradan oluşturabilir, aktif/pasif yapabilir ve
              silebilirsin.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Admin Panel
              </Link>

              <button
                onClick={loadAnnouncements}
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Yenile
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Duyuru Özeti
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Toplam" value={String(counts.total)} />
              <StatCard label="Aktif" value={String(counts.active)} />
              <StatCard label="Ana Sayfa" value={String(counts.home)} />
              <StatCard label="Tüm Site" value={String(counts.global)} />
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-black text-neutral-200">
                Görsel önerisi
              </p>

              <p className="mt-2 text-xs leading-6 text-neutral-500">
                Duyuru görsellerini 9:16 veya geniş kompozisyonlu yükleyebilirsin.
                Mobilde görsel arka plan gibi kullanılacağı için ortadaki yazılar
                boşluklu olursa daha iyi görünür.
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
              active={activeFilter === "active"}
              onClick={() => setActiveFilter("active")}
              label="Aktif"
              count={counts.active}
            />

            <FilterButton
              active={activeFilter === "passive"}
              onClick={() => setActiveFilter("passive")}
              label="Pasif"
              count={counts.passive}
            />

            <FilterButton
              active={activeFilter === "home"}
              onClick={() => setActiveFilter("home")}
              label="Ana Sayfa"
              count={counts.home}
            />

            <FilterButton
              active={activeFilter === "global"}
              onClick={() => setActiveFilter("global")}
              label="Tüm Site"
              count={counts.global}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleCreateAnnouncement}
            className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:p-6"
          >
            <h2 className="text-2xl font-black">Yeni Duyuru Ekle</h2>

            <p className="mt-2 text-sm leading-7 text-neutral-500">
              Başlık zorunlu. Görsel, açıklama ve buton alanları isteğe bağlıdır.
            </p>

            <div className="mt-6 space-y-4">
              <Field label="Başlık">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="input-style"
                  placeholder="Kurucu Satıcı Dönemi Başladı"
                />
              </Field>

              <Field label="Açıklama">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="input-style min-h-32 resize-none"
                  placeholder="İlk 100 satıcı için ücretsiz listeleme ve özel rozet dönemi başladı."
                />
              </Field>

              <Field label="Duyuru görseli">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-neutral-700 bg-neutral-950 px-5 py-7 text-center hover:border-neutral-500">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <span className="text-3xl">🖼️</span>

                  <span className="mt-3 text-sm font-black text-white">
                    Görsel seç
                  </span>

                  <span className="mt-2 text-xs leading-6 text-neutral-500">
                    En fazla {MAX_IMAGE_SIZE_MB}MB görsel yükleyebilirsin.
                  </span>
                </label>

                {previewUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                    <img
                      src={previewUrl}
                      alt="Duyuru önizleme"
                      className="h-56 w-full object-cover"
                    />

                    <div className="flex items-center justify-between gap-3 p-3">
                      <p className="truncate text-xs font-bold text-neutral-400">
                        {imageFile?.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="rounded-full border border-red-800 bg-red-950 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-900"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                )}
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Buton yazısı">
                  <input
                    value={buttonText}
                    onChange={(event) => setButtonText(event.target.value)}
                    className="input-style"
                    placeholder="İlan Ver"
                  />
                </Field>

                <Field label="Buton linki">
                  <input
                    value={buttonLink}
                    onChange={(event) => setButtonLink(event.target.value)}
                    className="input-style"
                    placeholder="/create-listing"
                  />

                  <p className="mt-2 text-xs text-neutral-500">
                    Site içi link kullan. Örn: /listings, /create-listing
                  </p>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Gösterim yeri">
                  <select
                    value={placement}
                    onChange={(event) => setPlacement(event.target.value)}
                    className="input-style"
                  >
                    <option value="home">Ana sayfa</option>
                    <option value="global">Tüm site</option>
                  </select>
                </Field>

                <Field label="Duyuru türü">
                  <select
                    value={announcementType}
                    onChange={(event) =>
                      setAnnouncementType(event.target.value)
                    }
                    className="input-style"
                  >
                    <option value="info">Bilgi</option>
                    <option value="campaign">Kampanya</option>
                    <option value="maintenance">Bakım</option>
                    <option value="launch">Lansman</option>
                  </select>
                </Field>

                <Field label="Öncelik">
                  <input
                    type="number"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="input-style"
                    placeholder="0"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Başlangıç tarihi">
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className="input-style"
                  />
                </Field>

                <Field label="Bitiş tarihi">
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                    className="input-style"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-white px-6 py-4 text-sm font-black text-black hover:bg-neutral-200 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Duyuruyu Yayına Al"}
              </button>
            </div>
          </form>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:p-6">
            <h2 className="text-2xl font-black">Mevcut Duyurular</h2>

            <p className="mt-2 text-sm leading-7 text-neutral-500">
              Aktif duyurular ana sayfadaki duyuru alanında öncelik sırasına göre
              görünür.
            </p>

            <div className="mt-6 space-y-4">
              {filteredAnnouncements.length === 0 && (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
                  <p className="text-sm text-neutral-500">
                    Bu filtreye uygun duyuru yok.
                  </p>
                </div>
              )}

              {filteredAnnouncements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="overflow-hidden rounded-[1.7rem] border border-neutral-800 bg-neutral-950"
                >
                  {announcement.image_url && (
                    <div className="h-52 w-full bg-neutral-900">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          announcement.is_active
                            ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                            : "border-red-900 bg-red-950 text-red-300"
                        }`}
                      >
                        {announcement.is_active ? "Aktif" : "Pasif"}
                      </span>

                      <span className="rounded-full border border-neutral-800 px-3 py-1 text-xs font-bold text-neutral-400">
                        {announcement.placement === "global"
                          ? "Tüm site"
                          : "Ana sayfa"}
                      </span>

                      <span className="rounded-full border border-neutral-800 px-3 py-1 text-xs font-bold text-neutral-400">
                        {typeText(announcement.announcement_type)}
                      </span>

                      <span className="rounded-full border border-neutral-800 px-3 py-1 text-xs font-bold text-neutral-400">
                        Öncelik: {announcement.priority}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-black">
                      {announcement.title}
                    </h3>

                    {announcement.description && (
                      <p className="mt-2 text-sm leading-7 text-neutral-400">
                        {announcement.description}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <InfoBox
                        label="Buton"
                        value={
                          announcement.button_text
                            ? `${announcement.button_text} → ${
                                announcement.button_link || "/listings"
                              }`
                            : "Yok"
                        }
                      />

                      <InfoBox
                        label="Tarih"
                        value={dateRangeText(
                          announcement.starts_at,
                          announcement.ends_at
                        )}
                      />
                    </div>

                    <p className="mt-4 text-xs font-medium text-neutral-600">
                      Oluşturulma: {formatDate(announcement.created_at)}
                    </p>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => toggleActive(announcement)}
                        className="rounded-full border border-neutral-800 px-5 py-3 text-sm font-black text-neutral-300 hover:bg-neutral-900 hover:text-white"
                      >
                        {announcement.is_active ? "Pasifleştir" : "Aktif Yap"}
                      </button>

                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="rounded-full border border-red-900 bg-red-950 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-900"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
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
    <label className="block">
      <span className="mb-2 block text-sm font-black text-neutral-300">
        {label}
      </span>

      {children}
    </label>
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-neutral-300">{value}</p>
    </div>
  );
}

function typeText(type: string) {
  if (type === "campaign") return "Kampanya";
  if (type === "maintenance") return "Bakım";
  if (type === "launch") return "Lansman";
  return "Bilgi";
}

function dateRangeText(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) return "Süresiz";
  if (startsAt && !endsAt) return `${formatDate(startsAt)} itibarıyla`;
  if (!startsAt && endsAt) return `${formatDate(endsAt)} tarihine kadar`;
  return `${formatDate(startsAt as string)} - ${formatDate(endsAt as string)}`;
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