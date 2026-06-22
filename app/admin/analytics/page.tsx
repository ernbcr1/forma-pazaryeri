"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type SiteEvent = {
  id: string;
  session_id: string;
  user_id: string | null;
  event_type: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
};

type TopPage = {
  path: string;
  count: number;
};

export default function AdminAnalyticsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [eventsToday, setEventsToday] = useState<SiteEvent[]>([]);
  const [eventsOnline, setEventsOnline] = useState<SiteEvent[]>([]);
  const [eventsSevenDays, setEventsSevenDays] = useState<SiteEvent[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [pendingListings, setPendingListings] = useState(0);
  const [todayListings, setTodayListings] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdminAndLoad();

    const interval = window.setInterval(() => {
      loadAnalytics();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
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

    await loadAnalytics();
  }

  async function loadAnalytics() {
    setLoading(true);

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const onlineStart = new Date(now.getTime() - 5 * 60 * 1000);

    const sevenDaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayEventsResponse,
      onlineEventsResponse,
      sevenDaysEventsResponse,
      totalListingsResponse,
      activeListingsResponse,
      pendingListingsResponse,
      todayListingsResponse,
      totalFavoritesResponse,
    ] = await Promise.all([
      supabase
        .from("site_events")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000),

      supabase
        .from("site_events")
        .select("*")
        .gte("created_at", onlineStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000),

      supabase
        .from("site_events")
        .select("*")
        .gte("created_at", sevenDaysStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(10000),

      supabase.from("listings").select("*", { count: "exact", head: true }),

      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),

      supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString()),

      supabase.from("favorites").select("*", { count: "exact", head: true }),
    ]);

    if (todayEventsResponse.error) {
      setMessage("Bugünkü hareketler alınamadı: " + todayEventsResponse.error.message);
    } else {
      setEventsToday((todayEventsResponse.data ?? []) as SiteEvent[]);
    }

    if (onlineEventsResponse.error) {
      setMessage("Online hareketler alınamadı: " + onlineEventsResponse.error.message);
    } else {
      setEventsOnline((onlineEventsResponse.data ?? []) as SiteEvent[]);
    }

    if (sevenDaysEventsResponse.error) {
      setMessage("7 günlük hareketler alınamadı: " + sevenDaysEventsResponse.error.message);
    } else {
      setEventsSevenDays((sevenDaysEventsResponse.data ?? []) as SiteEvent[]);
    }

    setTotalListings(totalListingsResponse.count ?? 0);
    setActiveListings(activeListingsResponse.count ?? 0);
    setPendingListings(pendingListingsResponse.count ?? 0);
    setTodayListings(todayListingsResponse.data?.length ?? 0);
    setTotalFavorites(totalFavoritesResponse.count ?? 0);

    setLoading(false);
  }

  const onlineSessionCount = useMemo(() => {
    return new Set(eventsOnline.map((event) => event.session_id)).size;
  }, [eventsOnline]);

  const todaySessionCount = useMemo(() => {
    return new Set(eventsToday.map((event) => event.session_id)).size;
  }, [eventsToday]);

  const loggedUserTodayCount = useMemo(() => {
    return new Set(
      eventsToday
        .map((event) => event.user_id)
        .filter((userId): userId is string => Boolean(userId))
    ).size;
  }, [eventsToday]);

  const pageViewTodayCount = eventsToday.length;
  const pageViewSevenDaysCount = eventsSevenDays.length;

  const topPagesToday = useMemo(() => {
    const pageMap = new Map<string, number>();

    for (const event of eventsToday) {
      pageMap.set(event.path, (pageMap.get(event.path) ?? 0) + 1);
    }

    return Array.from(pageMap.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 10);
  }, [eventsToday]);

  const recentEvents = eventsToday.slice(0, 20);

  if (checkingAdmin || loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">İstatistikler yükleniyor...</p>
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
              Site İstatistikleri
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400">
              Ziyaretçi hareketleri, online kullanıcılar, ilanlar ve favori
              verileri buradan takip edilir. Online sayısı son 5 dakikaya göre
              hesaplanır.
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
              onClick={loadAnalytics}
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Şu An Online" value={onlineSessionCount} text="Son 5 dakika" />
          <StatCard title="Bugünkü Ziyaretçi" value={todaySessionCount} text="Tekil oturum" />
          <StatCard title="Bugünkü Sayfa Görüntüleme" value={pageViewTodayCount} text="Toplam hareket" />
          <StatCard title="Son 7 Gün Görüntüleme" value={pageViewSevenDaysCount} text="Toplam hareket" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Toplam İlan" value={totalListings} text="Tüm ilanlar" />
          <StatCard title="Aktif İlan" value={activeListings} text="Markette görünen" />
          <StatCard title="Onay Bekleyen" value={pendingListings} text="Admin kontrolü" />
          <StatCard title="Toplam Favori" value={totalFavorites} text="Tüm favoriler" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <StatCard title="Bugün Eklenen İlan" value={todayListings} text="Bugünkü yeni ilan" />
          <StatCard title="Bugün Girişli Kullanıcı" value={loggedUserTodayCount} text="Oturum açmış tekil kullanıcı" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">En Çok Gezilen Sayfalar</h2>

            <div className="mt-5 space-y-3">
              {topPagesToday.length === 0 && (
                <p className="text-sm text-neutral-500">Bugün henüz veri yok.</p>
              )}

              {topPagesToday.map((page) => (
                <TopPageRow key={page.path} page={page} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-2xl font-black">Son Hareketler</h2>

            <div className="mt-5 space-y-3">
              {recentEvents.length === 0 && (
                <p className="text-sm text-neutral-500">Bugün henüz hareket yok.</p>
              )}

              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-bold text-neutral-200">{event.path}</p>

                    <p className="text-xs text-neutral-500">
                      {formatDate(event.created_at)}
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-neutral-500">
                    Oturum: {event.session_id.slice(0, 8)}...
                    {event.user_id ? " · Girişli kullanıcı" : " · Misafir"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  text,
}: {
  title: string;
  value: number;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-sm text-neutral-500">{title}</p>

      <p className="mt-3 text-4xl font-black">{value.toLocaleString("tr-TR")}</p>

      <p className="mt-2 text-sm text-neutral-400">{text}</p>
    </div>
  );
}

function TopPageRow({ page }: { page: TopPage }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="truncate font-bold text-neutral-200">{page.path}</p>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
          {page.count}
        </span>
      </div>
    </div>
  );
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