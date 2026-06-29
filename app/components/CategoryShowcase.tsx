import Link from "next/link";

const categories = [
  {
    title: "Formalar",
    text: "Orijinal kulüp ve milli takım formalarını keşfet.",
    href: "/formalar",
  },
  {
    title: "Vintage Formalar",
    text: "Retro, eski sezon ve koleksiyonluk futbol formaları.",
    href: "/vintage-formalar",
  },
  {
    title: "Kramponlar",
    text: "Numara, kondisyon ve zemin tipine göre krampon ilanları.",
    href: "/kramponlar",
  },
  {
    title: "Koleksiyon Formalar",
    text: "Nadir, özel sezon ve koleksiyon değeri taşıyan parçalar.",
    href: "/koleksiyon-formalar",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="mt-6 rounded-[2.75rem] border border-white/10 bg-[#050b18] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.35)] md:p-10">
      <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#c9a66b]">
            Kategoriler
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-[-0.065em] md:text-5xl">
            Futbol ürünlerini doğru alanda keşfet.
          </h2>
        </div>

        <Link
          href="/listings"
          className="w-fit rounded-full bg-white px-6 py-3 text-sm font-black text-[#020713] transition hover:bg-[#ead8b5]"
        >
          Tüm İlanlar
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#c9a66b]/50 hover:bg-white/[0.06]"
          >
            <div className="mb-5 h-px w-full bg-gradient-to-r from-[#c9a66b]/70 via-white/10 to-transparent" />

            <h3 className="text-2xl font-black tracking-[-0.055em] text-white">
              {category.title}
            </h3>

            <p className="mt-3 min-h-20 text-sm leading-7 text-[#d8e2ee]/70">
              {category.text}
            </p>

            <div className="mt-5 inline-flex text-sm font-black text-[#ead8b5] transition group-hover:text-white">
              Kategoriyi Aç →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}