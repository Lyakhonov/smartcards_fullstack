import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import { Flashcard } from "../types";

export default function Group() {
  const { id } = useParams<{ id: string }>();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Flashcard[]>(`/flashcards/group/${id}`);
      setCards(res.data);
    } catch {
      alert("Ошибка загрузки карточек");
    } finally {
      setLoading(false);
    }
  };

  const del = async (cid: number) => {
    if (!confirm("Удалить карточку?")) return;
    await api.delete(`/flashcards/${cid}`);
    load();
  };

  const save = async (c: Flashcard) => {
    if (!c.question || !c.answer) return alert("Заполни вопрос и ответ");

    if (c.id) {
      await api.put(`/flashcards/${c.id}`, c);
    } else {
      await api.post(`/flashcards?group_id=${id}`, c);
    }

    setEditingIndex(null);
    load();
  };

  const addCard = () => {
    setCards((p) => [{ question: "", answer: "" }, ...p]);
    setEditingIndex(0);
  };

  const change = (i: number, field: "question" | "answer", val: string) => {
    const copy = [...cards];
    copy[i] = { ...copy[i], [field]: val };
    setCards(copy);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div className="group-loading">Загрузка...</div>;

  return (
    <>
      <Navbar />

      <div className="group-container">
        <div className="group-header">
          <div>
            <h1>Ваши smartcards</h1>
            <p>Просматривайте свои smartcards и управляйте ими</p>
          </div>

          <button className="add-card-btn" onClick={addCard}>
            + Добавить карточку
          </button>
        </div>

        <div className="cards-grid">
          {cards.map((c, idx) => {
            const editing = idx === editingIndex;

            return (
              <div className="card-box" key={c.id ?? idx}>
                {editing ? (
                  <>
                    <input
                      value={c.question}
                      onChange={(e) => change(idx, "question", e.target.value)}
                      placeholder="Question"
                    />

                    <textarea
                      value={c.answer}
                      onChange={(e) => change(idx, "answer", e.target.value)}
                      placeholder="Answer"
                    />

                    <div className="card-actions">
                      <button className="btn save" onClick={() => save(c)}>
                        Сохранить
                      </button>

                      <button
                        className="btn cancel"
                        onClick={() => setEditingIndex(null)}
                      >
                        Отмена
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{c.question}</h3>
                    <p>{c.answer}</p>

                    <div className="card-actions">
                      <button onClick={() => setEditingIndex(idx)}>
                        ✏️ Изменить
                      </button>

                      {c.id !== undefined && (
                        <button onClick={() => del(c.id)}>🗑 Удалить</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
