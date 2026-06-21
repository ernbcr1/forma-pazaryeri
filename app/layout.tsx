import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthStatus from "./components/AuthStatus";
import TeamTicker from "./components/TeamTicker";
import MainNav from "./components/MainNav";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elformazione.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "elFormazione | Orijinal Futbol Ürünleri Pazarı",
    template: "%s | elFormazione",
  },
  description:
    "Orijinal forma, antrenman ürünü, krampon, atkı, aksesuar ve koleksiyon parçaları için kalite kontrollü futbol pazar yeri.",
  applicationName: "elFormazione",
  keywords: [
    "forma",
    "orijinal forma",
    "futbol ürünleri",
    "vintage forma",
    "krampon",
    "atkı",
    "koleksiyon forma",
    "futbol pazarı",
    "forma pazarı",
    "elFormazione",
  ],
  authors: [{ name: "elFormazione" }],
  creator: "elFormazione",
  publisher: "elFormazione",
  openGraph: {
    title: "elFormazione | Orijinal Futbol Ürünleri Pazarı",
    description:
      "Orijinal forma, antrenman ürünü, krampon, atkı, aksesuar ve koleksiyon parçaları için kalite kontrollü futbol pazar yeri.",
    url: siteUrl,
    siteName: "elFormazione",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "elFormazione | Orijinal Futbol Ürünleri Pazarı",
    description:
      "Orijinal forma, antrenman ürünü, krampon, atkı, aksesuar ve koleksiyon parçaları için kalite kontrollü futbol pazar yeri.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-neutral-950 text-white antialiased">
        <div className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-xl">
          <header className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 md:px-8">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
                elF
              </div>

              <div className="hidden md:block">
                <p className="text-base font-black leading-5 tracking-tight">
                  elFormazione
                </p>
                <p className="text-[11px] text-neutral-500">
                  Original football marketplace
                </p>
              </div>
            </Link>

            <MainNav />

            <div className="flex justify-end">
              <AuthStatus />
            </div>
          </header>

          <TeamTicker />

          <div className="border-t border-neutral-800 bg-neutral-900 px-4 py-2 text-center text-xs leading-5 text-neutral-400 md:px-8">
            <span className="font-bold text-white">Canlı Beta:</span>{" "}
            elFormazione aktif geliştirme sürecindedir. İlanlar admin
            kontrolünden geçebilir. Destek için{" "}
            <a
              href="mailto:elformazione1@gmail.com"
              className="font-bold text-white hover:text-neutral-300"
            >
              elformazione1@gmail.com
            </a>
          </div>
        </div>

        {children}

        <footer className="border-t border-neutral-800 bg-neutral-950 px-4 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8 lg:p-10">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
                      elF
                    </div>

                    <div>
                      <p className="text-xl font-black leading-5">
                        elFormazione
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Est. 2020 · Original football marketplace
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 max-w-md text-sm leading-7 text-neutral-400">
                    elFormazione; orijinal forma, antrenman ürünü, krampon,
                    atkı, aksesuar ve koleksiyon parçaları için kalite kontrollü
                    futbol pazar yeri deneyimi sunar.
                  </p>

                  <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-600">
                      İletişim
                    </p>

                    <p className="mt-2 text-sm text-neutral-300">
                      Yardım, iş birliği ve destek için:
                    </p>

                    <a
                      href="mailto:elformazione1@gmail.com"
                      className="mt-2 inline-block text-sm font-bold text-white hover:text-neutral-300"
                    >
                      elformazione1@gmail.com
                    </a>
                  </div>
                </div>

                <FooterColumn
                  title="Market"
                  links={[
                    { label: "İlanları Keşfet", href: "/listings" },
                    { label: "İlan Ver", href: "/create-listing" },
                    { label: "Favorilerim", href: "/favorites" },
                    { label: "Profil", href: "/profile" },
                  ]}
                />

                <FooterColumn
                  title="Yardım"
                  links={[
                    { label: "Yardım Merkezi", href: "/help" },
                    { label: "Sıkça Sorulan Sorular", href: "/help#sss" },
                    { label: "Satıcı Rehberi", href: "/help#satici" },
                    { label: "Güvenli Alışveriş", href: "/help#guvenlik" },
                  ]}
                />

                <FooterColumn
                  title="Kurallar"
                  links={[
                    { label: "İlan Kuralları", href: "/rules" },
                    { label: "Kullanım Şartları", href: "/terms" },
                    { label: "Gizlilik Politikası", href: "/privacy" },
                    {
                      label: "İletişim",
                      href: "mailto:elformazione1@gmail.com",
                    },
                  ]}
                />
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-neutral-800 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
                <p>
                  © 2020 - {new Date().getFullYear()} elFormazione. Tüm hakları
                  saklıdır.
                </p>

                <p>
                  Orijinal ürün odağı · Admin onay akışı · Site içi mesajlaşma
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <p className="font-black">{title}</p>

      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-sm text-neutral-400 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}