export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-neutral-800 bg-neutral-900 p-6 md:p-10">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
            Gizlilik Politikası
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">
            Bu politika, elFormazione kullanımında hangi bilgilerin
            işlenebileceğini ve bu bilgilerin ne amaçla kullanılabileceğini
            açıklar.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <TextBlock
            title="Toplanan bilgiler"
            text="Platform kullanımında e-posta adresi, kullanıcı kimliği, ilan bilgileri, ürün fotoğrafları, favoriler, bildirimler ve site içi mesajlaşma kayıtları işlenebilir."
          />

          <TextBlock
            title="Bilgilerin kullanım amacı"
            text="Bilgiler; hesap oluşturma, giriş yapma, ilan yayınlama, favori ekleme, bildirim gösterme, mesajlaşma ve platform güvenliğini sağlama amacıyla kullanılabilir."
          />

          <TextBlock
            title="İlan ve görseller"
            text="Kullanıcıların eklediği ilan içerikleri ve ürün görselleri, ilan yayındayken diğer kullanıcılar tarafından görüntülenebilir."
          />

          <TextBlock
            title="Mesajlaşma"
            text="Site içi mesajlaşma, alıcı ve satıcı arasındaki iletişimi sağlamak için kullanılır. Kullanıcılar mesajlarında kişisel bilgi paylaşırken dikkatli olmalıdır."
          />

          <TextBlock
            title="Üçüncü taraf servisler"
            text="Platformun altyapısında Supabase gibi servisler kullanılabilir. Bu servisler kimlik doğrulama, veritabanı ve dosya depolama işlemleri için kullanılmaktadır."
          />

          <TextBlock
            title="Veri güvenliği"
            text="Kullanıcı verilerinin güvenliği için yetkilendirme, oturum kontrolü ve erişim politikaları uygulanır. Ancak internet üzerindeki hiçbir sistem için mutlak güvenlik garanti edilemez."
          />

          <TextBlock
            title="İletişim"
            text="Gizlilik politikasıyla ilgili sorular için elformazione1@gmail.com adresi üzerinden iletişime geçilebilir."
          />
        </div>

        <p className="mt-8 text-xs leading-6 text-neutral-600">
          Not: Bu metin genel bilgilendirme amacıyla hazırlanmıştır. Gerçek
          şirketleşme, ödeme sistemi ve kargo entegrasyonu aşamasında KVKK ve
          ilgili mevzuata göre profesyonel destekle güncellenmesi önerilir.
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