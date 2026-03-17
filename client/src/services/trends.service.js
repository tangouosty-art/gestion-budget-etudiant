import { apiFetch } from "./api";

export function getTrends(year) {
  return apiFetch(`/trends?year=${year}`);
}