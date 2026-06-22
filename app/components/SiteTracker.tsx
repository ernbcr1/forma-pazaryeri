"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

function getSessionId() {
  if (typeof window === "undefined") return "";

  const storageKey = "elf_session_id";
  const existingSessionId = window.localStorage.getItem(storageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const newSessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(storageKey, newSessionId);

  return newSessionId;
}

export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    async function trackPageView() {
      if (!pathname) return;

      const sessionId = getSessionId();

      if (!sessionId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("site_events").insert({
        session_id: sessionId,
        user_id: user?.id ?? null,
        event_type: "page_view",
        path: pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });
    }

    trackPageView();
  }, [pathname]);

  return null;
}