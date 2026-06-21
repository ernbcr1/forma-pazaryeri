import Link from "next/link";

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
            İlan Kuralları
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
            elFormazione’da ürünlerin güvenli, düzenli ve anlaşılır şekilde
            listelenmesi için tüm ilanların belirli kurallara uygun olması
            beklenir.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          <RuleCard
            title="1. Sadece orijinal ürünler"
            text="Platformun ana odağı orijinal futbol ürünleridir. Replika, sahte, yanıltıcı veya orijinalliği şüpheli ürünler yayına alınmayabilir."
          />

          <RuleCard
            title="2. Net ve gerçek fotoğraf"
            text="İlanda kullanılan fotoğraflar ürüne ait olmalıdır. Ön, arka, etiket, arma, sponsor, kondisyon ve varsa kusur detayları açık şekilde gösterilmelidir."
          />

          <RuleCard
            title="3. Doğru kategori ve ürün bilgisi"
            text="Ürün; forma, antrenman ürünü, krampon, atkı, aksesuar veya koleksiyon gibi doğru kategori altında listelenmelidir."
          />

          <RuleCard
            title="4. Açıklama yanıltıcı olmamalı"
            text="Ürünün kondisyonu, bedeni, sezonu, markası, kusurları ve orijinallik bilgisi açıklamada dürüst şekilde belirtilmelidir."
          />

          <RuleCard
            title="5. Admin kontrolü"
            text="Yeni ilanlar ve düzenlenen ilanlar admin kontrolünden geçebilir. Uygun bulunmayan ilanlar reddedilebilir veya düzenleme istenebilir."
          />

          <RuleCard
            title="6. Yasaklı içerik"
            text="Futbol ürünüyle ilgisiz, yanıltıcı, saldırgan, yasa dışı veya marka/kişi haklarını ihlal eden içerikler yayınlanmaz."
          />

          <RuleCard
            title="7. Satış iletişimi"
            text="Alıcı ve satıcıların güvenli iletişim için site içi mesajlaşmayı kullanması önerilir."
          />
        </div>

        <div className="mt-8 rounded-[2rem] border border-neutral-800 bg-white p-6 text-black md:p-8">
          <h2 className="text-3xl font-black">İlanın uygun değilse</h2>

          <p className="mt-3 text-sm leading-7 text-black/60">
            Admin tarafından düzenleme istenirse bildirim üzerinden ilanını
            güncelleyebilirsin. Sorular için elformazione1@gmail.com adresinden
            iletişime geçebilirsin.
          </p>

          <Link
            href="/create-listing"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800"
          >
            İlan Ver
          </Link>
        </div>
      </section>
    </main>
  );
}

function RuleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-xl font-black">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-neutral-400">{text}</p>
    </div>
  );
}