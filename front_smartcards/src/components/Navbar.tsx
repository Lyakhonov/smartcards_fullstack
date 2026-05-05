import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login"); // 👈 ВАЖНО
  };

  return (
    <header className="navbar">
      {/* Левая часть */}
      <div
        className="nav-left"
        onClick={() => nav("/")}
        style={{ cursor: "pointer" }}
      >
        <div className="nav-logo">⚡</div>
        <span className="nav-title">SmartCards</span>
      </div>

      {/* Ссылки */}
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Главная
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          История
        </NavLink>

        {(user?.role === "manager" || user?.role === "admin") && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Пользователи
          </NavLink>
        )}
      </div>

      {/* Logout */}
      <div className="nav-logout">
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
}
