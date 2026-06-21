import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.75rem] border border-neutral-800 bg-neutral-900">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-7 md:p-12 lg:p-16">
                <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-300">
                  Est. 2020 · Original Football Marketplace
                </div>

                <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                  Orijinal futbol ürünleri için seçkin pazar yeri.
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-400 md:text-lg">
                  elFormazione; forma, antrenman ürünü, krampon, atkı,
                  aksesuar ve koleksiyon parçalarını tek bir odakta buluşturan,
                  kalite kontrollü futbol pazar yeri deneyimidir.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/listings"
                    className="rounded-full bg-white px-8 py-4 text-center font-bold text-black transition hover:bg-neutral-200"
                  >
                    Marketi Keşfet
                  </Link>

                  <Link
                    href="/create-listing"
                    className="rounded-full border border-neutral-700 px-8 py-4 text-center font-bold text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
                  >
                    İlan Ver
                  </Link>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                  <MiniStat label="Odak" value="Orijinal" />
                  <MiniStat label="Süreç" value="Kontrollü" />
                  <MiniStat label="İletişim" value="Site içi" />
                </div>
              </div>

              <div className="border-t border-neutral-800 bg-neutral-950 p-6 md:p-10 lg:border-l lg:border-t-0">
                <div className="grid h-full content-center gap-4">
                  <PremiumCard
                    title="Forma ve koleksiyon ürünleri"
                    text="Kulüp, sezon, marka, beden ve kondisyon bilgileriyle daha düzenli ilan deneyimi."
                  />

                  <PremiumCard
                    title="Kalite kontrol yaklaşımı"
                    text="İlanlar, platform düzenini ve ürün güvenini korumak için kontrol sürecinden geçebilir."
                  />

                  <PremiumCard
                    title="Alıcı-satıcı iletişimi"
                    text="Kullanıcılar ürün hakkında doğrudan platform içinden mesajlaşabilir."
                  />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
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

          <section className="mt-8 rounded-[2.75rem] border border-neutral-800 bg-neutral-900 p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-neutral-500">
                  elFormazione standardı
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                  Futbol kültürüne özel, daha temiz bir pazar alanı.
                </h2>
              </div>

              <div className="space-y-5 text-sm leading-8 text-neutral-400 md:text-base">
                <p>
                  elFormazione, genel ilan sitelerinden farklı olarak futbol
                  ürünlerine odaklanır. Amaç; formaları, kramponları, atkıları,
                  antrenman ürünlerini ve koleksiyon parçalarını daha sade,
                  daha düzenli ve daha güven veren bir yapıda sunmaktır.
                </p>

                <p>
                  Ürün bilgileri, ilan durumu, favoriler, mesajlaşma ve admin
                  onay akışı tek bir platform içinde yönetilir.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <InfoPanel
              title="Alıcılar için"
              text="Ürünleri kategori, beden, marka ve şehir bilgilerine göre inceleyebilir; satıcıyla site içinden iletişime geçebilir ve beğendiğin ilanları favorilerinde takip edebilirsin."
            />

            <InfoPanel
              title="Satıcılar için"
              text="Ürünlerini kontrollü ve düzenli bir formatta listeleyebilir; ilan durumunu, favori sayısını, mesajlarını ve admin geri bildirimlerini profilinden takip edebilirsin."
            />
          </section>

          <section className="mt-8 rounded-[2.75rem] border border-neutral-800 bg-white p-7 text-black md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-black/50">
                  elFormazione
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight">
                  İlk ilanını oluşturmaya hazır mısın?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
                  Orijinal futbol ürününü ekle, kontrol sürecinden geçsin ve
                  markette yayınlansın.
                </p>
              </div>

              <Link
                href="/create-listing"
                className="rounded-full bg-black px-8 py-4 text-center font-bold text-white transition hover:bg-neutral-800"
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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function PremiumCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-7">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>

      <p className="mt-4 text-sm leading-7 text-neutral-400">{text}</p>
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
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-7">
      <p className="text-sm font-black text-neutral-500">{number}</p>

      <h2 className="mt-5 text-2xl font-black tracking-tight">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-neutral-400">{text}</p>
    </div>
  );
}

function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-7 md:p-8">
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>

      <p className="mt-4 text-sm leading-8 text-neutral-400">{text}</p>
    </div>
  );
}