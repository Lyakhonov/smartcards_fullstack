import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../AuthContext";
import { Group } from "../types";

type QueryParams = {
  q?: string;
  sort_by?: string;
  order?: string;
  page?: number;
  per_page?: number;
};

export default function History() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, perPage, sortBy, order]);

  const loadGroups = async () => {
    const params: QueryParams = {
      q: query || undefined,
      sort_by: sortBy,
      order: order,
      page,
      per_page: perPage,
    };

    const res = await api.get<any>("/groups", { params });

    // Accept a few common paginated response shapes
    let items: Group[] = [];
    let total: number | null = null;

    if (Array.isArray(res.data)) {
      items = res.data;
    } else if (res.data) {
      if (Array.isArray(res.data.items)) {
        items = res.data.items;
        total =
          res.data.total ?? res.data.count ?? res.data.meta?.total ?? null;
      } else if (Array.isArray(res.data.results)) {
        items = res.data.results;
        total =
          res.data.count ?? res.data.total ?? res.data.meta?.total ?? null;
      } else if (Array.isArray(res.data.data)) {
        items = res.data.data;
        total = res.data.total ?? res.data.count ?? null;
      }
    }

    // header fallback
    const headerTotal =
      Number(res.headers?.["x-total-count"]) ||
      Number(res.headers?.["x-total"]) ||
      null;
    if (!total && headerTotal) total = headerTotal;

    setGroups(items);
    setTotalItems(total);
  };

  const deleteGroup = async (id: number) => {
    if (!window.confirm("Удалить группу?")) return;
    await api.delete(`/groups/${id}`);
    loadGroups();
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  // compute total pages: prefer server-provided totalItems; otherwise estimate from loaded items
  const totalPages =
    totalItems !== null
      ? Math.max(1, Math.ceil(totalItems / perPage))
      : Math.max(
          1,
          Math.ceil(((page - 1) * perPage + groups.length) / perPage),
        );

  return (
    <>
      <Navbar />

      <div className="history-container">
        <h1>История загрузок</h1>
        <p className="history-subtitle">Ваши предыдущие загрузки</p>

        <div className="history-filters">
          <input
            placeholder="Поиск по имени файла"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Дата</option>
            <option value="filename">Имя</option>
            <option value="flashcards_count">Кол-во карточек</option>
          </select>

          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">По убыванию</option>
            <option value="asc">По возрастанию</option>
          </select>

          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="history-list">
          {groups.map((g) => (
            <div key={g.id} className="history-item">
              <div
                className="history-info"
                onClick={() => nav(`/group/${g.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="file-icon">📄</div>

                <div>
                  <div className="file-name">{g.filename}</div>

                  <div className="file-meta">{g.flashcards_count} карточек</div>

                  <div className="file-date">{formatDate(g.created_at)}</div>
                </div>
              </div>

              <div className="history-actions">
                <button
                  className="view-btn"
                  onClick={() => nav(`/group/${g.id}`)}
                >
                  Открыть
                </button>

                {g.file_url && (
                  <a
                    className="download-btn"
                    href={g.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Скачать
                  </a>
                )}

                {(user?.role === "manager" || user?.role === "admin") && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteGroup(g.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pagination-controls">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Стр. {page} / {totalPages}
          </span>
          <button
            disabled={
              totalItems !== null ? page >= totalPages : groups.length < perPage
            }
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
