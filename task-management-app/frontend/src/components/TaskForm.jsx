import React, { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api.js";

const CATEGORIES = ["General","College","Personal","Internship","Work","Health","Finance"];

export default function TaskForm({ onSubmit, editingTask, onClose }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [status,      setStatus]      = useState("pending");
  const [priority,    setPriority]    = useState("medium");
  const [category,    setCategory]    = useState("General");
  const [dueDate,     setDueDate]     = useState("");
  const [aiLoading,   setAiLoading]   = useState(false);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setStatus(editingTask.status);
      setPriority(editingTask.priority || "medium");
      setCategory(editingTask.category || "General");
      setDueDate(editingTask.due_date || "");
    } else {
      setTitle(""); setDescription(""); setStatus("pending");
      setPriority("medium"); setCategory("General"); setDueDate("");
    }
  }, [editingTask]);

  const handleAI = async () => {
    if (!title.trim()) { toast.error("Enter a title first"); return; }
    setAiLoading(true);
    try {
      const res = await api.post("/ai/suggest", { title });
      if (res.data.description) setDescription(res.data.description);
      if (res.data.due_date)    setDueDate(res.data.due_date);
      toast.success("AI suggestion applied!");
    } catch {
      toast.error("AI unavailable — check your API key in backend/.env");
    } finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ title, description, status, priority, category, due_date: dueDate || null });
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div className="field">
              <label>Task Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?" required autoFocus />
            </div>

            {/* Description + AI */}
            <div className="field">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <label style={{ margin:0 }}>Description</label>
                <button type="button" className="ai-btn-inline"
                  onClick={handleAI} disabled={aiLoading}>
                  {aiLoading
                    ? <><span className="spinner" style={{ width:12,height:12 }} /> Thinking…</>
                    : <><Sparkles size={12} /> AI Suggest</>}
                </button>
              </div>
              <textarea rows={3} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task, or let AI fill this in…" />
            </div>

            {/* Status + Priority */}
            <div className="form-row">
              <div className="field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            {/* Category + Due Date */}
            <div className="form-row">
              <div className="field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button type="submit" className="btn btn-primary"
                style={{ flex:1, justifyContent:"center" }} disabled={saving}>
                {saving
                  ? <><span className="spinner" /> Saving…</>
                  : editingTask ? "Update Task" : "Create Task"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
