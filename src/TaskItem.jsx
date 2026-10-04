// タスク1件分の表示
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={task.done ? "task done" : "task"}>
      <label>
        <input
          type="checkbox"
          checked={task.done}
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
  );
}

export default TaskItem;
