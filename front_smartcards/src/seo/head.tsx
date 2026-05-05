/**
 * SEO Head Component
 * Управляет мета-тегами, title, canonical URL и OpenGraph
 */

import { useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getRouteConfig } from "./routes";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://smartcards.example.com/og-image.png";
const APP_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://smartcards.example.com";

export function useSEOHead(props?: SEOHeadProps) {
  try {
    const location = useLocation();

    useEffect(() => {
      try {
        const route = getRouteConfig(location.pathname);

        // Title
        const title = props?.title || route?.title || "SmartCards";
        document.title = title;

        // Description
        const description =
          props?.description ||
          route?.description ||
          "SmartCards - превратите документы в обучающие материалы";
        updateMetaTag("description", description);

        // Canonical URL
        const canonical = props?.canonical || `${APP_URL}${location.pathname}`;
        updateCanonicalTag(canonical);

        // Open Graph
        updateMetaTag("og:title", props?.ogTitle || title, "property");
        updateMetaTag(
          "og:description",
          props?.ogDescription || description,
          "property",
        );
        updateMetaTag(
          "og:image",
          props?.ogImage || DEFAULT_OG_IMAGE,
          "property",
        );
        updateMetaTag("og:type", props?.ogType || "website", "property");
        updateMetaTag("og:url", canonical, "property");

        // Robots
        if (props?.noindex || !route?.isPublic) {
          updateMetaTag("robots", "noindex, nofollow");
        } else {
          updateMetaTag("robots", "index, follow");
        }

        // Twitter Card
        updateMetaTag("twitter:card", "summary_large_image");
        updateMetaTag("twitter:title", props?.ogTitle || title);
        updateMetaTag(
          "twitter:description",
          props?.ogDescription || description,
        );
        updateMetaTag("twitter:image", props?.ogImage || DEFAULT_OG_IMAGE);
      } catch (e) {
        console.error("Error in useSEOHead effect:", e);
      }
    }, [location.pathname, props]);
  } catch (e) {
    console.error("Error in useSEOHead:", e);
  }
}

/**
 * Обновляет или создаёт мета-тег
 */
function updateMetaTag(
  name: string,
  content: string,
  attribute: "name" | "property" = "name",
) {
  let tag = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${name}"]`,
  );

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

/**
 * Обновляет canonical URL
 */
function updateCanonicalTag(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Добавляет JSON-LD структурированные данные
 */
export function useJsonLd(data: Record<string, any>) {
  useEffect(() => {
    try {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify(data);

      // Удаляем старый скрипт, если существует
      const existing = document.querySelector(
        'script[type="application/ld+json"]',
      );
      if (existing) {
        existing.remove();
      }

      document.head.appendChild(script);

      return () => {
        try {
          script.remove();
        } catch (e) {
          console.error("Error removing JSON-LD script:", e);
        }
      };
    } catch (e) {
      console.error("Error in useJsonLd:", e);
    }
  }, [data]);
}

/**
 * React Component для управления SEO (альтернатива hook'у)
 */
export function SEOHead({
  children,
  ...props
}: SEOHeadProps & { children?: ReactNode }) {
  useSEOHead(props);
  return <>{children}</>;
}
