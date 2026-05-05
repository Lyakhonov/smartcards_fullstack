import { useEffect, useState, useRef, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSEOHead, useJsonLd } from "../seo/head";

// Lazy load the external API section
const ExternalDataSection = lazy(() =>
  import("../components/ExternalDataSection").then((m) => ({
    default: m.ExternalDataSection,
  })),
);

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  // SEO: Установка мета-тегов для главной страницы
  useSEOHead({
    title: "SmartCards - Превратите документы в обучающие материалы",
    description:
      "SmartCards - инновационный инструмент для создания флеш-карточек из PDF документов. Автоматизируйте обучение с помощью искусственного интеллекта.",
    ogImage: "https://smartcards.example.com/og-home.png",
  });

  // SEO: JSON-LD Schema для организации
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SmartCards",
    description: "Инструмент для создания флеш-карточек из PDF документов",
    url: "https://smartcards.example.com",
    applicationCategory: "EducationalApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
    },
  });

  const uploadFile = (file: File) => nav("/loading", { state: { file } });

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedFile) {
        e.preventDefault();
        uploadFile(selectedFile);
      }
    };

    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selectedFile]);

  return (
    <>
      <Navbar />

      <main role="main">
        {/* Семантическая разметка: section с структурированным контентом */}
        <section
          className="upload-container"
          id="upload-section"
          aria-label="Загрузка PDF документов"
        >
          <h1 className="upload-title">
            Загрузите ваш PDF для создания smartcards
          </h1>

          <p className="upload-subtitle">
            Превратите документ в обучающие материалы
          </p>

          <div
            className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);

              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") setSelectedFile(f);
            }}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Область для перетаскивания PDF файла"
          >
            <div className="upload-icon" aria-hidden="true">
              ☁️
            </div>
            <p className="upload-text">Drag & drop</p>
            <span className="upload-browse">или кликните</span>

            <button className="upload-btn" type="button">
              Загрузить файл
            </button>

            {selectedFile && (
              <p className="upload-hint">
                ENTER для загрузки: <b>{selectedFile.name}</b>
              </p>
            )}
          </div>

          <input
            type="file"
            accept="application/pdf"
            hidden
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setSelectedFile(f);
            }}
            aria-label="Выбор PDF файла"
          />
        </section>

        {/* Секция с внешними данными (экспериментальная, lazy-loaded) */}
        <Suspense fallback={<div className="loading-placeholder" />}>
          <ExternalDataSection />
        </Suspense>
      </main>
    </>
  );
}
