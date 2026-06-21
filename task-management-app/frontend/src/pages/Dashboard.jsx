import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare, LayoutDashboard, ListTodo, Moon, Sun,
  Plus, Search, LogOut, Kanban, List,
  ClipboardList, Clock, CheckCircle2, AlertTriangle, Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api.js";
import { useTheme } from "../ThemeContext.jsx";
import TaskCard    from "../components/TaskCard.jsx";
import TaskForm    from "../components/TaskForm.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import AIChatbot   from "../components/AIChatbot.jsx";

const PER_PAGE = 10;

const STAT_CONFIG = [
  { key:"total",       label:"Total Tasks",  Icon:Layers,        bg:"#ede9ff", color:"#6c47ff" },
  { key:"pending",     label:"Pending",      Icon:Clock,         bg:"#fef3c7", color:"#d97706" },
  { key:"in_progress", label:"In Progress",  Icon:ListTodo,      bg:"#dbeafe", color:"#2563eb" },
  { key:"completed",   label:"Completed",    Icon:CheckCircle2,  bg:"#d1fae5", color:"#059669" },
  { key:"overdue",     label:"Overdue",      Icon:AlertTriangle, bg:"#fee2e2", color:"#dc2626" },
];

const CATEGORIES = ["General","College","Personal","Internship","Work","Health","Finance"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { dark, toggle: toggleTheme } = useTheme();

  const [tasks,    setTasks]    = useState([]);
  const [stats,    setStats]    = useState({ total:0, pending:0, in_progress:0, completed:0, overdue:0 });
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);

  const [view,            setView]            = useState("list");
  const [showForm,        setShowForm]        = useState(false);
  const [editingTask,     setEditingTask]     = useState(null);
  const [search,          setSearch]          = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [filterPriority,  setFilterPriority]  = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");

  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  // ── Data loaders ─────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try { const r = await api.get("/tasks/stats"); setStats(r.data); } catch {}
  }, []);

  const loadTasks = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, per_page: PER_PAGE };
      if (search)         params.search   = search;
      if (filterStatus)   params.status   = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;
      const r = await api.get("/tasks", { params });
      setTasks(r.data.tasks);
      setTotal(r.data.total);
    } catch { toast.error("Could not load tasks"); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterPriority, filterCategory]);

  // Initial load
  useEffect(() => { loadTasks(1); loadStats(); }, []);

  // Re-fetch on filter/search/page change
  useEffect(() => { loadTasks(page); }, [page]);

  useEffect(() => {
    setPage(1);
    loadTasks(1);
    loadStats();
  }, [search, filterStatus, filterPriority, filterCategory]);

  // ── CRUD ─────────────────────────────────────────────────────
  const handleSubmit = async (data) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data);
        toast.success("Task updated!");
      } else {
        await api.post("/tasks", data);
        toast.success("Task created!");
      }
      setShowForm(false); setEditingTask(null);
      loadTasks(page); loadStats();
    } catch { toast.error("Could not save task"); }
  };

  const handleEdit = (task) => { setEditingTask(task); setShowForm(true); };

  const handleDelete = (id) => {
    toast((t) => (
      <span style={{ display:"flex", alignItems:"center", gap:12, fontSize:14 }}>
        <span>Delete this task?</span>
        <button
          style={{ background:"#ef4444", color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontWeight:700, fontSize:13 }}
          onClick={async () => {
            toast.dismiss(t.id);
            try { await api.delete(`/tasks/${id}`); toast.success("Deleted"); loadTasks(page); loadStats(); }
            catch { toast.error("Could not delete"); }
          }}>Yes</button>
        <button
          style={{ background:"#f3f4f6", color:"#374151", border:"none", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontWeight:700, fontSize:13 }}
          onClick={() => toast.dismiss(t.id)}>No</button>
      </span>
    ), { duration:6000 });
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await api.put(`/tasks/${id}`, { status: newStatus }); loadTasks(page); loadStats(); }
    catch { toast.error("Could not update status"); }
  };

  const openNew  = () => { setEditingTask(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingTask(null); };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><CheckSquare size={18} /></div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Menu</div>
          <button className="nav-item active">
            <LayoutDashboard size={17} /> Dashboard
          </button>
          <button className="nav-item" onClick={openNew}>
            <Plus size={17} /> New Task
          </button>
        </div>

        <div className="sidebar-section" style={{ marginTop:8 }}>
          <div className="sidebar-section-label">Filters</div>
          {["pending","in_progress","completed"].map((s) => {
            const labels = { pending:"Pending", in_progress:"In Progress", completed:"Completed" };
            const dots   = { pending:"var(--c-pending)", in_progress:"var(--c-progress)", completed:"var(--c-done)" };
            return (
              <button key={s}
                className={`nav-item${filterStatus === s ? " active" : ""}`}
                onClick={() => setFilterStatus(filterStatus === s ? "" : s)}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:dots[s], flexShrink:0 }} />
                {labels[s]}
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() ?? "U"}</div>
            <div className="user-info">
              <div className="user-name">{user?.name ?? "User"}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="nav-item" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">Good day, {user?.name?.split(" ")[0] ?? "there"} 👋</span>
            <span className="topbar-sub">{today}</span>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleTheme} title={dark ? "Light mode" : "Dark mode"}>
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="btn btn-primary" onClick={openNew} style={{ gap:6 }}>
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        <div className="page-body">

          {/* Stats bar */}
          <div className="stats-bar">
            {STAT_CONFIG.map(({ key, label, Icon, bg, color }) => (
              <div className="stat-card" key={key}
                style={{ "--stat-bg":bg, "--stat-color":color }}>
                <div className="stat-card-icon-wrap">
                  <Icon size={20} color={color} />
                </div>
                <div className="stat-card-value">{stats[key]}</div>
                <div className="stat-card-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input placeholder="Search tasks…" value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="filter-pill" value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select className="filter-pill" value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select className="filter-pill" value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="view-toggle">
              <button className={`view-btn${view === "list" ? " active" : ""}`}
                onClick={() => setView("list")}>
                <List size={14} /> List
              </button>
              <button className={`view-btn${view === "kanban" ? " active" : ""}`}
                onClick={() => setView("kanban")}>
                <Kanban size={14} /> Kanban
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="empty-state">
              <span className="spinner spinner-accent" style={{ width:36, height:36, borderWidth:3 }} />
              <p style={{ marginTop:8 }}>Loading tasks…</p>
            </div>

          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ClipboardList size={38} />
              </div>
              <h3>No tasks found</h3>
              <p>
                {search || filterStatus || filterPriority || filterCategory
                  ? "No tasks match your filters. Try adjusting the search or filters above."
                  : "You don't have any tasks yet. Create your first task to get started!"}
              </p>
              {!search && !filterStatus && !filterPriority && !filterCategory && (
                <button className="btn btn-primary" onClick={openNew}>
                  <Plus size={15} /> Create First Task
                </button>
              )}
            </div>

          ) : view === "kanban" ? (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <>
              <div className="task-list">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p}
                      className={`page-btn${p === page ? " active" : ""}`}
                      onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="page-btn" disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Task form modal */}
      {showForm && (
        <TaskForm onSubmit={handleSubmit} editingTask={editingTask} onClose={closeForm} />
      )}

      {/* AI chatbot */}
      <AIChatbot />

    </div>
  );
}
