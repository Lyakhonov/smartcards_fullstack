import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useSEOHead } from "./seo/head";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Group from "./pages/Group";
import History from "./pages/History";
import Loading from "./pages/Loading";
import { useAuth } from "./AuthContext";
import Users from "./pages/User";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuth } = useAuth();
  return isAuth ? <>{children}</> : <Navigate to="/login" />;
}

function RoleRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) {
  const { user, isAuth } = useAuth();

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.role || "")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  // Установка мета-тегов для приватных страниц (noindex)
  try {
    useSEOHead({ noindex: true });
  } catch (e) {
    console.error("Error in useSEOHead:", e);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/loading" element={<Loading />} />
      <Route
        path="/users"
        element={
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <Users />
          </RoleRoute>
        }
      />
      <Route
        path="/group/:id"
        element={
          <PrivateRoute>
            <Group />
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <History />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
