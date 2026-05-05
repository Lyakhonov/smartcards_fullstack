import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useSEOHead, useJsonLd } from "../seo/head";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { login } = useAuth();

  // SEO: Установка мета-тегов
  useSEOHead({
    title: "Вход - SmartCards",
    description:
      "Войдите в ваш аккаунт SmartCards для доступа к вашим карточкам и истории.",
  });

  // SEO: JSON-LD Schema для Login Page
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Вход в SmartCards",
    description: "Страница входа в учетную запись SmartCards",
  });

  const submit = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await api.post("/auth/login", formData);
      login(res.data.access_token);
      nav("/");
    } catch (err: any) {
      console.error("Login error:", err);
      alert(
        err?.response?.data?.detail ||
          "Ошибка входа. Проверьте email и пароль.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="logo" aria-hidden="true">
        ⚡
      </div>

      <h1 className="title">SmartCards</h1>
      <p className="subtitle">Рады снова видеть вас</p>

      <div className="auth-card">
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          aria-label="Email адрес"
        />

        <label htmlFor="password-input">Пароль</label>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Пароль"
        />

        <button onClick={submit} disabled={loading} type="submit">
          {loading ? "Загрузка..." : "Войти"}
        </button>

        <div className="register-text">
          Нет аккаунта?{" "}
          <span
            onClick={() => nav("/register")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") nav("/register");
            }}
          >
            Регистрация
          </span>
        </div>
      </div>
    </div>
  );
}
