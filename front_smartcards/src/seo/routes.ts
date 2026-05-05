/**
 * SEO Configuration for SmartCards
 * Определяет публичные, приватные и служебные маршруты
 */

export interface SEORoute {
  path: string;
  title: string;
  description: string;
  isPublic: boolean; // Индексировать ли в поисковых системах
  priority: number; // 0.0-1.0 для sitemap.xml
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  includeInSitemap: boolean;
}

export const SEO_ROUTES: SEORoute[] = [
  // ============ ПУБЛИЧНЫЕ МАРШРУТЫ (ИНДЕКСИРУЮТСЯ) ============
  {
    path: "/",
    title: "SmartCards - Превратите документы в обучающие материалы",
    description:
      "SmartCards - инновационный инструмент для создания флеш-карточек из PDF документов. Автоматизируйте обучение с помощью искусственного интеллекта.",
    isPublic: true,
    priority: 1.0,
    changefreq: "daily",
    includeInSitemap: true,
  },
  {
    path: "/login",
    title: "Вход - SmartCards",
    description:
      "Войдите в ваш аккаунт SmartCards для доступа к вашим карточкам и истории.",
    isPublic: true,
    priority: 0.8,
    changefreq: "never",
    includeInSitemap: true,
  },
  {
    path: "/register",
    title: "Регистрация - SmartCards",
    description:
      "Создайте аккаунт SmartCards и начните создавать умные флеш-карточки прямо сейчас.",
    isPublic: true,
    priority: 0.9,
    changefreq: "never",
    includeInSitemap: true,
  },

  // ============ ПРИВАТНЫЕ МАРШРУТЫ (НЕ ИНДЕКСИРУЮТСЯ) ============
  {
    path: "/group/:id",
    title: "Группа карточек - SmartCards",
    description: "Ваша группа флеш-карточек",
    isPublic: false,
    priority: 0.5,
    changefreq: "never",
    includeInSitemap: false,
  },
  {
    path: "/history",
    title: "История - SmartCards",
    description: "История ваших загрузок и созданных карточек",
    isPublic: false,
    priority: 0.5,
    changefreq: "weekly",
    includeInSitemap: false,
  },
  {
    path: "/users",
    title: "Управление пользователями - SmartCards",
    description: "Админская панель для управления пользователями",
    isPublic: false,
    priority: 0.3,
    changefreq: "never",
    includeInSitemap: false,
  },

  // ============ СЛУЖЕБНЫЕ МАРШРУТЫ (НЕ ИНДЕКСИРУЮТСЯ) ============
  {
    path: "/loading",
    title: "Загрузка - SmartCards",
    description: "Страница загрузки",
    isPublic: false,
    priority: 0.1,
    changefreq: "never",
    includeInSitemap: false,
  },
];

/**
 * Получить конфиг для конкретного маршрута
 */
export function getRouteConfig(pathname: string): SEORoute | undefined {
  // Точное совпадение
  let route = SEO_ROUTES.find((r) => r.path === pathname);
  if (route) return route;

  // Совпадение с параметрами (например /group/:id)
  for (const r of SEO_ROUTES) {
    if (r.path.includes(":")) {
      const regex = new RegExp(
        "^" + r.path.replace(/:[^\s/]+/g, "[^\\/]+") + "$",
      );
      if (regex.test(pathname)) return r;
    }
  }

  return undefined;
}

/**
 * Получить все публичные маршруты для sitemap
 */
export function getPublicRoutes(): SEORoute[] {
  return SEO_ROUTES.filter((r) => r.includeInSitemap);
}

/**
 * Проверить, индексируется ли маршрут
 */
export function isRouteIndexable(pathname: string): boolean {
  const route = getRouteConfig(pathname);
  return route?.isPublic ?? false;
}
