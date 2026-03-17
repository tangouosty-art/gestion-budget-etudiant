import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/tasks.service";
import { formatDate } from "../utils/formatDate";
import { TASK_STATUSES } from "../utils/constants";

function getUrgency(task) {
  if (!task.due_date || task.status === "terminee") {
    return null;
  }

  const today = new Date();
  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const due = new Date(task.due_date);
  const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueDate - current;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "En retard", className: "danger" };
  }

  if (diffDays === 0) {
    return { label: "Aujourd’hui", className: "warning" };
  }

  if (diffDays === 1) {
    return { label: "Demain", className: "warning" };
  }

  return { label: "Planifiée", className: "neutral" };
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("toutes");
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "a_faire",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const res = await getTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "toutes") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await createTask(form);
      setForm({
        title: "",
        description: "",
        due_date: "",
        status: "a_faire",
      });
      setMessage("Tâche créée avec succès");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError("");
    setMessage("");

    try {
      await updateTask(taskId, { status });
      setMessage("Statut mis à jour");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    setError("");
    setMessage("");

    try {
      await deleteTask(taskId);
      setMessage("Tâche supprimée avec succès");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tâches</h1>
          <p className="page-subtitle">
            Organise tes priorités et repère rapidement les urgences.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form className="card form-card" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <h2>Ajouter une tâche</h2>

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Titre"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows="4"
        />

        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
        />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="a_faire">À faire</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
        </select>

        <button className="btn" type="submit">
          Ajouter la tâche
        </button>
      </form>

      <div className="task-toolbar card" style={{ marginBottom: 16 }}>
        <div className="task-filter-group">
          <button
            type="button"
            className={`filter-btn ${filter === "toutes" ? "active" : ""}`}
            onClick={() => setFilter("toutes")}
          >
            Toutes
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "a_faire" ? "active" : ""}`}
            onClick={() => setFilter("a_faire")}
          >
            À faire
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "en_cours" ? "active" : ""}`}
            onClick={() => setFilter("en_cours")}
          >
            En cours
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "terminee" ? "active" : ""}`}
            onClick={() => setFilter("terminee")}
          >
            Terminées
          </button>
        </div>

        <div className="task-counter">
          <strong>{filteredTasks.length}</strong> tâche(s)
        </div>
      </div>

      {loading ? (
        <div className="card">Chargement...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="card">
          <p>Aucune tâche à afficher pour ce filtre.</p>
        </div>
      ) : (
        <div className="task-grid">
          {filteredTasks.map((task) => {
            const urgency = getUrgency(task);

            return (
              <article key={task.id} className="task-card">
                <div className="task-card-top">
                  <h3>{task.title}</h3>

                  <div className="task-badges">
                    <span className={`status-chip ${task.status}`}>
                      {TASK_STATUSES[task.status] || task.status}
                    </span>

                    {urgency && (
                      <span className={`status-chip ${urgency.className}`}>
                        {urgency.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-meta">
                  <span>Échéance : {formatDate(task.due_date)}</span>
                </div>

                {task.description ? (
                  <p className="task-description">{task.description}</p>
                ) : (
                  <p className="task-description muted">
                    Aucune description pour cette tâche.
                  </p>
                )}

                <div className="task-actions">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, "a_faire")}
                  >
                    À faire
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, "en_cours")}
                  >
                    En cours
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(task.id, "terminee")}
                  >
                    Terminée
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(task.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}