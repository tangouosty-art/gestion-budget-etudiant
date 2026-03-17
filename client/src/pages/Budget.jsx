import { useEffect, useMemo, useState } from "react";
import { getBudget, saveBudget } from "../services/budget.service";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../services/categories.service";
import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "../services/expenses.service";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import AlertBanner from "../components/ui/AlertBanner";

function getCurrentPeriod() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}
function getBudgetAlertData(budgetAmount, totalExpenses) {
  const budget = Number(budgetAmount || 0);
  const total = Number(totalExpenses || 0);

  if (budget <= 0) return null;

  const usage = total / budget;

  if (usage > 1) {
    return {
      type: "danger",
      title: "Budget dépassé",
      message: `Tu as dépassé ton budget de ${formatCurrency(total - budget)}.`,
    };
  }

  if (usage === 1) {
    return {
      type: "danger",
      title: "Budget atteint",
      message: "Ton budget mensuel est entièrement utilisé.",
    };
  }

  if (usage >= 0.8) {
    return {
      type: "warning",
      title: "Budget bientôt atteint",
      message: `Tu as déjà utilisé ${Math.round(usage * 100)}% de ton budget.`,
    };
  }

  return null;
}

export default function Budget() {
  const current = getCurrentPeriod();

  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);

  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetId, setBudgetId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const [categoryName, setCategoryName] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    label: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    category_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const remaining = useMemo(() => {
    const budget = Number(budgetAmount || 0);
    return budget - Number(totalExpenses || 0);
  }, [budgetAmount, totalExpenses]);

  const budgetAlert = getBudgetAlertData(budgetAmount, totalExpenses);

  async function loadBudgetData() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [budgetRes, categoriesRes, expensesRes] = await Promise.all([
        getBudget(year, month),
        getCategories(),
        getExpenses(year, month),
      ]);

      setBudgetId(budgetRes.budget?.id || null);
      setBudgetAmount(budgetRes.budget?.amount ?? "");
      setCategories(categoriesRes.categories || []);
      setExpenses(expensesRes.expenses || []);
      setTotalExpenses(expensesRes.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgetData();
  }, [year, month]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await saveBudget({
        year,
        month,
        amount: budgetAmount,
      });

      setBudgetId(res.budget?.id || null);
      setBudgetAmount(res.budget?.amount ?? "");
      setMessage("Budget enregistré avec succès");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await createCategory({ name: categoryName });
      setCategoryName("");
      setMessage("Catégorie créée avec succès");
      await loadBudgetData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    setError("");
    setMessage("");

    try {
      await deleteCategory(id);
      setMessage("Catégorie supprimée avec succès");
      await loadBudgetData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExpenseChange = (e) => {
    setExpenseForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await createExpense({
        ...expenseForm,
        category_id: expenseForm.category_id ? Number(expenseForm.category_id) : null,
      });

      setExpenseForm({
        label: "",
        amount: "",
        expense_date: new Date().toISOString().slice(0, 10),
        category_id: "",
      });

      setMessage("Dépense ajoutée avec succès");
      await loadBudgetData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    setError("");
    setMessage("");

    try {
      await deleteExpense(id);
      setMessage("Dépense supprimée avec succès");
      await loadBudgetData();
    } catch (err) {
      setError(err.message);
    }

  
  };
  

  return (
    <div className="page">
      <h1>Budget</h1>
     
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

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
       {budgetAlert && (
        <div style={{ marginBottom: 16 }}>
          <AlertBanner type={budgetAlert.type} title={budgetAlert.title}>
            {budgetAlert.message}
          </AlertBanner>
        </div>
      )}


      {loading ? (
        <div className="card">Chargement...</div>
      ) : (
        <>
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
              <p>{formatCurrency(budgetAmount || 0)}</p>
            </div>

            <div className="card">
              <h3>Total des dépenses</h3>
              <p>{formatCurrency(totalExpenses)}</p>
            </div>

            <div className="card">
              <h3>Reste</h3>
              <p>{formatCurrency(remaining)}</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            <form className="card form-card" onSubmit={handleSaveBudget}>
              <h2>Définir le budget</h2>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Montant du budget"
              />
              <button className="btn" type="submit">
                {budgetId ? "Mettre à jour" : "Enregistrer"}
              </button>
            </form>

            <form className="card form-card" onSubmit={handleCreateCategory}>
              <h2>Ajouter une catégorie</h2>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Transport"
              />
              <button className="btn" type="submit">
                Ajouter
              </button>
            </form>

            <form className="card form-card" onSubmit={handleCreateExpense}>
              <h2>Ajouter une dépense</h2>
              <input
                type="text"
                name="label"
                value={expenseForm.label}
                onChange={handleExpenseChange}
                placeholder="Libellé"
              />

              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                value={expenseForm.amount}
                onChange={handleExpenseChange}
                placeholder="Montant"
              />

              <input
                type="date"
                name="expense_date"
                value={expenseForm.expense_date}
                onChange={handleExpenseChange}
              />

              <select
                name="category_id"
                value={expenseForm.category_id}
                onChange={handleExpenseChange}
              >
                <option value="">Sans catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button className="btn" type="submit">
                Ajouter la dépense
              </button>
            </form>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            <div className="card">
              <h2>Catégories</h2>
              {categories.length === 0 ? (
                <p>Aucune catégorie</p>
              ) : (
                <ul style={{ paddingLeft: 18 }}>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span>{category.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Supprimer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h2>Dépenses du mois</h2>
              {expenses.length === 0 ? (
                <p>Aucune dépense pour cette période</p>
              ) : (
                <ul style={{ paddingLeft: 18 }}>
                  {expenses.map((expense) => (
                    <li key={expense.id} style={{ marginBottom: 10 }}>
                      <strong>{expense.label}</strong> — {formatCurrency(expense.amount)}
                      <br />
                      <small>
                        {formatDate(expense.expense_date)} | {expense.category_name || "Sans catégorie"}
                      </small>
                      <br />
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{ marginTop: 6 }}
                      >
                        Supprimer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}