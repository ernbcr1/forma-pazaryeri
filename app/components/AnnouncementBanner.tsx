"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

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

export default function AnnouncementBanner({
  placement = "home",
}: {
  placement?: "home" | "global";
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAnnouncements();
  }, [placement]);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) =>
        current + 1 >= announcements.length ? 0 : current + 1
      );
    }, 7000);

    return () => window.clearInterval(timer);
  }, [announcements.length]);

  async function loadAnnouncements() {
    setLoading(true);
    setFailedImages({});
    setActiveIndex(0);

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .in("placement", [placement, "global"])
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error("Duyurular alınamadı:", error.message);
      setAnnouncements([]);
    } else {
      setAnnouncements((data ?? []) as Announcement[]);
    }

    setLoading(false);
  }

  function goPrevious() {
    if (announcements.length <= 1) return;

    setActiveIndex((current) =>
      current - 1 < 0 ? announcements.length - 1 : current - 1
    );
  }

  function goNext() {
    if (announcements.length <= 1) return;

    setActiveIndex((current) =>
      current + 1 >= announcements.length ? 0 : current + 1
    );
  }

  if (loading || announcements.length === 0) return null;

  const announcement = announcements[activeIndex];
  const buttonLink = announcement.button_link || "/listings";
  const buttonText = announcement.button_text || "Detayları Gör";

  const imageUrl = announcement.image_url
    ? `${announcement.image_url}${announcement.image_url.includes("?") ? "&" : "?"}v=${announcement.id}`
    : null;

  const imageFailed = failedImages[announcement.id];

  return (
    <section className="mb-7 overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#050b18] shadow-[0_35px_110px_rgba(0,0,0,0.42)]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_5%,rgba(201,166,107,0.18),transparent_28%),radial-gradient(circle_at_85%_22%,rgba(0,51,102,0.42),transparent_28%)]" />

        <div className="relative z-10 grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex min-h-[360px] flex-col justify-center p-7 md:p-10 lg:p-12">
            <div className="mb-5 inline-flex w-fit items-center gap-3 rounded-full border border-[#c9a66b]/25 bg-[#c9a66b]/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a66b]" />
              <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ead8b5]">
                Duyuru
              </span>
            </div>

            <h2 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.065em] text-white md:text-6xl">
              {announcement.title}
            </h2>

            {announcement.description && (
              <p className="mt-5 max-w-3xl text-sm leading-8 text-[#d8e2ee]/76 md:text-base">
                {announcement.description}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={buttonLink}
                className="rounded-full bg-white px-7 py-3 text-center text-sm font-black text-[#020713] transition hover:bg-[#ead8b5]"
              >
                {buttonText}
              </Link>

              <Link
                href="/listings"
                className="rounded-full border border-white/15 px-7 py-3 text-center text-sm font-black text-white transition hover:border-[#c9a66b]/50 hover:bg-white/[0.06]"
              >
                Marketi Keşfet
              </Link>
            </div>

            {announcements.length > 1 && (
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={goPrevious}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xl font-black text-white hover:bg-white/[0.08]"
                  title="Önceki duyuru"
                >
                  ‹
                </button>

                <div className="flex gap-2">
                  {announcements.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        activeIndex === index
                          ? "w-8 bg-[#c9a66b]"
                          : "w-2.5 bg-white/25 hover:bg-white/45"
                      }`}
                      title={`${index + 1}. duyuru`}
                    />
                  ))}
                </div>

                <button
                  onClick={goNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xl font-black text-white hover:bg-white/[0.08]"
                  title="Sonraki duyuru"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          <div className="relative min-h-[320px] border-t border-white/10 bg-[#020713] lg:border-l lg:border-t-0">
            {imageUrl && !imageFailed ? (
              <Link
                href={buttonLink}
                className="group absolute inset-0 block cursor-pointer"
                title={announcement.title}
              >
                <img
                  src={imageUrl}
                  alt={announcement.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                  onError={() =>
                    setFailedImages((current) => ({
                      ...current,
                      [announcement.id]: true,
                    }))
                  }
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020713]/64 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs font-black text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                  Görsele tıkla, duyuruyu aç
                </div>
              </Link>
            ) : (
              <Link
                href={buttonLink}
                className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(201,166,107,0.24),transparent_30%),linear-gradient(135deg,#08111f,#020713)] p-8"
                title={announcement.title}
              >
                <div className="rounded-[2rem] border border-[#c9a66b]/25 bg-black/25 px-7 py-6 text-center backdrop-blur transition hover:border-[#c9a66b]/50">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ead8b5]">
                    elFormazione
                  </p>

                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Duyuruyu görüntülemek için tıkla.
                  </p>
                </div>
              </Link>
            )}

            {announcements.length > 1 && (
              <div className="pointer-events-none absolute bottom-5 right-5 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs font-black text-white backdrop-blur">
                {activeIndex + 1} / {announcements.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}