"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncement();
  }, [placement]);

  async function loadAnnouncement() {
    setLoading(true);

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .in("placement", [placement, "global"])
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Duyuru alınamadı:", error.message);
      setAnnouncement(null);
    } else {
      setAnnouncement((data as Announcement) ?? null);
    }

    setLoading(false);
  }

  if (loading || !announcement) {
    return null;
  }

  const buttonLink = announcement.button_link || "/listings";
  const buttonText = announcement.button_text || "Detayları Gör";

  return (
    <section className="mb-6 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#050b18] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        {announcement.image_url ? (
          <div className="relative min-h-[230px] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
            <Image
              src={announcement.image_url}
              alt={announcement.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 48vw"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#020713]/75 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="relative min-h-[230px] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(201,166,107,0.24),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(0,51,102,0.55),transparent_34%),linear-gradient(135deg,#050b18,#020713)] lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-[#c9a66b]/30 px-6 py-3 text-xs font-black uppercase tracking-[0.28em] text-[#ead8b5]">
                elFormazione
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-center p-6 md:p-9 lg:p-10">
          <div className="mb-5 inline-flex w-fit items-center gap-3 rounded-full border border-[#c9a66b]/25 bg-[#c9a66b]/10 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a66b]" />
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ead8b5]">
              Duyuru
            </span>
          </div>

          <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.06em] text-white md:text-5xl">
            {announcement.title}
          </h2>

          {announcement.description && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d8e2ee]/75 md:text-base">
              {announcement.description}
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
        </div>
      </div>
    </section>
  );
}