// タスク1件分の表示（項目の下の区切り線を含む）
function TaskItem({ task, onToggle, onDelete, onToggleLine }) {
  return (
    <>
      <div className={`task ${task.status}`}>
        <label>
          <input
            type="checkbox"
            checked={task.status === "done"}
            onChange={() => onToggle(task.id)}
          />
          <span>{task.title}</span>
        </label>
        <button
          type="button"
          className="delete"
          onClick={() => onDelete(task.id)}
          aria-label={`「${task.title}」を削除`}
        >
          削除
        </button>
      </div>
      {/* 区切り線。クリックで通常 / 太線を切り替える */}
      <button
        type="button"
        className={task.thick ? "divider thick" : "divider"}
        onClick={() => onToggleLine(task.id)}
        aria-label={`「${task.title}」の下の線を切り替え`}
      />
    </>
  );
}

export default TaskItem;
