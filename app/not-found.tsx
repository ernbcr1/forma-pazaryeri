import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16 text-white md:px-8">
      <section className="mx-auto max-w-4xl rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-8 text-center md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-xl font-black text-black">
          404
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-neutral-500">
          Sayfa bulunamadı
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
          Aradığın sayfa sahada yok.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
          Bu sayfa taşınmış, silinmiş veya yanlış bir bağlantı kullanılmış
          olabilir. Markete dönerek aktif ilanları keşfedebilirsin.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/listings"
            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-neutral-200"
          >
            Markete Dön
          </Link>

          <Link
            href="/"
            className="rounded-full border border-neutral-800 px-6 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            Ana Sayfa
          </Link>
        </div>
      </section>
    </main>
  );
}