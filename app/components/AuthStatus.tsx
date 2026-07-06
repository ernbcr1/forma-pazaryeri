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
      window.removeEventListener(
        "notifications-updated",
        handleNotificationUpdate
      );
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

  function closeMenu() {
    setMenuOpen(false);
  }

  const totalBadgeCount = unreadMessageCount + unreadNotificationCount;

  if (loading) {
    return (
      <div className="rounded-full border border-neutral-800 px-4 py-2 text-xs font-bold text-neutral-500">
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
          className="relative rounded-full border border-neutral-800 bg-neutral-950/70 px-5 py-3 text-sm font-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] hover:bg-neutral-900 md:hidden"
        >
          Menü
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={closeMenu}
              className="fixed inset-0 z-[55] cursor-default bg-black/25 backdrop-blur-[2px] md:hidden"
            />

            <MobileMenu>
              <div className="mb-2 rounded-[1.4rem] border border-neutral-800 bg-neutral-950 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-300">
                  elFormazione
                </p>
                <p className="mt-1 text-sm font-bold text-neutral-300">
                  Hesabına giriş yap veya marketi keşfet.
                </p>
              </div>

              <MobileLink href="/listings" onClick={closeMenu}>
                Market
              </MobileLink>

              <MobileLink href="/auth" onClick={closeMenu}>
                Giriş / Kayıt
              </MobileLink>

              <MobileLink href="/help" onClick={closeMenu}>
                Yardım
              </MobileLink>
            </MobileMenu>
          </>
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
        className="relative rounded-full border border-neutral-800 bg-neutral-950/70 px-5 py-3 text-sm font-black text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] hover:bg-neutral-900 xl:hidden"
      >
        Menü
        {totalBadgeCount > 0 && <Badge count={totalBadgeCount} />}
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={closeMenu}
            className="fixed inset-0 z-[55] cursor-default bg-black/25 backdrop-blur-[2px] xl:hidden"
          />

          <MobileMenu>
            <div className="rounded-[1.4rem] border border-neutral-800 bg-neutral-950 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-300">
                Hesap
              </p>

              <p className="mt-1 truncate text-sm font-bold text-neutral-300">
                {userEmail}
              </p>
            </div>

            <div className="grid gap-1">
              <MobileLink href="/listings" onClick={closeMenu}>
                Market
              </MobileLink>

              <MobileLink href="/create-listing" onClick={closeMenu}>
                İlan Ver
              </MobileLink>

              <MobileLink href="/favorites" onClick={closeMenu}>
                Favorilerim
              </MobileLink>

              <MobileLink href="/notifications" onClick={closeMenu}>
                <span>Bildirimler</span>
                {unreadNotificationCount > 0 && (
                  <InlineBadge count={unreadNotificationCount} />
                )}
              </MobileLink>

              <MobileLink href="/messages" onClick={closeMenu}>
                <span>Mesajlar</span>
                {unreadMessageCount > 0 && (
                  <InlineBadge count={unreadMessageCount} />
                )}
              </MobileLink>

              <MobileLink href="/profile" onClick={closeMenu}>
                Profil
              </MobileLink>

              <MobileLink href="/help" onClick={closeMenu}>
                Yardım
              </MobileLink>
            </div>

            <div className="mt-2 border-t border-neutral-800 pt-3">
              <button
                onClick={signOut}
                className="w-full rounded-[1.4rem] border border-neutral-800 bg-neutral-950 px-4 py-3 text-left text-sm font-black text-neutral-300 hover:bg-neutral-900 hover:text-white"
              >
                Çıkış Yap
              </button>
            </div>
          </MobileMenu>
        </>
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

function InlineBadge({ count }: { count: number }) {
  return (
    <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-black text-black">
      {count}
    </span>
  );
}

function MobileMenu({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute right-0 top-14 z-[60] w-[min(86vw,310px)] overflow-hidden rounded-[1.8rem] border border-neutral-800 bg-[#020713]/95 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl">
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
      className="flex items-center justify-between rounded-[1.25rem] px-4 py-3 text-sm font-black text-neutral-300 hover:bg-white/[0.055] hover:text-white"
    >
      {children}
    </Link>
  );
}