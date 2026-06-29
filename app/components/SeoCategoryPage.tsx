import Link from "next/link";

export default function SeoCategoryPage({
  eyebrow,
  title,
  description,
  primaryButtonText = "Marketi Keşfet",
  secondaryButtonText = "İlan Ver",
  highlights,
  faq,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  highlights: {
    title: string;
    text: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
}) {
  return (
    <main className="min-h-screen bg-[#020713] px-4 py-8 text-white md:px-8 md:py-14">
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#050b18] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.45)] md:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,51,102,0.55),transparent_32%),radial-gradient(circle_at_90%_12%,rgba(201,166,107,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_32%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a66b]/70 to-transparent" />

          <div className="relative max-w-4xl">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[#c9a66b]/25 bg-[#c9a66b]/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a66b]" />
              <span className="text-[11px] font-black uppercase tracking-[0.28em] text-[#ead8b5]">
                {eyebrow}
              </span>
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-[-0.075em] md:text-7xl">
              {title}
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-[#d8e2ee]/80 md:text-lg">
              {description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="rounded-full bg-white px-8 py-4 text-center text-sm font-black text-[#020713] shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:bg-[#ead8b5]"
              >
                {primaryButtonText}
              </Link>

              <Link
                href="/create-listing"
                className="rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-center text-sm font-black text-white backdrop-blur transition hover:border-[#c9a66b]/60 hover:bg-white/[0.07]"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-white/10 bg-[#050b18] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
            >
              <div className="mb-5 h-px w-full bg-gradient-to-r from-[#c9a66b]/70 via-white/10 to-transparent" />

              <h2 className="text-2xl font-black tracking-[-0.055em] text-white">
                {item.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#d8e2ee]/70">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#050b18] shadow-[0_35px_100px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/10 p-7 md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#c9a66b]">
              Sıkça Sorulan Sorular
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.065em] md:text-5xl">
              Alım satım öncesi bilmen gerekenler
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {faq.map((item) => (
              <div key={item.question} className="p-7 md:p-10">
                <h3 className="text-2xl font-black tracking-[-0.055em]">
                  {item.question}
                </h3>

                <p className="mt-3 max-w-4xl text-sm leading-8 text-[#d8e2ee]/75 md:text-base">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2.75rem] border border-[#c9a66b]/25 bg-[linear-gradient(135deg,#ffffff,#ead8b5)] p-7 text-[#020713] shadow-[0_35px_100px_rgba(0,0,0,0.35)] md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#003366]/70">
                elFormazione
              </p>

              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.06em] md:text-5xl">
                Futbol ürününü doğru kitleyle buluştur.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
                Orijinal futbol ürününü ekle, kontrol sürecinden geçsin ve
                markette yayınlansın.
              </p>
            </div>

            <Link
              href="/create-listing"
              className="rounded-full bg-[#020713] px-8 py-4 text-center text-sm font-black text-white transition hover:bg-[#003366]"
            >
              İlan Ver
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}