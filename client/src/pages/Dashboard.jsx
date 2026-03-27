 import { useEffect, useMemo, useState } from "react";
import { getSummary } from "../services/summary.service";
import { getTrends } from "../services/trends.service";
import { getTasks } from "../services/tasks.service";
import MonthlyLineChart from "../components/charts/MonthlyLineChart";
import CategoryBarChart from "../components/charts/CategoryBarChart";
import AlertBanner from "../components/ui/AlertBanner";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { TASK_STATUSES } from "../utils/constants";
import {
  requestBrowserNotificationPermission,
  sendNotificationOnce,
} from "../utils/notifications";

function getCurrentPeriod() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

function getBudgetAlert(summary) {
  const budget = Number(summary?.budget || 0);
  const total = Number(summary?.totalExpenses || 0);

  if (budget <= 0) return null;

  const usage = total / budget;

  if (usage > 1) {
    return {
      type: "danger",
      title: "Budget dépassé",
      message: `Tu as dépassé ton budget de ${formatCurrency(total - budget)}.`,
      levelKey: "exceeded",
    };
  }

  if (usage === 1) {
    return {
      type: "danger",
      title: "Budget atteint",
      message: "Tu as atteint 100% de ton budget mensuel.",
      levelKey: "reached",
    };
  }

  if (usage >= 0.8) {
    return {
      type: "warning",
      title: "Budget bientôt atteint",
      message: `Tu as déjà utilisé ${Math.round(usage * 100)}% de ton budget.`,
      levelKey: "warning",
    };
  }

  return null;
}

function getTaskReminders(tasks) {
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return tasks
    .filter((task) => task.status !== "terminee" && task.due_date)
    .map((task) => {
      const due = new Date(task.due_date);
      const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const diffDays = Math.round((dueDate - current) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { ...task, urgency: "danger", reminderLabel: "En retard" };
      }

      if (diffDays === 0) {
        return { ...task, urgency: "warning", reminderLabel: "À faire aujourd’hui" };
      }

      if (diffDays === 1) {
        return { ...task, urgency: "warning", reminderLabel: "À faire demain" };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
}

export default function Dashboard() {
  const current = getCurrentPeriod();

  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);

  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notifications_enabled") === "true"
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [summaryRes, trendsRes, tasksRes] = await Promise.all([
        getSummary(year, month),
        getTrends(year),
        getTasks(),
      ]);

      setSummary(summaryRes.summary);
      setTrends(trendsRes.trends || []);
      setTasks(tasksRes.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [year, month]);

  const budgetAlert = useMemo(() => getBudgetAlert(summary), [summary]);
  const taskReminders = useMemo(() => getTaskReminders(tasks), [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "notifications_enabled",
      notificationsEnabled ? "true" : "false"
    );
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled || !summary) return;

    if (budgetAlert) {
      sendNotificationOnce(
        `budget_${summary.year}_${summary.month}_${budgetAlert.levelKey}`,
        budgetAlert.title,
        budgetAlert.message
      );
    }

    taskReminders.forEach((task) => {
      sendNotificationOnce(
        `task_${task.id}_${task.reminderLabel}`,
        `Rappel tâche : ${task.title}`,
        `${task.reminderLabel} — échéance ${formatDate(task.due_date)}`
      );
    });
  }, [notificationsEnabled, summary, budgetAlert, taskReminders]);

  const handleEnableNotifications = async () => {
    const permission = await requestBrowserNotificationPermission();

    if (permission === "granted") {
      setNotificationsEnabled(true);
      return;
    }

    if (permission === "denied") {
      setNotificationsEnabled(false);
      alert("Les notifications sont bloquées par le navigateur.");
      return;
    }

    if (permission === "unsupported") {
      alert("Ce navigateur ne supporte pas les notifications.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            Vue globale de ton budget, de tes dépenses et de tes priorités.
          </p>
        </div>

        <div className="dashboard-actions">
          <button className="btn btn-outline" onClick={handleEnableNotifications}>
            {notificationsEnabled
              ? "Notifications activées"
              : "Activer les notifications"}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Période</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="Année"
          />
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            placeholder="Mois"
          />
        </div>
      </div>

      {loading ? (
        <div className="card">Chargement du dashboard...</div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {budgetAlert && (
            <div style={{ marginBottom: 16 }}>
              <AlertBanner type={budgetAlert.type} title={budgetAlert.title}>
                {budgetAlert.message}
              </AlertBanner>
            </div>
          )}

          {taskReminders.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <AlertBanner type="info" title="Rappels de tâches">
                Tu as {taskReminders.length} tâche(s) qui demandent ton attention.
              </AlertBanner>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div className="card">
              <h3>Budget du mois</h3>
              <p>{formatCurrency(summary?.budget || 0)}</p>
            </div>

            <div className="card">
              <h3>Total dépensé</h3>
              <p>{formatCurrency(summary?.totalExpenses || 0)}</p>
            </div>

            <div className="card">
              <h3>Reste</h3>
              <p>{formatCurrency(summary?.remaining || 0)}</p>
            </div>

            <div className="card">
              <h3>Nombre de dépenses</h3>
              <p>{summary?.expenseCount || 0}</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            <div className="card">
              <h2>Dépenses par catégorie</h2>
              {summary?.topCategories?.length ? (
                <CategoryBarChart data={summary.topCategories} />
              ) : (
                <p>Aucune donnée de catégorie pour cette période.</p>
              )}
            </div>

            <div className="card">
              <h2>Évolution mensuelle</h2>
              <MonthlyLineChart data={trends} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 16,
              marginTop: 16,
            }}
            className="dashboard-bottom-grid"
          >
            <div className="card">
              <h2>Top catégories</h2>
              {summary?.topCategories?.length ? (
                <ul style={{ paddingLeft: 18 }}>
                  {summary.topCategories.map((item, index) => (
                    <li key={`${item.categoryName}-${index}`} style={{ marginBottom: 8 }}>
                      {item.categoryName} — {formatCurrency(item.totalAmount)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune dépense enregistrée pour cette période.</p>
              )}
            </div>

            <div className="card">
              <h2>Rappels tâches</h2>
              {taskReminders.length === 0 ? (
                <p>Aucune tâche urgente pour le moment.</p>
              ) : (
                <div className="reminder-list">
                  {taskReminders.map((task) => (
                    <div key={task.id} className="reminder-item">
                      <div className="reminder-top">
                        <strong>{task.title}</strong>
                        <span className={`status-chip ${task.urgency}`}>
                          {task.reminderLabel}
                        </span>
                      </div>
                      <small>
                        Statut : {TASK_STATUSES[task.status] || task.status}
                      </small>
                      <br />
                      <small>Échéance : {formatDate(task.due_date)}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}