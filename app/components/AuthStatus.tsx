"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AuthStatus() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadUserAndCounts();

    const handleMessageUpdate = () => {
      loadUnreadMessages();
    };

    const handleNotificationUpdate = () => {
      loadUnreadNotifications();
    };

    window.addEventListener("unread-messages-updated", handleMessageUpdate);
    window.addEventListener("notifications-updated", handleNotificationUpdate);

    return () => {
      window.removeEventListener("unread-messages-updated", handleMessageUpdate);
      window.removeEventListener("notifications-updated", handleNotificationUpdate);
    };
  }, []);

  async function loadUserAndCounts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserEmail(user?.email ?? null);

    if (user) {
      await Promise.all([loadUnreadMessages(), loadUnreadNotifications()]);
    }

    setLoading(false);
  }

  async function loadUnreadMessages() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadMessageCount(0);
      return;
    }

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    setUnreadMessageCount(count ?? 0);
  }

  async function loadUnreadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadNotificationCount(0);
      return;
    }

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setUnreadNotificationCount(count ?? 0);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const totalBadgeCount = unreadMessageCount + unreadNotificationCount;

  if (loading) {
    return (
      <div className="rounded-full border border-neutral-800 px-4 py-2 text-xs text-neutral-500">
        Yükleniyor
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="relative">
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/listings"
            className="rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-900"
          >
            Market
          </Link>

          <Link
            href="/auth"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-neutral-200"
          >
            Giriş
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen((current) => !current)}
          className="relative rounded-full border border-neutral-800 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-900 md:hidden"
        >
          Menü
        </button>

        {menuOpen && (
          <MobileMenu>
            <MobileLink href="/listings" onClick={() => setMenuOpen(false)}>
              Market
            </MobileLink>

            <MobileLink href="/auth" onClick={() => setMenuOpen(false)}>
              Giriş / Kayıt
            </MobileLink>

            <MobileLink href="/help" onClick={() => setMenuOpen(false)}>
              Yardım
            </MobileLink>
          </MobileMenu>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-end">
      <div className="hidden items-center justify-end gap-2 xl:flex">
        <Link
          href="/notifications"
          className="relative rounded-full border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-900"
        >
          Bildirimler
          {unreadNotificationCount > 0 && (
            <Badge count={unreadNotificationCount} />
          )}
        </Link>

        <Link
          href="/messages"
          className="relative rounded-full border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-900"
        >
          Mesajlar
          {unreadMessageCount > 0 && <Badge count={unreadMessageCount} />}
        </Link>

        <button
          onClick={signOut}
          className="rounded-full border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-400 hover:bg-neutral-900 hover:text-white"
        >
          Çıkış
        </button>
      </div>

      <button
        onClick={() => setMenuOpen((current) => !current)}
        className="relative rounded-full border border-neutral-800 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-900 xl:hidden"
      >
        Menü
        {totalBadgeCount > 0 && <Badge count={totalBadgeCount} />}
      </button>

      {menuOpen && (
        <MobileMenu>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400">
            <p className="truncate">{userEmail}</p>
          </div>

          <MobileLink href="/listings" onClick={() => setMenuOpen(false)}>
            Market
          </MobileLink>

          <MobileLink href="/create-listing" onClick={() => setMenuOpen(false)}>
            İlan Ver
          </MobileLink>

          <MobileLink href="/favorites" onClick={() => setMenuOpen(false)}>
            Favorilerim
          </MobileLink>

          <MobileLink href="/notifications" onClick={() => setMenuOpen(false)}>
            Bildirimler
            {unreadNotificationCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-black text-black">
                {unreadNotificationCount}
              </span>
            )}
          </MobileLink>

          <MobileLink href="/messages" onClick={() => setMenuOpen(false)}>
            Mesajlar
            {unreadMessageCount > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-black text-black">
                {unreadMessageCount}
              </span>
            )}
          </MobileLink>

          <MobileLink href="/profile" onClick={() => setMenuOpen(false)}>
            Profil
          </MobileLink>

          <MobileLink href="/help" onClick={() => setMenuOpen(false)}>
            Yardım
          </MobileLink>

          <button
            onClick={signOut}
            className="mt-2 w-full rounded-2xl border border-neutral-800 px-4 py-3 text-left text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            Çıkış Yap
          </button>
        </MobileMenu>
      )}
    </div>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">
      {count}
    </span>
  );
}

function MobileMenu({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute right-0 top-12 z-[60] w-[min(88vw,320px)] rounded-[2rem] border border-neutral-800 bg-neutral-950 p-3 shadow-2xl">
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
    >
      <span>{children}</span>
    </Link>
  );
}