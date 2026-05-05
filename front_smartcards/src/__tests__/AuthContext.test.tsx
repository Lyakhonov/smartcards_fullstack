/**
 * Тесты для AuthContext
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";

// Мокируем axios перед импортом компонента
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { email: "test@example.com" } })),
    post: vi.fn(() => Promise.resolve({})),
  },
}));

// Компонент-обертка для тестирования hooks
const TestComponent = () => {
  const { token, user, isAuth, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="token">{token || "no-token"}</div>
      <div data-testid="user">{user?.email || "not-logged-in"}</div>
      <div data-testid="isAuth">
        {isAuth ? "authenticated" : "not-authenticated"}
      </div>
      <button onClick={() => login("test-token")}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("должен быть начальный state без токена", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("isAuth")).toHaveTextContent("not-authenticated");
  });

  it("должен сохранить токен в localStorage при login", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginBtn = screen.getByText("Login");
    await user.click(loginBtn);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token");
    });
    expect(screen.getByTestId("isAuth")).toHaveTextContent("authenticated");
  });

  it("должен удалить токен из localStorage при logout", async () => {
    const user = userEvent.setup();

    localStorage.setItem("token", "existing-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const logoutBtn = screen.getByText("Logout");
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
    });
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
  });

  it("должен восстановить токен из localStorage при загрузке", () => {
    localStorage.setItem("token", "persisted-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("isAuth")).toHaveTextContent("authenticated");
  });
});
