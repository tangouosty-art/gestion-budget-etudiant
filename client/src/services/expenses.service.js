import { apiFetch } from "./api";

export function getExpenses(year, month) {
  return apiFetch(`/expenses?year=${year}&month=${month}`);
}

export function createExpense(payload) {
  return apiFetch("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteExpense(id) {
  return apiFetch(`/expenses/${id}`, {
    method: "DELETE",
  });
}