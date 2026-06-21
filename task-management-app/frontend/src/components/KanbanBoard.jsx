import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar, Pencil, Trash2 } from "lucide-react";

const COLS = [
  { id:"pending",     label:"Pending",     color:"var(--c-pending)",  countBg:"#fef3c7", countColor:"#92400e" },
  { id:"in_progress", label:"In Progress", color:"var(--c-progress)", countBg:"#dbeafe", countColor:"#1d4ed8" },
  { id:"completed",   label:"Completed",   color:"var(--c-done)",     countBg:"#d1fae5", countColor:"#065f46" },
];

function isOverdue(task) {
  if (!task.due_date || task.status === "completed") return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

export default function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }) {
  const byStatus = (s) => tasks.filter((t) => t.status === s);

  const onDragEnd = ({ destination, draggableId }) => {
    if (!destination) return;
    const task = tasks.find((t) => String(t.id) === draggableId);
    if (task && task.status !== destination.droppableId) {
      onStatusChange(task.id, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {COLS.map((col) => {
          const colTasks = byStatus(col.id);
          return (
            <div className="kanban-col" key={col.id}>
              <div className="kanban-col-header">
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:col.color, display:"inline-block" }} />
                  <span className="kanban-col-title" style={{ color:col.color }}>{col.label}</span>
                </div>
                <div className="kanban-col-count"
                  style={{ background:col.countBg, color:col.countColor }}>
                  {colTasks.length}
                </div>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-col-body"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ background: snapshot.isDraggingOver ? "rgba(108,71,255,.04)" : undefined }}
                  >
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"20px 0", border:"1.5px dashed var(--border)", borderRadius:"var(--radius-sm)" }}>
                        Drop here
                      </div>
                    )}

                    {colTasks.map((task, i) => {
                      const overdue = isOverdue(task);
                      return (
                        <Draggable key={task.id} draggableId={String(task.id)} index={i}>
                          {(prov, snap) => (
                            <div
                              className={`kanban-card${snap.isDragging ? " dragging" : ""}`}
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                            >
                              {/* Priority accent top bar */}
                              <div style={{
                                height:3, borderRadius:"99px 99px 0 0",
                                background: task.priority==="high" ? "var(--c-high)" : task.priority==="low" ? "var(--c-low)" : "var(--c-medium)",
                                marginTop:-14, marginLeft:-16, marginRight:-16, marginBottom:12,
                              }} />

                              <div className="kanban-card-title">{task.title}</div>
                              {task.description && (
                                <div className="kanban-card-desc">{task.description}</div>
                              )}

                              <div className="kanban-card-footer">
                                <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
                                  <span className={`badge badge-${task.priority || "medium"}`} style={{ fontSize:11 }}>
                                    {task.priority}
                                  </span>
                                  {task.due_date && (
                                    <span className={`badge ${overdue ? "badge-overdue" : "badge-cat"}`}
                                      style={{ fontSize:11 }}>
                                      <Calendar size={9} /> {task.due_date}
                                    </span>
                                  )}
                                </div>
                                <div className="kanban-card-actions">
                                  <button className="btn-icon" style={{ padding:5 }} onClick={() => onEdit(task)}>
                                    <Pencil size={13} />
                                  </button>
                                  <button className="btn-icon" style={{ padding:5, color:"var(--c-overdue)" }}
                                    onClick={() => onDelete(task.id)}>
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
