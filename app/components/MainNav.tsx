"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function MainNav() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    loadNavState();

    const handleMessageUpdate = () => {
      loadUnreadMessages();
    };

    const handleNotificationUpdate = () => {
      loadUnreadNotifications();
    };

    window.addEventListener("unread-messages-updated", handleMessageUpdate);
    window.addEventListener("notifications-updated", handleNotificationUpdate);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadNavState();
    });

    return () => {
      window.removeEventListener("unread-messages-updated", handleMessageUpdate);
      window.removeEventListener("notifications-updated", handleNotificationUpdate);
      subscription.unsubscribe();
    };
  }, []);

  async function loadNavState() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    if (!user) {
      setIsAdmin(false);
      setUnreadMessageCount(0);
      setUnreadNotificationCount(0);
      return;
    }

    const { data: adminData } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    setIsAdmin(Boolean(adminData));

    await Promise.all([loadUnreadMessages(), loadUnreadNotifications()]);
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

  return (
    <>
      <nav className="hidden min-w-0 items-center justify-center gap-1 xl:flex">
        <HeaderLink href="/listings">Market</HeaderLink>
        <HeaderLink href="/create-listing">İlan Ver</HeaderLink>

        {userId && <HeaderLink href="/favorites">Favorilerim</HeaderLink>}

        {userId && (
          <HeaderLink href="/notifications" badgeCount={unreadNotificationCount}>
            Bildirimler
          </HeaderLink>
        )}

        {userId && (
          <HeaderLink href="/messages" badgeCount={unreadMessageCount}>
            Mesajlar
          </HeaderLink>
        )}

        {userId && <HeaderLink href="/profile">Profil</HeaderLink>}

        {isAdmin && <HeaderLink href="/admin">Admin</HeaderLink>}

        <HeaderLink href="/help">Yardım</HeaderLink>
      </nav>

      <div className="border-t border-neutral-800 px-4 py-2 xl:hidden">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          <MobileHeaderLink href="/listings">Market</MobileHeaderLink>
          <MobileHeaderLink href="/create-listing">İlan Ver</MobileHeaderLink>

          {userId && (
            <MobileHeaderLink href="/favorites">Favorilerim</MobileHeaderLink>
          )}

          {userId && (
            <MobileHeaderLink
              href="/notifications"
              badgeCount={unreadNotificationCount}
            >
              Bildirimler
            </MobileHeaderLink>
          )}

          {userId && (
            <MobileHeaderLink href="/messages" badgeCount={unreadMessageCount}>
              Mesajlar
            </MobileHeaderLink>
          )}

          {userId && <MobileHeaderLink href="/profile">Profil</MobileHeaderLink>}

          {isAdmin && <MobileHeaderLink href="/admin">Admin</MobileHeaderLink>}

          <MobileHeaderLink href="/help">Yardım</MobileHeaderLink>
        </nav>
      </div>
    </>
  );
}

function HeaderLink({
  href,
  children,
  badgeCount = 0,
}: {
  href: string;
  children: React.ReactNode;
  badgeCount?: number;
}) {
  return (
    <Link
      href={href}
      className="relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-900 hover:text-white"
    >
      {children}

      {badgeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">
          {badgeCount}
        </span>
      )}
    </Link>
  );
}

function MobileHeaderLink({
  href,
  children,
  badgeCount = 0,
}: {
  href: string;
  children: React.ReactNode;
  badgeCount?: number;
}) {
  return (
    <Link
      href={href}
      className="relative shrink-0 rounded-full border border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-900"
    >
      {children}

      {badgeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">
          {badgeCount}
        </span>
      )}
    </Link>
  );
}