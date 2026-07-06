import Link from "next/link";
import AnnouncementBanner from "./components/AnnouncementBanner";
import CategoryShowcase from "./components/CategoryShowcase";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020713] text-white">
      <section className="px-4 py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <AnnouncementBanner placement="home" />

          <section className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#050b18] shadow-[0_40px_120px_rgba(0,0,0,0.48)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,51,102,0.65),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(201,166,107,0.18),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.055),transparent_38%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a66b]/75 to-transparent" />

            <div className="relative p-7 md:p-11 lg:p-14">
              <div className="max-w-5xl">
                <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[#c9a66b]/25 bg-[#c9a66b]/10 px-4 py-2 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9a66b]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.26em] text-[#ead8b5]">
                    elFormazione
                  </span>
                </div>

                <h1 className="mt-7 max-w-5xl text-[3.1rem] font-black leading-[0.92] tracking-[-0.08em] md:text-7xl lg:text-[5.8rem]">
                  Futbol dolabındaki hazineyi keşfet.
                </h1>

                <p className="mt-7 max-w-3xl text-base leading-8 text-[#d8e2ee]/78 md:text-lg">
                  Orijinal forma, krampon, atkı, antrenman ürünü ve koleksiyon
                  parçaları için seçili, düzenli ve kalite odaklı futbol pazarı.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/listings"
                    className="rounded-full bg-white px-8 py-4 text-center text-sm font-black text-[#020713] shadow-[0_20px_55px_rgba(0,0,0,0.35)] transition hover:bg-[#ead8b5]"
                  >
                    Marketi Keşfet
                  </Link>

                  <Link
                    href="/create-listing"
                    className="rounded-full border border-white/15 bg-white/[0.035] px-8 py-4 text-center text-sm font-black text-white backdrop-blur transition hover:border-[#c9a66b]/60 hover:bg-white/[0.07]"
                  >
                    Ürününü Sat
                  </Link>
                </div>
              </div>

              <div className="mt-10 grid gap-3 md:grid-cols-3">
                <HeroMetric
                  number="01"
                  title="Orijinal ürün odağı"
                  text="Forma, krampon, atkı ve koleksiyon ürünleri için daha seçili pazar deneyimi."
                />

                <HeroMetric
                  number="02"
                  title="Admin onay akışı"
                  text="İlanlar yayın öncesi kontrol sürecinden geçerek daha düzenli listelenir."
                />

                <HeroMetric
                  number="03"
                  title="Site içi mesajlaşma"
                  text="Alıcı ve satıcı platformdan ayrılmadan ürün hakkında iletişim kurabilir."
                />
              </div>
            </div>
          </section>

          <CategoryShowcase />

          <section className="mt-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050b18] shadow-[0_30px_95px_rgba(0,0,0,0.34)]">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-white/10 p-7 md:p-10 lg:border-b-0 lg:border-r">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#c9a66b]">
                  elFormazione nedir?
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.06em] md:text-6xl">
                  Genel ilan kalabalığı değil, futbol ürünleri için özel pazar.
                </h2>
              </div>

              <div className="p-7 md:p-10">
                <div className="grid gap-4">
                  <ExplainCard
                    title="Alıcı için daha anlaşılır"
                    text="Ürünleri kulüp, sezon, marka, beden, şehir ve kondisyon bilgileriyle daha net inceleyebilirsin."
                  />

                  <ExplainCard
                    title="Satıcı için daha düzenli"
                    text="İlanını oluşturur, admin kontrolünden sonra yayına alır ve mesajlarını platform içinde takip edersin."
                  />

                  <ExplainCard
                    title="Orijinallik odağı"
                    text="elFormazione kurgusu, replika kalabalığından uzak; orijinal ürün beyanı ve kalite kontrol yaklaşımıyla ilerler."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <StepCard
              number="01"
              title="Ürününü yükle"
              text="Fotoğrafları, açıklamayı, fiyatı ve ürün bilgilerini gir."
            />

            <StepCard
              number="02"
              title="Kontrole girsin"
              text="İlanın uygunluk ve kalite kontrol akışından geçsin."
            />

            <StepCard
              number="03"
              title="Alıcılarla buluşsun"
              text="Onaylanan ürün markette görünür ve mesajlaşma başlar."
            />
          </section>

          <section className="mt-6 rounded-[2.5rem] border border-[#c9a66b]/25 bg-[linear-gradient(135deg,#ffffff,#ead8b5)] p-7 text-[#020713] shadow-[0_32px_95px_rgba(0,0,0,0.34)] md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#003366]/70">
                  Hemen başla
                </p>

                <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] md:text-5xl">
                  Dolabındaki futbol hazinesini kolayca alıcılarla buluştur.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
                  Orijinal ürününü listele, kontrol sürecinden geçsin ve
                  elFormazione marketinde yerini alsın.
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
        </div>
      </section>
    </main>
  );
}

function HeroMetric({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
      <p className="text-xs font-black tracking-[0.22em] text-[#c9a66b]">
        {number}
      </p>

      <h3 className="mt-4 text-xl font-black tracking-[-0.055em] text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#d8e2ee]/70">{text}</p>
    </div>
  );
}

function ExplainCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.035] p-5">
      <h3 className="text-xl font-black tracking-[-0.05em] text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#d8e2ee]/72">{text}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#050b18] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.27)]">
      <p className="text-xs font-black tracking-[0.22em] text-[#c9a66b]">
        {number}
      </p>

      <h3 className="mt-4 text-2xl font-black tracking-[-0.055em] text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#d8e2ee]/70">{text}</p>
    </div>
  );
}