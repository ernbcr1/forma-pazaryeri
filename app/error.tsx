"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16 text-white md:px-8">
      <section className="mx-auto max-w-4xl rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-8 text-center md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-xl font-black text-black">
          !
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-neutral-500">
          Beklenmeyen hata
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
          Bir şey ters gitti.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
          Sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyebilir veya
          ana sayfaya dönebilirsin.
        </p>

        {error?.message && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-left text-xs leading-6 text-neutral-500">
            {error.message}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-neutral-200"
          >
            Tekrar Dene
          </button>

          <a
            href="/"
            className="rounded-full border border-neutral-800 px-6 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            Ana Sayfa
          </a>
        </div>
      </section>
    </main>
  );
}