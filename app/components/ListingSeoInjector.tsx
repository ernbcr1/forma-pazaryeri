"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  condition: string | null;
  status: string | null;
};

type ListingImage = {
  image_url: string;
};

function getConditionUrl(condition?: string | null) {
  const normalizedCondition = condition?.toLowerCase() || "";

  if (
    normalizedCondition.includes("yeni") ||
    normalizedCondition.includes("etiketli")
  ) {
    return "https://schema.org/NewCondition";
  }

  return "https://schema.org/UsedCondition";
}

export default function ListingSeoInjector({
  listingId,
}: {
  listingId: string;
}) {
  const [jsonLd, setJsonLd] = useState<string | null>(null);

  useEffect(() => {
    loadListingSeo();
  }, [listingId]);

  async function loadListingSeo() {
    if (!listingId) return;

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id, title, description, price, currency, condition, status")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listingData) {
      return;
    }

    const listing = listingData as Listing;

    const { data: imageData } = await supabase
      .from("listing_images")
      .select("image_url")
      .eq("listing_id", listingId)
      .order("sort_order", { ascending: true })
      .limit(1);

    const firstImage = (imageData?.[0] as ListingImage | undefined)?.image_url;

    const numericPrice =
      typeof listing.price === "number"
        ? listing.price
        : typeof listing.price === "string"
          ? Number(listing.price)
          : null;

    const safeDescription =
      listing.description ||
      `${listing.title} ilanını elFormazione üzerinde inceleyebilir ve satıcıyla site içinden iletişime geçebilirsin.`;

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: listing.title,
      description: safeDescription,
      image: firstImage ? [firstImage] : undefined,
      brand: {
        "@type": "Brand",
        name: "elFormazione",
      },
      itemCondition: getConditionUrl(listing.condition),
      offers: {
        "@type": "Offer",
        url: `https://elformazione.com/listings/${listing.id}`,
        priceCurrency: listing.currency || "TRY",
        price: Number.isFinite(numericPrice) ? numericPrice : undefined,
        availability:
          listing.status === "sold"
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "elFormazione",
        },
      },
    };

    setJsonLd(JSON.stringify(productJsonLd).replace(/</g, "\\u003c"));
  }

  if (!jsonLd) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd,
      }}
    />
  );
}