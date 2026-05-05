import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "./api";

type User = {
  id: string; // UUID строка
  email: string;
  full_name?: string;
  role: "user" | "manager" | "admin";
};

type AuthCtx = {
  token: string | null;
  user: User | null;
  isAuth: boolean;
  login: (t: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [user, setUser] = useState<User | null>(null);

  // Загружаем пользователя при наличии токена
  useEffect(() => {
    if (!token) return;

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => logout());
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    // try to inform backend; ignore errors
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuth: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
