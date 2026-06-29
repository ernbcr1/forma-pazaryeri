"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type UserOverview = {
  user_id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  is_admin: boolean;
  total_listings: number;
  active_listings: number;
  pending_listings: number;
  total_favorites: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.rpc("admin_get_users_overview");

    if (error) {
      setMessage("Kullanıcılar alınamadı: " + error.message);
      setUsers([]);
    } else {
      setUsers((data ?? []) as UserOverview[]);
    }

    setLoading(false);
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return users;

    return users.filter((user) => {
      return (
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.user_id.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const adminCount = users.filter((user) => user.is_admin).length;
  const usersWithListings = users.filter((user) => user.total_listings > 0).length;
  const totalListings = users.reduce(
    (total, user) => total + user.total_listings,
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">Kullanıcılar yükleniyor...</p>
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
              Kullanıcılar
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-400">
              Siteye kayıt olan kullanıcıları, ilan sayılarını, favori
              hareketlerini ve admin durumlarını buradan takip edebilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="rounded-full border border-neutral-800 px-5 py-3 text-center text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              Admin Panel
            </Link>

            <button
              onClick={loadUsers}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-neutral-200"
            >
              Yenile
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-900 bg-red-950 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Toplam Kullanıcı" value={totalUsers} />
          <StatCard title="Admin Sayısı" value={adminCount} />
          <StatCard title="İlan Veren Kullanıcı" value={usersWithListings} />
          <StatCard title="Toplam Kullanıcı İlanı" value={totalListings} />
        </div>

        <div className="mt-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Kullanıcı Listesi</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Email veya kullanıcı ID ile arama yapabilirsin.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-style md:max-w-sm"
              placeholder="Kullanıcı ara..."
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-neutral-800">
            <div className="hidden grid-cols-[1.35fr_0.8fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-4 border-b border-neutral-800 bg-neutral-950 px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-neutral-500 lg:grid">
              <p>Kullanıcı</p>
              <p>Kayıt</p>
              <p>İlan</p>
              <p>Aktif</p>
              <p>Bekleyen</p>
              <p>Favori</p>
            </div>

            <div className="divide-y divide-neutral-800">
              {filteredUsers.length === 0 && (
                <div className="bg-neutral-950 p-5 text-sm text-neutral-500">
                  Kullanıcı bulunamadı.
                </div>
              )}

              {filteredUsers.map((user) => (
                <UserRow key={user.user_id} user={user} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-3 text-4xl font-black">
        {value.toLocaleString("tr-TR")}
      </p>
    </div>
  );
}

function UserRow({ user }: { user: UserOverview }) {
  return (
    <div className="grid gap-4 bg-neutral-950 px-5 py-5 lg:grid-cols-[1.35fr_0.8fr_0.7fr_0.7fr_0.7fr_0.8fr] lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-neutral-100">
            {user.email || "Email yok"}
          </p>

          {user.is_admin && (
            <span className="rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-xs font-black text-yellow-300">
              Admin
            </span>
          )}
        </div>

        <p className="mt-1 break-all text-xs text-neutral-600">
          {user.user_id}
        </p>

        <p className="mt-2 text-xs text-neutral-500 lg:hidden">
          Kayıt: {formatDate(user.created_at)}
        </p>
      </div>

      <TableValue label="Kayıt" value={formatDate(user.created_at)} />
      <TableValue label="İlan" value={user.total_listings.toString()} />
      <TableValue label="Aktif" value={user.active_listings.toString()} />
      <TableValue label="Bekleyen" value={user.pending_listings.toString()} />
      <TableValue label="Favori" value={user.total_favorites.toString()} />

      {user.last_sign_in_at && (
        <p className="text-xs text-neutral-600 lg:col-span-6">
          Son giriş: {formatDate(user.last_sign_in_at)}
        </p>
      )}
    </div>
  );
}

function TableValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-600 lg:hidden">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-neutral-300 lg:mt-0">
        {value}
      </p>
    </div>
  );
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}