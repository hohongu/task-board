import { useEffect, useState } from "react";
import TaskItem from "./TaskItem.jsx";

const STORAGE_KEY = "task-board:tasks";

// タスクの状態。押下するたびに 通常 → グレー(done) → ボールド(bold) → 通常 と切り替わる
const STATUS_ORDER = ["normal", "done", "bold"];

// 3段組みの列（左から順に表示する）
const COLUMNS = ["A", "B", "C"];

// localStorageから読み込む（無い・壊れている場合は空配列）
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    // 旧形式のデータを補完する（done → status、column が無ければ A）
    return saved.map(({ done, ...task }) => ({
      ...task,
      status: STATUS_ORDER.includes(task.status)
        ? task.status
        : done
          ? "done"
          : "normal",
      column: COLUMNS.includes(task.column) ? task.column : "A",
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
  const [column, setColumn] = useState("A"); // 追加先の列
  const [dragId, setDragId] = useState(null); // ドラッグ中のタスクID
  const [overId, setOverId] = useState(null); // ドロップ先候補のタスクID

  const addTask = (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setTasks([
      ...tasks,
      { id: Date.now(), title: text, status: "normal", column },
    ]);
    setTitle("");
  };

  const toggleTask = (id) => {
    const next = (status) =>
      STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, status: next(t.status) } : t))
    );
  };

  // 項目の下の区切り線を 通常 / 太線 で切り替える
  const toggleLine = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, thick: !t.thick } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // ドラッグ中のタスクを targetId の位置に移動する（別の列なら列も移る）
  const moveTask = (fromId, targetId) => {
    if (fromId === targetId) return;
    const from = tasks.findIndex((t) => t.id === fromId);
    const to = tasks.findIndex((t) => t.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...tasks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, { ...moved, column: tasks[to].column });
    setTasks(next);
  };

  // ドラッグ中のタスクを列の末尾に移動する（空の列や列の余白へのドロップ用）
  const moveTaskToColumn = (fromId, targetColumn) => {
    const moved = tasks.find((t) => t.id === fromId);
    if (!moved) return;
    setTasks([
      ...tasks.filter((t) => t.id !== fromId),
      { ...moved, column: targetColumn },
    ]);
  };

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <main className="app">
      <h1>タスクボード</h1>

      <form className="add-form" onSubmit={addTask}>
        <div className="add-row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスクを入力"
          />
          <button type="submit">追加</button>
        </div>
        <div className="column-select" role="radiogroup" aria-label="追加先">
          <span>追加先:</span>
          {COLUMNS.map((col) => (
            <label key={col}>
              <input
                type="radio"
                name="column"
                value={col}
                checked={column === col}
                onChange={() => setColumn(col)}
              />
              {col}
            </label>
          ))}
        </div>
      </form>

      {tasks.length === 0 ? (
        <p className="empty">タスクがありません</p>
      ) : (
        <>
          <p className="count">
            完了 {doneCount} / 全体 {tasks.length}
          </p>
          <div className="columns">
            {COLUMNS.map((col) => (
              <section
                key={col}
                className="column"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId !== null) moveTaskToColumn(dragId, col);
                  endDrag();
                }}
              >
                <h2>{col}</h2>
                <ul className="task-list">
                  {tasks
                    .filter((task) => task.column === col)
                    .map((task) => (
                      <li
                        key={task.id}
                        draggable
                        className={
                          task.id === dragId
                            ? "dragging"
                            : task.id === overId
                              ? "drag-over"
                              : ""
                        }
                        onDragStart={() => setDragId(task.id)}
                        onDragOver={(e) => {
                          e.preventDefault(); // ドロップを許可する
                          if (dragId !== null) setOverId(task.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // 列側のドロップ処理を動かさない
                          if (dragId !== null) moveTask(dragId, task.id);
                          endDrag();
                        }}
                        onDragEnd={endDrag}
                      >
                        <TaskItem
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onToggleLine={toggleLine}
                        />
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default App;
