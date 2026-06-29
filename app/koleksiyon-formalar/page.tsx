import type { Metadata } from "next";
import SeoCategoryPage from "../components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Koleksiyon Formalar | elFormazione",
  description:
    "Koleksiyonluk forma ve özel futbol ürünlerini keşfet. Nadir, eski sezon ve özel parçalar için elFormazione.",
};

export default function KoleksiyonFormalarPage() {
  return (
    <SeoCategoryPage
      eyebrow="Koleksiyon Formalar"
      title="Koleksiyon değeri taşıyan futbol parçaları."
      description="Nadir formalar, özel sezon ürünleri, eski dönem futbol parçaları ve koleksiyonluk ürünler için daha seçkin bir pazar deneyimi."
      primaryButtonText="Koleksiyon Ürünlerini Keşfet"
      highlights={[
        {
          title: "Nadir parçalar",
          text: "Bazı formalar sezonu, oyuncu baskısı, kondisyonu veya sınırlı bulunabilirliği nedeniyle koleksiyon değeri taşıyabilir.",
        },
        {
          title: "Ürün hikayesi",
          text: "Koleksiyon ürünlerinde ürünün dönemi, kondisyonu ve detaylı açıklaması alıcı için büyük önem taşır.",
        },
        {
          title: "Futbol kültürü",
          text: "elFormazione yalnızca ürün listeleme değil, futbol kültürünü merkeze alan bir pazar deneyimi hedefler.",
        },
      ]}
      faq={[
        {
          question: "Bir formayı koleksiyonluk yapan şey nedir?",
          answer:
            "Sezonu, nadirliği, kondisyonu, oyuncu baskısı, özel maç bağlantısı veya artık kolay bulunmaması formaya koleksiyon değeri katabilir.",
        },
        {
          question: "Koleksiyon forma ilanında ne yazılmalı?",
          answer:
            "Sezon, kulüp, marka, beden, kondisyon, varsa oyuncu baskısı, ürün hikayesi ve kusurlar açıkça belirtilmelidir.",
        },
        {
          question: "Koleksiyon ürünlerinde fiyat nasıl belirlenir?",
          answer:
            "Nadirlik, kondisyon, talep, sezon, marka ve benzer ürünlerin piyasa değeri fiyatı etkileyen başlıca unsurlardır.",
        },
      ]}
    />
  );
}