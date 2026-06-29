import type { Metadata } from "next";
import SeoCategoryPage from "../components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Kramponlar | elFormazione",
  description:
    "Orijinal futbol kramponlarını keşfet. Numara, zemin tipi, kondisyon ve marka bilgileriyle krampon ilanları elFormazione’da.",
};

export default function KramponlarPage() {
  return (
    <SeoCategoryPage
      eyebrow="Kramponlar"
      title="Saha performansı için orijinal krampon pazarı."
      description="Futbol kramponları; marka, numara, zemin tipi, kondisyon ve kullanım durumuna göre daha düzenli şekilde listelenebilir."
      primaryButtonText="Kramponları Keşfet"
      highlights={[
        {
          title: "Numara ve zemin tipi",
          text: "Krampon ilanlarında numara, FG/AG/TF gibi zemin tipi ve kullanım durumu alıcı için kritik bilgilerdir.",
        },
        {
          title: "Kondisyon bilgisi",
          text: "Taban, diş, üst yüzey ve bağcık durumu gibi detaylar ürün güvenini artırır.",
        },
        {
          title: "Futbol odaklı pazar",
          text: "Genel ilan kalabalığı yerine futbol ürünlerine özel bir deneyim sunulur.",
        },
      ]}
      faq={[
        {
          question: "Krampon ilanında hangi bilgiler olmalı?",
          answer:
            "Marka, model, numara, zemin tipi, kullanım süresi, kondisyon ve net fotoğraflar mutlaka eklenmelidir.",
        },
        {
          question: "Krampon alırken nelere dikkat edilmeli?",
          answer:
            "Taban dişleri, üst yüzeyde yırtık olup olmadığı, kalıp bilgisi, numara uyumu ve kullanım zemini kontrol edilmelidir.",
        },
        {
          question: "Kullanılmış krampon satılabilir mi?",
          answer:
            "Kondisyonu açıkça belirtilen, temiz ve kullanılabilir durumdaki kramponlar ilan formatına uygun şekilde listelenebilir.",
        },
      ]}
    />
  );
}