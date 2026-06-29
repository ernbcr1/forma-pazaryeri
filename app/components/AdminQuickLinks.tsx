import Link from "next/link";

export default function AdminQuickLinks() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminCard
        title="İlan Onay Paneli"
        text="Bekleyen, onaylanan ve reddedilen ilanları yönet."
        href="/admin"
        label="Panele Git"
      />

      <AdminCard
        title="Duyurular"
        text="Ana sayfa ve site geneli duyuruları ekle, pasifleştir veya sil."
        href="/admin/announcements"
        label="Duyuruları Yönet"
      />

      <AdminCard
        title="Site İstatistikleri"
        text="Online kullanıcı, ziyaret, sayfa görüntüleme ve site hareketlerini takip et."
        href="/admin/analytics"
        label="İstatistikleri Gör"
      />

      <AdminCard
        title="Siteyi Gör"
        text="Yaptığın değişikliklerin kullanıcı tarafında nasıl göründüğünü kontrol et."
        href="/"
        label="Ana Sayfaya Git"
      />
    </div>
  );
}

function AdminCard({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-white/10 bg-[#050b18] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)] transition hover:border-[#c9a66b]/50 hover:bg-white/[0.04]"
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c9a66b]">
        Admin
      </p>

      <h3 className="mt-4 text-2xl font-black tracking-[-0.055em] text-white">
        {title}
      </h3>

      <p className="mt-3 min-h-16 text-sm leading-7 text-[#d8e2ee]/70">
        {text}
      </p>

      <div className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#020713] transition group-hover:bg-[#ead8b5]">
        {label}
      </div>
    </Link>
  );
}