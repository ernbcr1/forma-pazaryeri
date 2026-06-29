import type { Metadata } from "next";
import SeoCategoryPage from "../components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Vintage Formalar | elFormazione",
  description:
    "Vintage forma ve koleksiyonluk futbol formalarını keşfet. Retro, eski sezon ve özel futbol ürünleri için elFormazione.",
};

export default function VintageFormalarPage() {
  return (
    <SeoCategoryPage
      eyebrow="Vintage Formalar"
      title="Vintage forma kültürü için özel pazar yeri."
      description="Eski sezon formalar, retro tasarımlar ve koleksiyonluk futbol parçaları elFormazione’da daha düzenli ve daha seçkin bir deneyimle keşfedilebilir."
      primaryButtonText="Vintage Ürünleri Keşfet"
      highlights={[
        {
          title: "Retro futbol ruhu",
          text: "Eski sezon formalar, unutulmaz dönemlerin tasarımlarını ve futbol kültürünü bugüne taşır.",
        },
        {
          title: "Koleksiyon değeri",
          text: "Sezon, kondisyon, nadirlik ve ürün geçmişi vintage formaların değerini belirleyen önemli unsurlardır.",
        },
        {
          title: "Daha temiz ilan deneyimi",
          text: "Ürün bilgileri belirli bir formatta sunulduğunda hem alıcı hem satıcı için daha güvenli bir süreç oluşur.",
        },
      ]}
      faq={[
        {
          question: "Vintage forma ne demektir?",
          answer:
            "Genellikle eski sezonlara ait, artık mağazada kolay bulunmayan veya koleksiyon değeri taşıyan futbol formaları vintage forma olarak görülür.",
        },
        {
          question: "Vintage forma alırken nelere bakılmalı?",
          answer:
            "Etiket, arma, sponsor baskısı, yaka detayı, kumaş yapısı, kondisyon ve ürünün sezon bilgisi dikkatle incelenmelidir.",
        },
        {
          question: "Koleksiyonluk formalar nasıl listelenmeli?",
          answer:
            "Net fotoğraf, sezon bilgisi, beden, marka, kondisyon, varsa kusur ve ürün hikayesi açıklamada belirtilmelidir.",
        },
      ]}
    />
  );
}