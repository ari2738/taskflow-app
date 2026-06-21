import React from "react";
import { Calendar, Tag, Pencil, Trash2, AlertTriangle } from "lucide-react";

const STATUS_LABEL = { pending:"Pending", in_progress:"In Progress", completed:"Completed" };

function isOverdue(task) {
  if (!task.due_date || task.status === "completed") return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  return (
    <div className="task-card">
      {/* Priority bar */}
      <div className={`task-card-priority-bar priority-bar-${task.priority || "medium"}`} />

      {/* Content */}
      <div className="task-card-left">
        <div className="task-card-title">{task.title}</div>
        {task.description && (
          <div className="task-card-desc">{task.description}</div>
        )}
        <div className="task-card-meta">
          {task.due_date && (
            <span className="task-card-meta-item" style={{ color: overdue ? "var(--c-overdue)" : undefined }}>
              {overdue && <AlertTriangle size={11} />}
              <Calendar size={11} />
              {overdue ? "Overdue · " : ""}{task.due_date}
            </span>
          )}
          {task.category && (
            <span className="task-card-meta-item">
              <Tag size={11} /> {task.category}
            </span>
          )}
        </div>
      </div>

      {/* Right side — badges + actions */}
      <div className="task-card-right">
        <span className={`badge badge-${task.priority || "medium"}`}>
          {task.priority || "medium"}
        </span>
        <span className={`badge badge-${overdue ? "overdue" : task.status}`}>
          {overdue ? "Overdue" : STATUS_LABEL[task.status]}
        </span>
        <button className="btn-icon" title="Edit" onClick={() => onEdit(task)}>
          <Pencil size={15} />
        </button>
        <button className="btn-icon" title="Delete"
          style={{ color:"var(--c-overdue)" }} onClick={() => onDelete(task.id)}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
