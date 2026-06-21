import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-10 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.5rem] border border-neutral-800 bg-neutral-900">
            <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
              <div className="flex flex-col justify-center">
                <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Orijinal futbol ürünleri için seçili pazar yeri
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                  Futbol kültürünün en özel parçaları tek yerde.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-400 md:text-lg">
                  elFormazione; orijinal forma, antrenman ürünü, krampon,
                  atkı, aksesuar ve koleksiyon parçaları için kalite kontrollü
                  bir pazar yeri deneyimi sunar.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/listings"
                    className="rounded-full bg-white px-7 py-4 text-center font-bold text-black hover:bg-neutral-200"
                  >
                    İlanları Keşfet
                  </Link>

                  <Link
                    href="/create-listing"
                    className="rounded-full border border-neutral-700 px-7 py-4 text-center font-bold hover:bg-neutral-800"
                  >
                    İlan Ver
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <MiniStat value="100%" label="Orijinal ürün odağı" />
                  <MiniStat value="elF" label="Kalite kontrol etiketi" />
                  <MiniStat value="TR" label="TL ve Türkiye şehirleri" />
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950 p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_30%)]" />

                <div className="relative grid h-full gap-4">
                  <ShowcaseCard
                    title="1998/99 Retro Forma"
                    meta="Milan • XL • Çok iyi"
                    price="4.250₺"
                    badge="elF Check"
                  />

                  <ShowcaseCard
                    title="Antrenman Üstü"
                    meta="Real Madrid • L • Yeni"
                    price="2.100₺"
                    badge="Onay bekliyor"
                  />

                  <ShowcaseCard
                    title="Maç Günü Atkısı"
                    meta="Galatasaray • Standart"
                    price="850₺"
                    badge="Koleksiyon"
                  />
                </div>
              </div>
            </div>
          </div>

          <section className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureCard
              title="Orijinallik odağı"
              text="Replika ve sahte ürün yerine orijinal/lisanslı ürün beyanı ve admin kontrolü ön planda tutulur."
            />

            <FeatureCard
              title="İlan onay sistemi"
              text="Yeni ilanlar ve düzenlemeler admin kontrolüne düşer. Onay, red ve düzenleme istekleri bildirimle kullanıcıya gider."
            />

            <FeatureCard
              title="Favori ve mesajlaşma"
              text="Kullanıcılar ürünleri favorileyebilir, ilan sahibiyle site içinden mesajlaşabilir ve ürün durumlarını takip edebilir."
            />
          </section>

          <section className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-sm text-neutral-500">Nasıl çalışır?</p>

                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                  Basit ama kontrollü satış akışı
                </h2>

                <p className="mt-4 text-sm leading-7 text-neutral-400 md:text-base">
                  Kullanıcı ilan oluşturur, admin kontrol eder, onaylanan ürün
                  yayına çıkar. Böylece pazar yeri daha güvenli ve düzenli
                  kalır.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <StepCard
                  number="01"
                  title="İlan oluştur"
                  text="Kategori, marka, beden, şehir ve fiyat bilgileri seçenekli girilir."
                />

                <StepCard
                  number="02"
                  title="Admin kontrolü"
                  text="İlan onaya düşer. Gerekirse düzenleme istenir veya reddedilir."
                />

                <StepCard
                  number="03"
                  title="Yayına çık"
                  text="Onaylanan ilan listelerde görünür ve kullanıcılar favorileyebilir."
                />

                <StepCard
                  number="04"
                  title="Mesajlaş"
                  text="Alıcı ve satıcı site içindeki mesajlaşma sistemiyle iletişim kurar."
                />
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              <h2 className="text-2xl font-black">Satıcılar için</h2>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                Ürününü doğru kategoriyle ekle, fotoğraflarını yükle, fiyatını
                TL olarak belirle. İlan onaylandıktan sonra profilinden durumunu
                takip edebilir, fiyat ve açıklamayı gerektiğinde
                güncelleyebilirsin.
              </p>

              <Link
                href="/create-listing"
                className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
              >
                İlan Vermeye Başla
              </Link>
            </div>

            <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
              <h2 className="text-2xl font-black">Alıcılar için</h2>

              <p className="mt-3 text-sm leading-7 text-neutral-400">
                Kategori, marka, beden, şehir ve arama filtreleriyle ürünleri
                keşfet. Beğendiğin ürünleri favorilerine ekle, satıcıyla site
                içinden mesajlaş ve ürün durumlarını takip et.
              </p>

              <Link
                href="/listings"
                className="mt-6 inline-block rounded-full border border-neutral-700 px-6 py-3 font-semibold hover:bg-neutral-800"
              >
                Ürünleri Keşfet
              </Link>
            </div>
          </section>

          <section className="mt-10 rounded-[2.5rem] border border-neutral-800 bg-white p-6 text-black md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-black/50">
                  elFormazione
                </p>

                <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
                  Futbol ürünlerini daha güvenli ve düzenli satmaya başla.
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth"
                  className="rounded-full bg-black px-7 py-4 text-center font-bold text-white hover:bg-neutral-800"
                >
                  Giriş Yap
                </Link>

                <Link
                  href="/listings"
                  className="rounded-full border border-black/20 px-7 py-4 text-center font-bold hover:bg-black/5"
                >
                  Marketi Gör
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xl font-black">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function ShowcaseCard({
  title,
  meta,
  price,
  badge,
}: {
  title: string;
  meta: string;
  price: string;
  badge: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
          {badge}
        </span>

        <span className="text-lg font-black">{price}</span>
      </div>

      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-2 text-sm text-neutral-500">{meta}</p>

      <div className="mt-5 h-28 rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-800 to-neutral-950" />
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-xl font-black">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-neutral-400">{text}</p>
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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <p className="text-sm font-black text-neutral-600">{number}</p>

      <h3 className="mt-3 text-lg font-black">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
    </div>
  );
}