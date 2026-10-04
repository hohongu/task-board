import { useEffect, useState } from "react";
import TaskItem from "./TaskItem.jsx";

const STORAGE_KEY = "task-board:tasks";

// localStorageから読み込む（無い・壊れている場合は空配列）
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
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
    setTasks([...tasks, { id: Date.now(), title: text, done: false }]);
    setTitle("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const doneCount = tasks.filter((t) => t.done).length;

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
