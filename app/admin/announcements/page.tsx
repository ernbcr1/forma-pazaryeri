"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

export default function AdminAnnouncementsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

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
      setMessage("Bu sayfayı görüntülemek için giriş yapmalısın.");
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) {
      setMessage("Admin kontrolü yapılamadı: " + adminError.message);
      setIsAdmin(false);
      setCheckingAdmin(false);
      setLoading(false);
      return;
    }

    if (!adminData) {
      setMessage("Bu sayfayı görüntülemek için admin yetkisi gerekli.");
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
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Duyurular alınamadı: " + error.message);
    } else {
      setAnnouncements((data ?? []) as Announcement[]);
    }

    setLoading(false);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  }

  async function uploadImage(file: File) {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    const filePath = `${Date.now()}-${safeName || `announcement.${fileExt}`}`;

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
      setMessage("Duyuru başlığı zorunlu.");
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
        setMessage("Duyuru eklenemedi: " + error.message);
      } else {
        setMessage("Duyuru başarıyla eklendi.");
        resetForm();
        await loadAnnouncements();
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? "Görsel yüklenemedi: " + error.message
          : "Duyuru eklenirken bilinmeyen hata oluştu."
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
      setMessage("Duyuru güncellenemedi: " + error.message);
    } else {
      await loadAnnouncements();
    }
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm("Bu duyuruyu silmek istediğine emin misin?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Duyuru silinemedi: " + error.message);
    } else {
      setMessage("Duyuru silindi.");
      await loadAnnouncements();
    }
  }

  if (checkingAdmin || loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">Duyuru paneli yükleniyor...</p>
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
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-neutral-200"
          >
            Ana Sayfaya Dön
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-neutral-500">Admin Paneli</p>

            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
              Duyurular
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400">
              Ana sayfada veya tüm sitede gösterilecek yazılı/görselli
              duyuruları buradan yönetebilirsin.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-neutral-800 px-5 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              Admin Panel
            </Link>

            <button
              onClick={loadAnnouncements}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-neutral-200"
            >
              Yenile
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleCreateAnnouncement}
            className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6"
          >
            <h2 className="text-2xl font-black">Yeni Duyuru Ekle</h2>

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
                  className="input-style min-h-28 resize-none"
                  placeholder="İlk 100 satıcı için ücretsiz listeleme ve özel rozet dönemi başladı."
                />
              </Field>

              <Field label="Duyuru görseli">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-style"
                />

                {imageFile && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Seçilen görsel: {imageFile.name}
                  </p>
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

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Mevcut Duyurular</h2>

            <div className="mt-6 space-y-4">
              {announcements.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Henüz duyuru eklenmemiş.
                </p>
              )}

              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="overflow-hidden rounded-[1.5rem] border border-neutral-800 bg-neutral-950"
                >
                  {announcement.image_url && (
                    <div className="relative h-44 w-full">
                      <Image
                        src={announcement.image_url}
                        alt={announcement.title}
                        fill
                        className="object-cover"
                        sizes="600px"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              announcement.is_active
                                ? "bg-emerald-950 text-emerald-300"
                                : "bg-red-950 text-red-300"
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

                        {announcement.button_text && (
                          <p className="mt-3 text-xs text-neutral-500">
                            Buton: {announcement.button_text} →{" "}
                            {announcement.button_link || "/listings"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => toggleActive(announcement)}
                        className="rounded-full border border-neutral-800 px-5 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
                      >
                        {announcement.is_active ? "Pasifleştir" : "Aktif Yap"}
                      </button>

                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="rounded-full border border-red-900 px-5 py-3 text-sm font-bold text-red-300 hover:bg-red-950"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
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
      <span className="mb-2 block text-sm font-bold text-neutral-300">
        {label}
      </span>

      {children}
    </label>
  );
}