import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

export default function Loading() {
  const nav = useNavigate();
  const { state } = useLocation() as {
    state?: { file?: File };
  };

  // Предотвратить двойной запрос при React.StrictMode
  const uploadStarted = useRef(false);

  useEffect(() => {
    if (!state?.file) {
      nav("/");
      return;
    }

    if (uploadStarted.current) {
      return; // Уже начали загрузку, не делаем это снова
    }
    uploadStarted.current = true;

    const upload = async () => {
      try {
        if (!state.file) {
          // Можно показать сообщение пользователю
          alert("Пожалуйста, выберите файл");
          return;
        }

        const form = new FormData();
        form.append("file", state.file);

        const res = await api.post("/groups/upload", form);

        nav(`/group/${res.data.group_id}`);
      } catch {
        alert("Ошибка загрузки файла");
        nav("/");
      }
    };

    upload();
  }, [state, nav]);

  return (
    <>
      <Navbar />

      <div className="loading-page">
        <div className="loading-card">
          <div className="loading-logo">⚡</div>

          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>

          <h3>Анализируем ваши записи...</h3>
          <p>Это может занять время</p>
        </div>
      </div>
    </>
  );
}
