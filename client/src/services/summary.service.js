import { apiFetch } from "./api";

export function getSummary(year, month) {
  return apiFetch(`/summary?year=${year}&month=${month}`);
}