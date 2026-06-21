import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
          <p className="text-sm text-neutral-500">elFormazione Yardım Merkezi</p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
            Yardım, güvenlik ve sıkça sorulan sorular
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
            elFormazione’da ilan verme, ürün keşfetme, mesajlaşma, favoriler ve
            admin onay süreci hakkında temel bilgileri burada bulabilirsin.
          </p>

          <div className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-bold text-neutral-300">
              İletişim ve destek
            </p>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Yardım, öneri, iş birliği veya destek talepleri için bizimle
              iletişime geçebilirsin.
            </p>

            <a
              href="mailto:elformazione1@gmail.com"
              className="mt-3 inline-block rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-neutral-200"
            >
              elformazione1@gmail.com
            </a>
          </div>
        </div>

        <section id="sss" className="mt-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <p className="text-sm text-neutral-500">SSS</p>

          <h2 className="mt-2 text-3xl font-black">Sıkça Sorulan Sorular</h2>

          <div className="mt-6 space-y-4">
            <FaqItem
              question="elFormazione nedir?"
              answer="elFormazione; orijinal futbol ürünleri, formalar, antrenman ürünleri, kramponlar, atkılar ve koleksiyon parçaları için geliştirilen kalite kontrollü bir pazar yeri platformudur."
            />

            <FaqItem
              question="İlanım neden hemen yayına çıkmıyor?"
              answer="Yeni ilanlar admin kontrolüne düşer. Bu süreç, platformda daha düzenli ve güvenilir bir ürün deneyimi oluşturmak için kullanılır."
            />

            <FaqItem
              question="İlanımı sonradan düzenleyebilir miyim?"
              answer="Evet. Ancak düzenleme ekranında şu an sadece fiyat ve açıklama değiştirilebilir. Kategori, ürün başlığı, beden, marka ve fotoğraflar ilan bütünlüğü için kilitli tutulur."
            />

            <FaqItem
              question="Bir ilan reddedilirse ne olur?"
              answer="İlan reddedildiğinde bildirim alırsın. Gerekirse doğru bilgilerle yeni ilan oluşturabilir veya uygun durumlarda ilanı tekrar onaya gönderebilirsin."
            />

            <FaqItem
              question="Satıcıyla nasıl iletişime geçerim?"
              answer="İlan detay sayfasından satıcıya mesaj gönderebilirsin. Mesajlar site içindeki Mesajlar sayfasında tutulur."
            />

            <FaqItem
              question="Favoriler ne işe yarar?"
              answer="Beğendiğin ürünleri favorilerine ekleyerek daha sonra kolayca takip edebilirsin. Bazı ürün durum değişiklikleri bildirim olarak da gösterilir."
            />
          </div>
        </section>

        <section id="satici" className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
            <p className="text-sm text-neutral-500">Satıcı Rehberi</p>

            <h2 className="mt-2 text-3xl font-black">
              Daha iyi ilan için öneriler
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-7 text-neutral-400">
              <p>
                Ürünün ön, arka, yaka, etiket ve kondisyon detaylarını net
                fotoğraflarla göster.
              </p>

              <p>
                Açıklamada ürünün kusurlarını, ölçülerini, sezonunu ve
                orijinallik bilgisini açıkça yaz.
              </p>

              <p>
                Fiyatı TL olarak gir ve ürünün durumuna göre gerçekçi bir fiyat
                belirle.
              </p>

              <p>
                Admin düzenleme isterse bildirimden düzenleme sayfasına gidip
                fiyat veya açıklama bilgisini güncelleyebilirsin.
              </p>
            </div>
          </div>

          <div id="guvenlik" className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
            <p className="text-sm text-neutral-500">Güvenli Alışveriş</p>

            <h2 className="mt-2 text-3xl font-black">
              Alıcılar için dikkat edilmesi gerekenler
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-7 text-neutral-400">
              <p>
                Ürün fotoğraflarını dikkatli incele. Etiket, arma, sponsor,
                dikiş ve kondisyon detaylarını kontrol et.
              </p>

              <p>
                Satıcıya ürünün ölçüsü, kondisyonu ve orijinallik bilgisi
                hakkında site içi mesajla soru sor.
              </p>

              <p>
                Çok düşük fiyatlı veya açıklaması eksik ürünlerde daha dikkatli
                davran.
              </p>

              <p>
                Platform içi bildirimleri ve mesajları takip ederek ürün
                durumundaki değişiklikleri kaçırma.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-neutral-800 bg-white p-6 text-black md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-black/50">elFormazione</p>

              <h2 className="mt-2 text-3xl font-black">
                Yardım alamadın mı?
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/60">
                Bize e-posta gönderebilirsin. En kısa sürede dönüş yapılır.
              </p>
            </div>

            <a
              href="mailto:elformazione1@gmail.com"
              className="rounded-full bg-black px-6 py-3 text-center text-sm font-bold text-white hover:bg-neutral-800"
            >
              İletişime Geç
            </a>
          </div>
        </section>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold hover:bg-neutral-900"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </section>
    </main>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <h3 className="font-black">{question}</h3>

      <p className="mt-2 text-sm leading-7 text-neutral-500">{answer}</p>
    </div>
  );
}