import type { Metadata } from "next";
import SeoCategoryPage from "../components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Orijinal Formalar | elFormazione",
  description:
    "Orijinal futbol formalarını keşfet. Kulüp, sezon, marka, beden ve kondisyon bilgileriyle forma alım satımı için elFormazione.",
};

export default function FormalarPage() {
  return (
    <SeoCategoryPage
      eyebrow="Orijinal Formalar"
      title="Orijinal futbol formaları için seçkin pazar alanı."
      description="elFormazione; orijinal forma, sezonluk futbol ürünü ve koleksiyon parçalarını daha düzenli, daha güven veren ve futbol kültürüne özel bir yapıda buluşturur."
      highlights={[
        {
          title: "Kulüp ve sezon odağı",
          text: "Formaları kulüp, sezon, marka, beden ve kondisyon bilgilerine göre daha anlamlı şekilde inceleyebilirsin.",
        },
        {
          title: "Orijinallik yaklaşımı",
          text: "İlan sürecinde ürün bilgileri daha düzenli alınır ve platform güvenini korumaya yönelik kontrol akışı desteklenir.",
        },
        {
          title: "Site içi iletişim",
          text: "Alıcı ve satıcılar ürün hakkında doğrudan platform içinden iletişime geçebilir.",
        },
      ]}
      faq={[
        {
          question: "elFormazione’da hangi formalara yer verilir?",
          answer:
            "elFormazione, futbol kültürüne odaklanan bir pazar yeridir. Orijinal kulüp formaları, milli takım formaları, sezonluk ürünler ve koleksiyon değeri taşıyan futbol ürünleri için kullanılabilir.",
        },
        {
          question: "Forma ilanı verirken nelere dikkat edilmeli?",
          answer:
            "Ürünün marka, sezon, beden, kondisyon, varsa etiket bilgisi ve net fotoğrafları eklenmelidir. Açıklamanın detaylı olması alıcı güvenini artırır.",
        },
        {
          question: "Alıcı satıcıyla nasıl iletişim kurar?",
          answer:
            "Ürün hakkında soru sormak isteyen kullanıcılar site içi mesajlaşma özelliğiyle satıcıyla iletişim kurabilir.",
        },
      ]}
    />
  );
}