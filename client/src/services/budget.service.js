import { apiFetch } from "./api";

export function getBudget(year, month) {
  return apiFetch(`/budget?year=${year}&month=${month}`);
}

export function saveBudget(payload) {
  return apiFetch("/budget", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}