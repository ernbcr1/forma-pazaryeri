import Link from "next/link";
import AnnouncementBanner from "./components/AnnouncementBanner";
import CategoryShowcase from "./components/CategoryShowcase";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020713] text-white">
      <section className="px-4 py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <AnnouncementBanner placement="home" />

          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050b18] shadow-[0_35px_110px_rgba(0,0,0,0.42)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(0,51,102,0.52),transparent_31%),radial-gradient(circle_at_88%_18%,rgba(201,166,107,0.16),transparent_27%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_34%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a66b]/70 to-transparent" />

            <div className="relative grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="flex min-h-[560px] flex-col justify-center p-7 md:p-11 lg:p-14">
                <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-2 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c9a66b]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.26em] text-[#ead8b5]">
                    Original Football Marketplace
                  </span>
                </div>

                <h1 className="mt-7 max-w-4xl text-[2.85rem] font-black leading-[0.98] tracking-[-0.07em] md:text-7xl lg:text-[5.4rem]">
                  Orijinal futbol ürünleri için seçkin pazar yeri.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[#d8e2ee]/78 md:text-lg">
                  elFormazione; forma, krampon, atkı, antrenman ürünü ve
                  koleksiyon parçalarını daha düzenli, daha güven veren ve daha
                  premium bir pazar deneyiminde buluşturur.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/listings"
                    className="rounded-full bg-white px-8 py-4 text-center text-sm font-black text-[#020713] shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:bg-[#ead8b5]"
                  >
                    Marketi Keşfet
                  </Link>

                  <Link
                    href="/create-listing"
                    className="rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-center text-sm font-black text-white backdrop-blur transition hover:border-[#c9a66b]/60 hover:bg-white/[0.07]"
                  >
                    İlan Ver
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Ürün odağı" value="Orijinal" />
                  <MiniStat label="İlan akışı" value="Kontrollü" />
                  <MiniStat label="İletişim" value="Site içi" />
                </div>
              </div>

              <div className="relative border-t border-white/10 bg-black/18 p-6 md:p-9 lg:border-l lg:border-t-0">
                <div className="flex h-full flex-col justify-center gap-4">
                  <PremiumFeature
                    number="01"
                    title="Futbol ürünlerine özel yapı"
                    text="Forma, krampon, atkı, antrenman ürünü ve koleksiyon parçaları genel ilan kalabalığından ayrı sunulur."
                  />

                  <PremiumFeature
                    number="02"
                    title="Daha düzenli ilan deneyimi"
                    text="Kulüp, sezon, marka, beden, şehir ve kondisyon bilgileriyle ürünler daha anlaşılır listelenir."
                  />

                  <PremiumFeature
                    number="03"
                    title="Site içi mesajlaşma"
                    text="Alıcı ve satıcı ürün hakkında platformdan ayrılmadan iletişime geçebilir."
                  />
                </div>
              </div>
            </div>
          </section>

          <CategoryShowcase />

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <StepCard
              number="01"
              title="Ürününü ekle"
              text="Fotoğrafları, fiyatı, şehir bilgisini ve ürün açıklamasını gir."
            />

            <StepCard
              number="02"
              title="Kontrol sürecine girsin"
              text="İlanın uygunluk ve kalite açısından admin kontrolüne düşer."
            />

            <StepCard
              number="03"
              title="Markette yayınlansın"
              text="Onaylanan ilanlar kullanıcılar tarafından keşfedilebilir hale gelir."
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050b18] shadow-[0_30px_95px_rgba(0,0,0,0.34)]">
            <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-white/10 p-7 md:p-10 lg:border-b-0 lg:border-r">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#c9a66b]">
                  elFormazione standardı
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.06em] md:text-6xl">
                  Genel ilan sitesi değil, futbol pazarı.
                </h2>
              </div>

              <div className="p-7 md:p-10">
                <div className="space-y-5 text-sm leading-8 text-[#d8e2ee]/78 md:text-base">
                  <p>
                    elFormazione, futbol ürünlerini genel ilan kalabalığından
                    ayırır. Amaç; formaları, kramponları, atkıları, antrenman
                    ürünlerini ve koleksiyon parçalarını daha sade, daha düzenli
                    ve daha güven veren bir yapıda sunmaktır.
                  </p>

                  <p>
                    Ürün bilgileri, ilan durumu, favoriler, mesajlaşma ve admin
                    onay akışı tek bir platform içinde yönetilir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <InfoPanel
              title="Alıcılar için"
              text="Ürünleri kategori, beden, marka ve şehir bilgilerine göre inceleyebilir; satıcıyla site içinden iletişime geçebilir ve beğendiğin ilanları favorilerinde takip edebilirsin."
            />

            <InfoPanel
              title="Satıcılar için"
              text="Ürünlerini kontrollü ve düzenli bir formatta listeleyebilir; ilan durumunu, favori sayısını, mesajlarını ve admin geri bildirimlerini profilinden takip edebilirsin."
            />
          </section>

          <section className="mt-6 rounded-[2.5rem] border border-[#c9a66b]/25 bg-[linear-gradient(135deg,#ffffff,#ead8b5)] p-7 text-[#020713] shadow-[0_32px_95px_rgba(0,0,0,0.34)] md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#003366]/70">
                  elFormazione
                </p>

                <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] md:text-5xl">
                  İlk ilanını oluşturmaya hazır mısın?
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
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8ea3b8]">
        {label}
      </p>

      <p className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

function PremiumFeature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur transition hover:border-[#c9a66b]/45 hover:bg-white/[0.06] md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#c9a66b]/30 bg-[#c9a66b]/10 text-xs font-black text-[#ead8b5]">
          {number}
        </div>

        <div>
          <h3 className="text-xl font-black tracking-[-0.05em] text-white md:text-2xl">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#d8e2ee]/72">{text}</p>
        </div>
      </div>
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

function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#050b18] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.27)] md:p-8">
      <div className="mb-6 h-px w-full bg-gradient-to-r from-[#c9a66b]/70 via-white/10 to-transparent" />

      <h3 className="text-3xl font-black tracking-[-0.055em] text-white">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-8 text-[#d8e2ee]/75">{text}</p>
    </div>
  );
}