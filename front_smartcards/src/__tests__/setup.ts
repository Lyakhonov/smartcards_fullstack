/**
 * Настройка для тестов: моки, глобальные переменные и т.д.
 */
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Очистка DOM после каждого теста
afterEach(() => {
  cleanup();
});

// Мок для localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Подавляем ошибки консоли во время тестов (опционально)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
