"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";

type ListingSeoData = {
  id: string;
  title: string;
  description: string | null;
  price: number | string | null;
  currency: string | null;
  condition: string | null;
  status: string | null;
  club: string | null;
  brand: string | null;
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

function getListingIdFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 2 && parts[0] === "listings") {
    return parts[1];
  }

  return null;
}

function upsertMetaDescription(content: string) {
  let metaDescription = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]'
  );

  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    document.head.appendChild(metaDescription);
  }

  metaDescription.content = content;
}

function upsertCanonical(url: string) {
  let canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = url;
}

function removeOldJsonLd() {
  const oldScript = document.getElementById("elf-listing-product-jsonld");

  if (oldScript) {
    oldScript.remove();
  }
}

function upsertJsonLd(jsonLd: Record<string, unknown>) {
  removeOldJsonLd();

  const script = document.createElement("script");
  script.id = "elf-listing-product-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  document.head.appendChild(script);
}

export default function ListingRouteSeo() {
  const pathname = usePathname();

  useEffect(() => {
    const listingId = getListingIdFromPath(pathname);

    if (!listingId) {
      removeOldJsonLd();
      return;
    }

    let cancelled = false;

    async function loadListingSeo() {
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(
          "id, title, description, price, currency, condition, status, club, brand"
        )
        .eq("id", listingId)
        .maybeSingle();

      if (cancelled || listingError || !listingData) {
        return;
      }

      const listing = listingData as ListingSeoData;

      const { data: imageData } = await supabase
        .from("listing_images")
        .select("image_url")
        .eq("listing_id", listingId)
        .order("sort_order", { ascending: true })
        .limit(1);

      if (cancelled) {
        return;
      }

      const firstImage = (imageData?.[0] as ListingImage | undefined)
        ?.image_url;

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://elformazione.com";

      const listingUrl = `${siteUrl}/listings/${listing.id}`;

      const numericPrice =
        typeof listing.price === "number"
          ? listing.price
          : typeof listing.price === "string"
            ? Number(listing.price)
            : null;

      const safeDescription =
        listing.description?.slice(0, 155) ||
        `${listing.title} ilanını elFormazione üzerinde incele. Orijinal futbol ürünleri, forma, krampon ve koleksiyon parçaları için güvenli pazar yeri.`;

      document.title = `${listing.title} | elFormazione`;

      upsertMetaDescription(safeDescription);
      upsertCanonical(listingUrl);

      const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: safeDescription,
        image: firstImage ? [firstImage] : undefined,
        brand: {
          "@type": "Brand",
          name: listing.brand || listing.club || "elFormazione",
        },
        itemCondition: getConditionUrl(listing.condition),
        offers: {
          "@type": "Offer",
          url: listingUrl,
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

      upsertJsonLd(productJsonLd);
    }

    loadListingSeo();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}