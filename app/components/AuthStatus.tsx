"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AuthStatus() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserEmail(user?.email ?? null);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="rounded-full border border-neutral-800 px-4 py-2 text-xs text-neutral-500">
        ...
      </div>
    );
  }

  if (!userEmail) {
    return (
      <Link
        href="/auth"
        className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-neutral-200"
      >
        Giriş
      </Link>
    );
  }

  return (
    <button
      onClick={signOut}
      className="whitespace-nowrap rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white"
    >
      Çıkış
    </button>
  );
}