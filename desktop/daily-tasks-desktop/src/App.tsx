import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import type { Task } from "./types";

interface ToastState {
  id: number;
  message: string;
}

let toastId = 0;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  const refresh = useCallback(async () => {
    const list = await window.tasksApi.listTasks();
    setTasks(list);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoaded(true));
  }, [refresh]);

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;
    await window.tasksApi.createTask(text);
    setNewTaskText("");
    await refresh();
    showToast("Задача добавлена");
  };

  const startEditing = (id: number, currentText: string) => {
    setEditingId(id);
    setEditTaskText(currentText);
  };

  const handleUpdateTask = async (id: number) => {
    const text = editTaskText.trim();
    if (!text) {
      setEditingId(null);
      return;
    }
    const task = tasks.find((t) => t.id === id);
    if (task && task.text === text) {
      setEditingId(null);
      return;
    }
    await window.tasksApi.updateTask(id, text);
    setEditingId(null);
    await refresh();
  };

  const handleDeleteTask = async (id: number) => {
    await window.tasksApi.deleteTask(id);
    await refresh();
    showToast("Задача удалена");
  };

  return (
    <div className="app">
      <div className="app-inner">
        <header>
          <h1 className="app-title">Дневник задач</h1>
          <p className="app-subtitle">Что нужно сделать сегодня?</p>
        </header>

        <main>
          <form className="new-task-form" onSubmit={handleCreateTask}>
            <span className="new-task-icon">+</span>
            <input
              ref={inputRef}
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Новая запись…"
              className="new-task-input"
            />
          </form>

          {!loaded ? null : tasks.length === 0 ? (
            <div className="empty-state">
              Здесь пока пусто. Напишите свою первую задачу.
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-row">
                  <span className="task-dot" />
                  {editingId === task.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTaskText}
                      onChange={(e) => setEditTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateTask(task.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => handleUpdateTask(task.id)}
                      className="task-edit-input"
                    />
                  ) : (
                    <span
                      className="task-text"
                      onClick={() => startEditing(task.id, task.text)}
                    >
                      {task.text}
                    </span>
                  )}
                  {editingId !== task.id && (
                    <span className="task-actions">
                      <button
                        className="icon-button"
                        aria-label="Редактировать"
                        onClick={() => startEditing(task.id, task.text)}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button destructive"
                        aria-label="Удалить"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <div>
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
