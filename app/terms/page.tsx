export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
            Kullanım Şartları
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
            Bu sayfa, elFormazione platformunun temel kullanım ilkelerini
            açıklar. Platformu kullanan kullanıcılar bu şartları kabul etmiş
            sayılır.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <TextBlock
            title="Platformun amacı"
            text="elFormazione, futbol ürünlerinin listelenmesi, keşfedilmesi, favorilere eklenmesi ve kullanıcılar arasında site içi mesajlaşma yapılması için geliştirilmiş bir pazar yeri platformudur."
          />

          <TextBlock
            title="Kullanıcı sorumluluğu"
            text="Kullanıcılar ekledikleri ilanlardan, açıklamalardan, fotoğraflardan, fiyat bilgisinden ve diğer kullanıcılarla yaptıkları iletişimden sorumludur."
          />

          <TextBlock
            title="İlan onayı"
            text="elFormazione, ilanları kontrol etme, yayına alma, düzenleme isteme, reddetme veya yayından kaldırma hakkını saklı tutar."
          />

          <TextBlock
            title="Ürün ve satış sorumluluğu"
            text="Platform, kullanıcıların ürünlerini listelemesine aracılık eder. Ürün açıklaması, ürünün gerçek durumu, teslimat ve satış süreci alıcı ile satıcı arasındaki iletişim ve anlaşmaya bağlıdır."
          />

          <TextBlock
            title="Yasaklı kullanım"
            text="Sahte ürün, yanıltıcı ilan, dolandırıcılık amacı taşıyan davranış, spam, hakaret, yasa dışı içerik veya üçüncü kişilerin haklarını ihlal eden kullanımlar yasaktır."
          />

          <TextBlock
            title="Hesap ve erişim"
            text="elFormazione, güvenlik veya kural ihlali durumlarında kullanıcı hesabını sınırlama, ilanları pasife alma veya erişimi durdurma hakkını saklı tutar."
          />

          <TextBlock
            title="İletişim"
            text="Kullanım şartlarıyla ilgili sorular için elformazione1@gmail.com adresi üzerinden iletişime geçilebilir."
          />
        </div>

        <p className="mt-8 text-xs leading-6 text-neutral-600">
          Not: Bu metin genel bilgilendirme amacıyla hazırlanmıştır. Gerçek
          şirketleşme ve ödeme altyapısı aşamasında profesyonel hukuki destekle
          güncellenmesi önerilir.
        </p>
      </section>
    </main>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-xl font-black">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-neutral-400">{text}</p>
    </div>
  );
}