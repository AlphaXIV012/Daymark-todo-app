import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow, CalendarDays, Check, CheckCheck, ChevronLeft,
  ChevronRight, Circle, ClipboardList, Clock3, LogOut, Plus, Search,
  ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, getApiBaseUrl } from "../lib/api.js";

const PAGE_SIZE = 6;

function formatDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function initials(email = "U") {
  return email.slice(0, 1).toUpperCase();
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-topline">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={17} /></span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

export default function TodoDashboard() {
  const { token, user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [adminView, setAdminView] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTask, setEditingTask] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let ignore = false;

    async function loadTodos() {
      setLoading(true);
      setError("");
      try {
        const endpoint = adminView && isAdmin ? "/todos/admin/all" : "/todos";
        const response = await apiRequest(endpoint, { token });
        if (!ignore) {
          setTodos(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Unable to load your todos.");
          if (requestError.status === 401) {
            setError("Your session is missing or has expired. Please sign in again.");
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTodos();
    return () => { ignore = true; };
  }, [token, adminView, isAdmin, reloadKey]);

  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (filter === "active") result = result.filter((todo) => !todo.completed);
    if (filter === "completed") result = result.filter((todo) => todo.completed);

    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter((todo) => todo.task.toLowerCase().includes(normalizedSearch));
    }

    if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === "oldest") {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sort === "alphabetical") {
      result.sort((a, b) => a.task.localeCompare(b.task));
    }

    return result;
  }, [todos, filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleTodos = filteredTodos.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  const completionRate = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  useEffect(() => { setPage(1); }, [filter, search, sort, adminView]);

  async function refresh() {
    setReloadKey((value) => value + 1);
  }

  async function handleCreate(event) {
    event.preventDefault();
    const task = newTask.trim();
    if (!task) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest("/todos", { method: "POST", token, body: { task } });
      setNewTask("");
      setNotice("Your task has been added.");
      setFilter("all");
      setSearch("");
      setPage(1);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Could not create this task.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(todo) {
    setError("");
    try {
      await apiRequest(`/todos/${todo.id}`, {
        method: "PATCH",
        token,
        body: { completed: !todo.completed },
      });
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Could not update this task.");
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditingTask(todo.task);
    setError("");
  }

  async function handleSaveEdit(todoId) {
    const task = editingTask.trim();
    if (!task) {
      setError("A task cannot be empty.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await apiRequest(`/todos/${todoId}`, {
        method: "PATCH",
        token,
        body: { task },
      });
      setEditingId(null);
      setEditingTask("");
      setNotice("Task updated successfully.");
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Could not update this task.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(todo) {
    const confirmed = window.confirm(`Delete “${todo.task}”? This cannot be undone.`);
    if (!confirmed) return;

    setError("");
    try {
      await apiRequest(`/todos/${todo.id}`, { method: "DELETE", token });
      setNotice("Task deleted.");
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Could not delete this task.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand">
          <span className="brand-mark"><Check size={19} strokeWidth={3} /></span>
          <span>daymark</span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <div className="sidebar-nav-item active"><ClipboardList size={17} /> My tasks</div>
        <div className="sidebar-note">
          <span className="note-dot" />
          <div><strong>One step at a time</strong><span>Progress over pressure.</span></div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">{initials(user?.email)}</div>
            <div className="user-copy"><strong>{user?.email || "Your account"}</strong><span>{user?.role || "user"}</span></div>
          </div>
          <button className="sidebar-logout" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>My tasks</strong></div>
          <div className="topbar-right">
            {isAdmin && <span className="role-pill"><ShieldCheck size={13}/> Administrator</span>}
            <div className="topbar-date"><CalendarDays size={15}/> {new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date())}</div>
            <button className="mobile-logout" onClick={logout} aria-label="Sign out"><LogOut size={17}/></button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={14}/> YOUR DAILY SPACE</div>
              <h1>{adminView ? "Team overview" : "A little progress adds up."}</h1>
              <p>{adminView ? "Review tasks across all accounts." : "Keep your focus on what matters today."}</p>
            </div>
            {isAdmin && (
              <button className={`admin-toggle ${adminView ? "selected" : ""}`} onClick={() => setAdminView((value) => !value)}>
                <ShieldCheck size={16}/>{adminView ? "Viewing all users" : "View all users"}
              </button>
            )}
          </section>

          {error && <div className="alert alert-error dashboard-alert" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16}/></button></div>}
          {notice && <div className="alert alert-success dashboard-alert" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={16}/></button></div>}

          <section className="stats-grid">
            <StatCard label="All tasks" value={todos.length} detail="In this workspace" icon={ClipboardList} tone="blue" />
            <StatCard label="In progress" value={activeCount} detail="Still on your list" icon={Clock3} tone="amber" />
            <StatCard label="Completed" value={completedCount} detail="Nice work, keep going" icon={CheckCheck} tone="green" />
            <StatCard label="Completion" value={`${completionRate}%`} detail="Your progress so far" icon={Sparkles} tone="violet" />
          </section>

          <section className="progress-card">
            <div className="progress-copy"><div><strong>Your momentum</strong><span>{completedCount} of {todos.length} tasks completed</span></div><strong className="progress-percent">{completionRate}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${completionRate}%` }} /></div>
          </section>

          <section className="task-section">
            <div className="section-heading">
              <div><h2>{adminView ? "All tasks" : "Your task list"}</h2><p>Capture it, work through it, move forward.</p></div>
              <span className="task-count">{filteredTodos.length} {filteredTodos.length === 1 ? "task" : "tasks"}</span>
            </div>

            <form className="add-task-form" onSubmit={handleCreate}>
              <span className="add-icon"><Plus size={19}/></span>
              <input
                aria-label="New task"
                maxLength={200}
                placeholder="What needs to get done?"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
              />
              <button type="submit" className="primary-button add-button" disabled={busy || !newTask.trim()}>
                <Plus size={16}/> Add task
              </button>
            </form>

            <div className="list-toolbar">
              <div className="filter-tabs" aria-label="Filter tasks">
                {[{ id: "all", label: "All tasks" }, { id: "active", label: "In progress" }, { id: "completed", label: "Completed" }].map((item) => (
                  <button key={item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>
                ))}
              </div>
              <div className="toolbar-controls">
                <label className="search-field">
                  <Search size={16}/>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" />
                  {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={14}/></button>}
                </label>
                <label className="sort-select"><ArrowDownWideNarrow size={15}/><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort tasks"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="alphabetical">A–Z</option></select></label>
              </div>
            </div>

            <div className="todo-list" aria-live="polite">
              {loading ? (
                <div className="loading-state"><span className="spinner"/> Loading your tasks...</div>
              ) : visibleTodos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><ClipboardList size={25}/></div>
                  <h3>{search ? "No matching tasks" : filter === "completed" ? "Nothing completed yet" : filter === "active" ? "You're all caught up" : "Your list is clear"}</h3>
                  <p>{search ? "Try another word or clear your search." : "Add a task above and give your next step a place to start."}</p>
                  {search && <button className="text-button" onClick={() => setSearch("")}>Clear search</button>}
                </div>
              ) : visibleTodos.map((todo) => {
                const canManage = !adminView || Number(todo.userId) === Number(user?.id);
                const isEditing = editingId === todo.id;
                return (
                  <article className={`todo-row ${todo.completed ? "is-complete" : ""}`} key={todo.id}>
                    <button className="completion-button" onClick={() => canManage && handleToggle(todo)} disabled={!canManage} aria-label={todo.completed ? "Mark as in progress" : "Mark as completed"} title={canManage ? "Toggle completion" : "You can only change your own tasks"}>
                      {todo.completed ? <CheckCircleIcon/> : <Circle size={21}/>}
                    </button>
                    <div className="todo-main">
                      {isEditing ? (
                        <form className="edit-form" onSubmit={(event) => { event.preventDefault(); handleSaveEdit(todo.id); }}>
                          <input value={editingTask} onChange={(event) => setEditingTask(event.target.value)} maxLength={200} autoFocus />
                          <button className="icon-button save-icon" type="submit" disabled={busy} aria-label="Save edit"><Check size={17}/></button>
                          <button className="icon-button" type="button" onClick={() => setEditingId(null)} aria-label="Cancel edit"><X size={17}/></button>
                        </form>
                      ) : (
                        <>
                          <div className="todo-title-line"><h3>{todo.task}</h3>{adminView && <span className="owner-tag">User #{todo.userId}</span>}</div>
                          <div className="todo-meta"><span><CalendarDays size={13}/> Added {formatDate(todo.createdAt)}</span><span className={`status-label ${todo.completed ? "done" : "pending"}`}>{todo.completed ? "Completed" : "In progress"}</span></div>
                        </>
                      )}
                    </div>
                    {!isEditing && canManage && <div className="todo-actions">
                      <button className="icon-button" onClick={() => startEdit(todo)} aria-label={`Edit ${todo.task}`} title="Edit task"><span className="edit-glyph">✎</span></button>
                      <button className="icon-button delete-action" onClick={() => handleDelete(todo)} aria-label={`Delete ${todo.task}`} title="Delete task"><Trash2 size={16}/></button>
                    </div>}
                    {!canManage && <span className="readonly-label">Read only</span>}
                  </article>
                );
              })}
            </div>

            {!loading && filteredTodos.length > 0 && (
              <div className="list-footer">
                <span>Showing <strong>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredTodos.length)}</strong> of <strong>{filteredTodos.length}</strong></span>
                <div className="pagination-controls">
                  <button className="page-button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage <= 1} aria-label="Previous page"><ChevronLeft size={17}/></button>
                  <span>Page <strong>{safePage}</strong> of <strong>{totalPages}</strong></span>
                  <button className="page-button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage >= totalPages} aria-label="Next page"><ChevronRight size={17}/></button>
                </div>
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span><ShieldCheck size={14}/> Your workspace is private to your account.</span>
            <span>Daymark <span className="footer-dot">·</span> Keep moving forward</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon() {
  return <span className="checked-icon"><Check size={13} strokeWidth={3}/></span>;
}
