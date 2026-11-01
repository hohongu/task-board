import { useEffect, useState } from "react";
import TaskItem from "./TaskItem.jsx";

const STORAGE_KEY = "task-board:tasks";

// タスクの状態。押下するたびに
// 黒の普通(normal) → 黒の太字(bold) → 青の太字(blue) → 赤の太字(red) → 取り消し線+グレー(done) → 黒の普通 と切り替わる
const STATUS_ORDER = ["normal", "bold", "blue", "red", "done"];

// 4段組みの列（左から順に表示する）
const COLUMNS = ["A", "B", "C", "D"];
const PAGES = [1, 2, 3];
const PAGE_LABELS = ["①", "②", "③"];

// localStorageから読み込む（無い・壊れている場合は空配列）
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    // 旧形式のデータを補完する（done → status、column/page が無ければ既定値）
    return saved.map(({ done, ...task }) => ({
      ...task,
      status: STATUS_ORDER.includes(task.status)
        ? task.status
        : done
          ? "done"
          : "normal",
      column: COLUMNS.includes(task.column) ? task.column : "A",
      page: PAGES.includes(task.page) ? task.page : 1,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [dragId, setDragId] = useState(null); // ドラッグ中のタスクID
  const [overId, setOverId] = useState(null); // ドロップ先候補のタスクID
  const [overPosition, setOverPosition] = useState(null); // 挿入位置
  const [overColumn, setOverColumn] = useState(null); // 列の末尾へのドロップ候補

  const addTask = (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: text,
        status: "normal",
        column: "A",
        page: currentPage,
      },
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

  // ドラッグ中のタスクを targetId の前後に移動する（別の列なら列も移る）
  const moveTask = (fromId, targetId, position) => {
    if (fromId === targetId) return;
    const from = tasks.findIndex((t) => t.id === fromId);
    const to = tasks.findIndex((t) => t.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...tasks];
    const [moved] = next.splice(from, 1);
    const targetIndex = next.findIndex((t) => t.id === targetId);
    const insertIndex = targetIndex + (position === "after" ? 1 : 0);
    next.splice(insertIndex, 0, { ...moved, column: tasks[to].column });
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
    setOverPosition(null);
    setOverColumn(null);
  };

  const pageTasks = tasks.filter((task) => task.page === currentPage);

  return (
    <main className="app">
      <header className="app-header">
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
        <nav className="page-selector" aria-label="タスクページ">
          {PAGES.map((page, index) => (
            <button
              key={page}
              type="button"
              className={
                currentPage === page
                  ? "page-button active"
                  : "page-button"
              }
              aria-label={`${page}ページ`}
              aria-pressed={currentPage === page}
              onClick={() => setCurrentPage(page)}
            >
              {PAGE_LABELS[index]}
            </button>
          ))}
        </nav>
      </header>

      {pageTasks.length === 0 ? (
        <p className="empty">タスクがありません</p>
      ) : (
        <>
          <div className="columns">
            {COLUMNS.map((col) => {
              const columnTasks = pageTasks.filter(
                (task) => task.column === col
              );

              return (
                <section
                  key={col}
                  className="column"
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragId !== null && !e.target.closest("li")) {
                      setOverId(null);
                      setOverColumn(col);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId !== null) moveTaskToColumn(dragId, col);
                    endDrag();
                  }}
                >
                  <ul className="task-list">
                    {columnTasks.map((task) => (
                      <li
                        key={task.id}
                        draggable
                        className={
                          task.id === dragId
                            ? "dragging"
                            : task.id === overId
                              ? `drag-over ${overPosition}`
                              : ""
                        }
                        onDragStart={() => setDragId(task.id)}
                        onDragOver={(e) => {
                          e.preventDefault(); // ドロップを許可する
                          if (dragId !== null) {
                            const bounds = e.currentTarget.getBoundingClientRect();
                            setOverId(task.id);
                            setOverPosition(
                              e.clientY < bounds.top + bounds.height / 2
                                ? "before"
                                : "after"
                            );
                            setOverColumn(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // 列側のドロップ処理を動かさない
                          if (dragId !== null) {
                            moveTask(dragId, task.id, overPosition);
                          }
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
                    {dragId !== null && (
                      <li
                        className={
                          overColumn === col
                            ? "drop-zone active"
                            : "drop-zone"
                        }
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOverId(null);
                          setOverColumn(col);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          moveTaskToColumn(dragId, col);
                          endDrag();
                        }}
                      />
                    )}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

export default App;
