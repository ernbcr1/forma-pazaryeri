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

type DeviceStat = {
  label: string;
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
  const [messageType, setMessageType] = useState<"info" | "success" | "error">(
    "info"
  );
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoad();

    const interval = window.setInterval(() => {
      loadAnalytics(false);
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
      showMessage("Bu sayfayı görüntülemek için giriş yapmalısın.", "error");
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) {
      showMessage("Admin kontrolü yapılamadı: " + adminError.message, "error");
      setIsAdmin(false);
      setCheckingAdmin(false);
      setLoading(false);
      return;
    }

    if (!adminData) {
      showMessage("Bu sayfayı görüntülemek için admin yetkisi gerekli.", "error");
      setIsAdmin(false);
      setCheckingAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    setCheckingAdmin(false);

    await loadAnalytics(true);
  }

  async function loadAnalytics(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

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
        .select("id", { count: "exact" })
        .gte("created_at", todayStart.toISOString()),

      supabase.from("favorites").select("*", { count: "exact", head: true }),
    ]);

    const errors = [
      todayEventsResponse.error
        ? "Bugünkü hareketler alınamadı: " + todayEventsResponse.error.message
        : "",
      onlineEventsResponse.error
        ? "Online hareketler alınamadı: " + onlineEventsResponse.error.message
        : "",
      sevenDaysEventsResponse.error
        ? "7 günlük hareketler alınamadı: " +
          sevenDaysEventsResponse.error.message
        : "",
      totalListingsResponse.error
        ? "Toplam ilan sayısı alınamadı: " + totalListingsResponse.error.message
        : "",
      activeListingsResponse.error
        ? "Aktif ilan sayısı alınamadı: " + activeListingsResponse.error.message
        : "",
      pendingListingsResponse.error
        ? "Onay bekleyen ilan sayısı alınamadı: " +
          pendingListingsResponse.error.message
        : "",
      todayListingsResponse.error
        ? "Bugünkü ilan sayısı alınamadı: " + todayListingsResponse.error.message
        : "",
      totalFavoritesResponse.error
        ? "Favori sayısı alınamadı: " + totalFavoritesResponse.error.message
        : "",
    ].filter(Boolean);

    if (errors.length > 0) {
      showMessage(errors[0], "error");
    } else {
      setMessage("");
    }

    setEventsToday((todayEventsResponse.data ?? []) as SiteEvent[]);
    setEventsOnline((onlineEventsResponse.data ?? []) as SiteEvent[]);
    setEventsSevenDays((sevenDaysEventsResponse.data ?? []) as SiteEvent[]);

    setTotalListings(totalListingsResponse.count ?? 0);
    setActiveListings(activeListingsResponse.count ?? 0);
    setPendingListings(pendingListingsResponse.count ?? 0);
    setTodayListings(todayListingsResponse.count ?? 0);
    setTotalFavorites(totalFavoritesResponse.count ?? 0);

    setLastRefresh(new Date().toISOString());
    setLoading(false);
  }

  function showMessage(
    nextMessage: string,
    nextType: "info" | "success" | "error" = "info"
  ) {
    setMessage(nextMessage);
    setMessageType(nextType);
  }

  const onlineSessionCount = useMemo(() => {
    return new Set(eventsOnline.map((event) => event.session_id)).size;
  }, [eventsOnline]);

  const todaySessionCount = useMemo(() => {
    return new Set(eventsToday.map((event) => event.session_id)).size;
  }, [eventsToday]);

  const sevenDaysSessionCount = useMemo(() => {
    return new Set(eventsSevenDays.map((event) => event.session_id)).size;
  }, [eventsSevenDays]);

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
    return getTopPages(eventsToday, 10);
  }, [eventsToday]);

  const topPagesSevenDays = useMemo(() => {
    return getTopPages(eventsSevenDays, 10);
  }, [eventsSevenDays]);

  const deviceStatsToday = useMemo(() => {
    const stats = new Map<string, number>();

    for (const event of eventsToday) {
      const device = detectDevice(event.user_agent);
      stats.set(device, (stats.get(device) ?? 0) + 1);
    }

    return Array.from(stats.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((first, second) => second.count - first.count);
  }, [eventsToday]);

  const recentEvents = eventsToday.slice(0, 20);

  if (checkingAdmin || loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">İstatistikler yükleniyor...</p>
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
                Admin İstatistikler
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              Site hareketleri.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Ziyaretçi hareketleri, online kullanıcılar, ilanlar ve favori
              verilerini buradan takip edebilirsin. Online sayısı son 5 dakikaya
              göre hesaplanır.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Admin Panel
              </Link>

              <button
                onClick={() => loadAnalytics(true)}
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Yenile
              </button>

              <Link
                href="/admin/announcements"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Duyurular
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Canlı Özet
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <SmallStatCard label="Online" value={onlineSessionCount} />
              <SmallStatCard label="Bugün Tekil" value={todaySessionCount} />
              <SmallStatCard label="Bugün PV" value={pageViewTodayCount} />
              <SmallStatCard label="7 Gün PV" value={pageViewSevenDaysCount} />
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-black text-neutral-200">
                Otomatik yenileme
              </p>

              <p className="mt-2 text-xs leading-6 text-neutral-500">
                Bu sayfa 30 saniyede bir otomatik güncellenir.
                {lastRefresh ? ` Son yenileme: ${formatDate(lastRefresh)}` : ""}
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Şu An Online"
            value={onlineSessionCount}
            text="Son 5 dakika içindeki tekil oturum"
          />

          <StatCard
            title="Bugünkü Ziyaretçi"
            value={todaySessionCount}
            text="Bugünkü tekil oturum"
          />

          <StatCard
            title="Bugünkü Sayfa Görüntüleme"
            value={pageViewTodayCount}
            text="Bugünkü toplam hareket"
          />

          <StatCard
            title="Son 7 Gün Görüntüleme"
            value={pageViewSevenDaysCount}
            text="Son 7 günlük toplam hareket"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Son 7 Gün Tekil"
            value={sevenDaysSessionCount}
            text="Son 7 gün tekil oturum"
          />

          <StatCard
            title="Girişli Kullanıcı"
            value={loggedUserTodayCount}
            text="Bugün giriş yapmış tekil kullanıcı"
          />

          <StatCard
            title="Bugün Eklenen İlan"
            value={todayListings}
            text="Bugünkü yeni ilan"
          />

          <StatCard
            title="Toplam Favori"
            value={totalFavorites}
            text="Tüm favori kayıtları"
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StatCard
            title="Toplam İlan"
            value={totalListings}
            text="Tüm ilan kayıtları"
          />

          <StatCard
            title="Aktif İlan"
            value={activeListings}
            text="Markette görünen ilanlar"
          />

          <StatCard
            title="Onay Bekleyen"
            value={pendingListings}
            text="Admin kontrolü bekleyen ilanlar"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Bugün En Çok Gezilen Sayfalar">
            {topPagesToday.length === 0 ? (
              <EmptyText text="Bugün henüz veri yok." />
            ) : (
              <div className="space-y-3">
                {topPagesToday.map((page) => (
                  <TopPageRow key={page.path} page={page} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Son 7 Gün En Çok Gezilen Sayfalar">
            {topPagesSevenDays.length === 0 ? (
              <EmptyText text="Son 7 gün için veri yok." />
            ) : (
              <div className="space-y-3">
                {topPagesSevenDays.map((page) => (
                  <TopPageRow key={page.path} page={page} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Bugünkü Cihaz Dağılımı">
            {deviceStatsToday.length === 0 ? (
              <EmptyText text="Bugün cihaz verisi yok." />
            ) : (
              <div className="space-y-3">
                {deviceStatsToday.map((device) => (
                  <DeviceRow key={device.label} device={device} />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Son Hareketler">
            {recentEvents.length === 0 ? (
              <EmptyText text="Bugün henüz hareket yok." />
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <RecentEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:p-6">
      <h2 className="text-2xl font-black">{title}</h2>

      <div className="mt-5">{children}</div>
    </section>
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
      <p className="text-sm font-bold text-neutral-500">{title}</p>

      <p className="mt-3 text-4xl font-black">
        {value.toLocaleString("tr-TR")}
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-400">{text}</p>
    </div>
  );
}

function SmallStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-3xl font-black">{value.toLocaleString("tr-TR")}</p>

      <p className="mt-1 text-xs font-bold text-neutral-500">{label}</p>
    </div>
  );
}

function TopPageRow({ page }: { page: TopPage }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-black text-neutral-200">{page.path}</p>

          <Link
            href={page.path}
            className="mt-1 inline-block text-xs font-bold text-neutral-500 hover:text-white"
          >
            Sayfayı aç →
          </Link>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">
          {page.count.toLocaleString("tr-TR")}
        </span>
      </div>
    </div>
  );
}

function DeviceRow({ device }: { device: DeviceStat }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-black text-neutral-200">{device.label}</p>

        <span className="rounded-full border border-neutral-800 px-3 py-1 text-xs font-black text-neutral-300">
          {device.count.toLocaleString("tr-TR")}
        </span>
      </div>
    </div>
  );
}

function RecentEventCard({ event }: { event: SiteEvent }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="truncate font-black text-neutral-200">{event.path}</p>

          <p className="mt-1 text-xs font-medium text-neutral-600">
            {event.event_type || "page_view"}
          </p>
        </div>

        <p className="text-xs font-bold text-neutral-500">
          {formatDate(event.created_at)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-neutral-500">
        <span className="rounded-full border border-neutral-800 px-3 py-1">
          Oturum: {event.session_id.slice(0, 8)}...
        </span>

        <span className="rounded-full border border-neutral-800 px-3 py-1">
          {event.user_id ? "Girişli kullanıcı" : "Misafir"}
        </span>

        <span className="rounded-full border border-neutral-800 px-3 py-1">
          {detectDevice(event.user_agent)}
        </span>
      </div>

      {event.referrer && (
        <p className="mt-3 truncate text-xs text-neutral-600">
          Referrer: {event.referrer}
        </p>
      )}
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <p className="text-sm text-neutral-500">{text}</p>
    </div>
  );
}

function getTopPages(events: SiteEvent[], limit: number) {
  const pageMap = new Map<string, number>();

  for (const event of events) {
    const path = event.path || "/";
    pageMap.set(path, (pageMap.get(path) ?? 0) + 1);
  }

  return Array.from(pageMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((first, second) => second.count - first.count)
    .slice(0, limit);
}

function detectDevice(userAgent: string | null) {
  const ua = userAgent?.toLowerCase() || "";

  if (!ua) return "Bilinmiyor";
  if (ua.includes("bot") || ua.includes("crawler") || ua.includes("spider")) {
    return "Bot";
  }
  if (ua.includes("iphone") || ua.includes("android")) return "Mobil";
  if (ua.includes("ipad") || ua.includes("tablet")) return "Tablet";
  return "Masaüstü";
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