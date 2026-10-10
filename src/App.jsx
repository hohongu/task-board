import { useEffect, useState } from "react";
import TaskItem from "./TaskItem.jsx";

const STORAGE_KEY = "task-board:tasks";

// タスクの状態。押下するたびに 通常 → グレー(done) → ボールド(bold) → 通常 と切り替わる
const STATUS_ORDER = ["normal", "done", "bold"];

// localStorageから読み込む（無い・壊れている場合は空配列）
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    // 旧形式（done: true/false）のデータを status に変換する
    return saved.map(({ done, ...task }) => ({
      ...task,
      status: STATUS_ORDER.includes(task.status)
        ? task.status
        : done
          ? "done"
          : "normal",
    }));
  } catch {
    return [];
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks);

  // tasksが変わるたびに保存する
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // 保存できない環境（容量超過・プライベートモード等）では無視する
    }
  }, [tasks]);
  const [title, setTitle] = useState("");

  const addTask = (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setTasks([...tasks, { id: Date.now(), title: text, status: "normal" }]);
    setTitle("");
  };

  const toggleTask = (id) => {
    const next = (status) =>
      STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, status: next(t.status) } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <main className="app">
      <h1>タスクボード</h1>

      <form className="add-form" onSubmit={addTask}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいタスクを入力"
        />
        <button type="submit">追加</button>
      </form>

      {tasks.length === 0 ? (
        <p className="empty">タスクがありません</p>
      ) : (
        <>
          <p className="count">
            完了 {doneCount} / 全体 {tasks.length}
          </p>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default App;
