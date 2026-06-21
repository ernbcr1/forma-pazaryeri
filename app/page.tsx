import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-10 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Beta Yayında · Est. 2020
                </div>

                <h1 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">
                  Orijinal futbol ürünleri için yeni pazar yeri.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-400 md:text-lg">
                  elFormazione; forma, antrenman ürünü, krampon, atkı, aksesuar
                  ve koleksiyon parçaları için geliştirilen kalite kontrollü bir
                  futbol pazar yeri deneyimidir.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/listings"
                    className="rounded-full bg-white px-7 py-4 text-center font-bold text-black hover:bg-neutral-200"
                  >
                    Marketi Keşfet
                  </Link>

                  <Link
                    href="/create-listing"
                    className="rounded-full border border-neutral-800 px-7 py-4 text-center font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  >
                    İlan Ver
                  </Link>
                </div>

                <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
                  <p className="text-sm font-bold text-neutral-300">
                    Canlı beta notu
                  </p>

                  <p className="mt-2 text-sm leading-7 text-neutral-500">
                    elFormazione şu anda aktif geliştirme sürecindedir. İlanlar
                    admin kontrolünden geçebilir. Destek, öneri ve iş birliği
                    için elformazione1@gmail.com adresinden iletişime
                    geçebilirsin.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <ShowcaseCard
                  title="Orijinal ürün odağı"
                  text="Platformun ana hedefi orijinal futbol ürünlerini daha düzenli, güvenli ve anlaşılır şekilde listelemek."
                />

                <ShowcaseCard
                  title="Admin onay akışı"
                  text="Yeni ilanlar yayına çıkmadan önce kontrol edilebilir. Uygun olmayan ilanlar reddedilebilir veya düzenleme istenebilir."
                />

                <ShowcaseCard
                  title="Site içi mesajlaşma"
                  text="Alıcı ve satıcılar ürün hakkında doğrudan platform içinden iletişime geçebilir."
                />

                <ShowcaseCard
                  title="Favori ve bildirim sistemi"
                  text="Kullanıcılar beğendiği ürünleri favorileyebilir, ilan durumlarını ve mesajlarını takip edebilir."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StatCard number="01" title="İlan oluştur" text="Ürün bilgilerini ve fotoğraflarını ekle." />
            <StatCard number="02" title="Kontrolden geçsin" text="İlanın kalite ve uygunluk kontrolüne düşer." />
            <StatCard number="03" title="Markette yayınlansın" text="Onaylanan ilan kullanıcılar tarafından görüntülenir." />
          </div>

          <section className="mt-8 rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Güven ve kalite
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                  Futbol kültürüne daha düzenli bir pazar alanı.
                </h2>
              </div>

              <p className="text-sm leading-8 text-neutral-400 md:text-base">
                elFormazione, klasik ilan sitelerinden farklı olarak futbol
                ürünlerine odaklanır. Amaç; formaları, kramponları, atkıları,
                antrenman ürünlerini ve koleksiyon parçalarını daha temiz bir
                kategorilendirme, daha net açıklama ve daha güven veren bir ilan
                deneyimiyle sunmaktır.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <InfoPanel
              title="Alıcılar için"
              items={[
                "Ürün fotoğraflarını ve açıklamaları dikkatlice incele.",
                "Satıcıya site içi mesajlaşma üzerinden soru sor.",
                "Favorilerine eklediğin ilanları daha sonra takip et.",
                "Şüpheli veya eksik açıklamalı ürünlerde dikkatli davran.",
              ]}
            />

            <InfoPanel
              title="Satıcılar için"
              items={[
                "Ürünün gerçek ve net fotoğraflarını yükle.",
                "Kusur, kondisyon, beden ve sezon bilgisini açıkça yaz.",
                "Orijinallik bilgisinde yanıltıcı ifade kullanma.",
                "Admin düzenleme isterse ilanını güncelleyerek tekrar onaya gönder.",
              ]}
            />
          </section>

          <section className="mt-8 rounded-[2.5rem] border border-neutral-800 bg-white p-6 text-black md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/50">
                  elFormazione
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight">
                  İlk ilanını oluşturmaya hazır mısın?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
                  Ürününü ekle, kontrol sürecinden geçsin ve markette
                  yayınlansın.
                </p>
              </div>

              <Link
                href="/create-listing"
                className="rounded-full bg-black px-7 py-4 text-center font-bold text-white hover:bg-neutral-800"
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

function ShowcaseCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6">
      <h2 className="text-xl font-black">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-neutral-500">{text}</p>
    </div>
  );
}

function StatCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
      <p className="text-sm font-black text-neutral-600">{number}</p>

      <h2 className="mt-4 text-2xl font-black">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-neutral-500">{text}</p>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
      <h2 className="text-3xl font-black">{title}</h2>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-7 text-neutral-400">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-white" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}