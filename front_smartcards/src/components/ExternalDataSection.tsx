/**
 * ExternalDataSection Component
 * Отображает случайных пользователей из Random User API на публичной странице
 *
 * Функциональность:
 * - Загружает случайных пользователей с русской локализацией
 * - Отображает их в виде галереи карточек
 * - Graceful degradation при ошибках (секция скрывается)
 */

import { useState, useEffect } from "react";
import { getRandomUsers } from "../services/externalApi";
import "../styles/external-data.css";

export function ExternalDataSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getRandomUsers(4);
        setUsers(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ошибка при загрузке данных",
        );
        // Graceful degradation - просто скрываем секцию при ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Graceful degradation - если данные недоступны, просто не показываем секцию
  if (error || !users || users.length === 0) {
    return null;
  }

  return (
    <section
      className="external-data-section"
      id="external-data"
      aria-label="Галерея пользователей SmartCards"
    >
      <div className="container">
        <h2 className="section-title">👥 Смотрите кто ещё учится</h2>
        <p className="section-subtitle">
          Присоединяйтесь к сообществу учащихся со всего мира
        </p>

        {loading ? (
          <div className="data-loading" role="status" aria-live="polite">
            <p>Загрузка галереи пользователей...</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user: any, idx: number) => (
              <div key={idx} className="user-card">
                <img
                  src={user.picture?.medium}
                  alt={`${user.name?.first} ${user.name?.last}`}
                  loading="lazy"
                  className="user-avatar"
                  width="80"
                  height="80"
                />
                <h3 className="user-name">
                  {`${user.name?.first} ${user.name?.last}`}
                </h3>
                <p className="user-location">
                  {user.location?.country || "Где-то в мире"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
