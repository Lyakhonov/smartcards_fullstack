import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";
import { useAuth } from "../AuthContext";

type User = {
  id: string;
  email: string;
  full_name?: string;
  role: "user" | "manager" | "admin";
};

export default function Users() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<User["role"]>("user");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<User[]>("/admin/users");

      const sorted = res.data.sort((a, b) =>
        a.email.toLowerCase().localeCompare(b.email.toLowerCase()),
      );

      setUsers(sorted);
    } finally {
      setLoading(false);
    }
  };

  // keep page within bounds when users or perPage change
  useEffect(() => {
    setPage((p) => {
      const filtered = filteredUsersMemo();
      const pages = Math.max(1, Math.ceil(filtered.length / perPage));
      return Math.min(p, pages);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, perPage]);

  // memoized filtered users helper
  const filteredUsersMemo = () => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    });
  };

  const saveRole = async (id: string) => {
    await api.put(`/admin/users/${id}/role`, {
      role: newRole,
    });

    setEditingId(null);
    load();
  };

  return (
    <>
      <Navbar />

      <div className="history-container">
        <h1>Пользователи</h1>

        {loading && <p>Загрузка...</p>}

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            placeholder="Поиск по имени или email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              width: 300,
            }}
          />

          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="history-list">
          {filteredUsersMemo()
            .slice((page - 1) * perPage, page * perPage)
            .map((u) => (
              <div key={u.id} className="history-item">
                <div className="history-info">
                  <div>
                    <b>{u.full_name || "Без имени"}</b>
                    <div>{u.email}</div>

                    {editingId === u.id ? (
                      <>
                        <select
                          value={newRole}
                          onChange={(e) =>
                            setNewRole(e.target.value as User["role"])
                          }
                          style={{ marginTop: 8 }}
                        >
                          <option value="user">user</option>
                          <option value="manager">manager</option>
                          <option value="admin">admin</option>
                        </select>

                        <div className="card-actions">
                          <button
                            className="btn save"
                            onClick={() => saveRole(u.id)}
                          >
                            Сохранить
                          </button>

                          <button
                            className="btn cancel"
                            onClick={() => setEditingId(null)}
                          >
                            Отмена
                          </button>
                        </div>
                      </>
                    ) : (
                      <div>
                        Роль: <b>{u.role}</b>
                        {user?.role === "admin" && (
                          <div className="card-actions">
                            <button
                              onClick={() => {
                                setEditingId(u.id);
                                setNewRole(u.role);
                              }}
                            >
                              ✏️ Изменить
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {!loading && filteredUsersMemo().length === 0 && (
            <p>Нет пользователей</p>
          )}
        </div>

        <div className="pagination-controls">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>
            Стр. {page} /{" "}
            {Math.max(1, Math.ceil(filteredUsersMemo().length / perPage))}
          </span>

          <button
            disabled={page >= Math.ceil(filteredUsersMemo().length / perPage)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
