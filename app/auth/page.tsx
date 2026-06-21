"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (!email.trim()) {
      setMessage("E-posta adresi girmelisin.");
      return;
    }

    if (!password.trim()) {
      setMessage("Şifre girmelisin.");
      return;
    }

    if (password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (mode === "register" && password !== passwordAgain) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage("Giriş yapılamadı: " + error.message);
        setLoading(false);
        return;
      }

      setMessage("Giriş başarılı. Yönlendiriliyorsun...");

      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);

      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage("Kayıt oluşturulamadı: " + error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Kayıt oluşturuldu. E-posta doğrulaması açıksa mailini kontrol et. Ardından giriş yapabilirsin."
    );

    setMode("login");
    setPassword("");
    setPasswordAgain("");
    setLoading(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter") {
      return;
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white md:px-8">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
              elF
            </div>

            <div>
              <p className="text-xl font-black leading-5">elFormazione</p>
              <p className="mt-1 text-xs text-neutral-500">
                Original football marketplace
              </p>
            </div>
          </Link>

          <h1 className="mt-10 text-4xl font-black tracking-tight md:text-6xl">
            Futbol ürünleri için güvenli pazar yeri hesabın.
          </h1>

          <p className="mt-6 text-sm leading-7 text-neutral-400 md:text-base">
            İlan vermek, favori eklemek, satıcılarla mesajlaşmak ve admin
            bildirimlerini takip etmek için hesabına giriş yap.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <InfoCard
              title="Satıcılar"
              text="Ürünlerini ilan olarak ekle, admin onayından sonra yayına çıkar."
            />

            <InfoCard
              title="Alıcılar"
              text="Ürünleri favorile, satıcıyla mesajlaş ve durumları takip et."
            />
          </div>

          <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-bold text-neutral-300">
              Kayıt sonrası not
            </p>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Supabase e-posta doğrulaması açıksa kayıt sonrası mail onayı
              gerekebilir. Admin onay akışı açıksa hesabın kontrol edildikten
              sonra kullanılabilir.
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
          <div className="mb-8 flex rounded-full border border-neutral-800 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`flex-1 rounded-full px-5 py-3 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Giriş Yap
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              className={`flex-1 rounded-full px-5 py-3 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              {mode === "login" ? "Hesabına giriş yap" : "Yeni hesap oluştur"}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              {mode === "login" ? "Hoş geldin" : "Aramıza katıl"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              {mode === "login"
                ? "Profiline, ilanlarına, mesajlarına ve bildirimlerine devam et."
                : "Kayıt olduktan sonra ilan verebilir, favori ekleyebilir ve mesajlaşabilirsin."}
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">
                E-posta
              </label>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="ornek@mail.com"
                className="input-style"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Şifre</label>

              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="En az 6 karakter"
                className="input-style"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Şifre Tekrar
                </label>

                <input
                  value={passwordAgain}
                  onChange={(event) => setPasswordAgain(event.target.value)}
                  type="password"
                  placeholder="Şifreyi tekrar yaz"
                  className="input-style"
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white px-6 py-4 font-bold text-black hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading
                ? "İşleniyor..."
                : mode === "login"
                ? "Giriş Yap"
                : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/listings" className="hover:text-white">
              Marketi gez
            </Link>

            <Link href="/" className="hover:text-white">
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <h2 className="font-black">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
    </div>
  );
}