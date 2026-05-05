/**
 * Мок API для тестирования
 */
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// Определяем базовый URL API
const API_BASE = "http://localhost:8000";

// Моки пользователей для тестов
export const mockUsers = {
  testUser: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
    full_name: "Test User",
    role: "user",
  },
  adminUser: {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "admin@example.com",
    full_name: "Admin User",
    role: "admin",
  },
};

// Моки групп
export const mockGroups = [
  {
    id: "223e4567-e89b-12d3-a456-426614174000",
    name: "Math Basics",
    user_id: mockUsers.testUser.id,
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    name: "English Words",
    user_id: mockUsers.testUser.id,
  },
];

// Моки карточек
export const mockFlashcards = [
  {
    id: "323e4567-e89b-12d3-a456-426614174000",
    question: "What is 2+2?",
    answer: "4",
    user_id: mockUsers.testUser.id,
    group_id: mockGroups[0].id,
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174001",
    question: "What is the capital of France?",
    answer: "Paris",
    user_id: mockUsers.testUser.id,
    group_id: mockGroups[1].id,
  },
];

// Дефолтные хендлеры для MSW
export const handlers = [
  // Аутентификация
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.email === mockUsers.testUser.email) {
      return HttpResponse.json(
        { detail: "User already exists" },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      id: "999e4567-e89b-12d3-a456-426614174000",
      ...body,
      role: "user",
    });
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = new URLSearchParams(await request.text());
    const email = body.get("username");
    const password = body.get("password");

    if (email === mockUsers.testUser.email && password === "password123") {
      return HttpResponse.json(
        {
          access_token: "mock_access_token",
          token_type: "bearer",
        },
        {
          headers: {
            "Set-Cookie": "refresh_token=mock_refresh_token; HttpOnly",
          },
        },
      );
    }
    return HttpResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    return HttpResponse.json(mockUsers.testUser);
  }),

  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: "mock_new_access_token",
      token_type: "bearer",
    });
  }),

  // Группы
  http.get(`${API_BASE}/groups/`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    return HttpResponse.json(mockGroups);
  }),

  http.post(`${API_BASE}/groups/`, async ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: "999e4567-e89b-12d3-a456-426614174001",
      ...body,
      user_id: mockUsers.testUser.id,
    });
  }),

  http.delete(`${API_BASE}/groups/:id`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    return HttpResponse.json({ detail: "Group deleted" });
  }),

  // Карточки
  http.get(`${API_BASE}/flashcards/group/:groupId`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    return HttpResponse.json(mockFlashcards);
  }),

  http.post(`${API_BASE}/flashcards/`, async ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: "999e4567-e89b-12d3-a456-426614174002",
      ...body,
      user_id: mockUsers.testUser.id,
    });
  }),

  http.put(`${API_BASE}/flashcards/:id`, async ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: "mock_card_id",
      ...body,
      user_id: mockUsers.testUser.id,
    });
  }),

  http.delete(`${API_BASE}/flashcards/:id`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (!auth) {
      return HttpResponse.json(
        { detail: "Not authenticated" },
        { status: 403 },
      );
    }
    return HttpResponse.json({ detail: "Card deleted" });
  }),
];

// Настройка сервера MSW
export const server = setupServer(...handlers);

// Включаем перехват запросов до всех тестов
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Восстанавливаем хендлеры после каждого теста
afterEach(() => {
  server.resetHandlers();
});

// Очищаем после всех тестов
afterAll(() => {
  server.close();
});
