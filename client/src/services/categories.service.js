import { apiFetch } from "./api";

export function getCategories() {
  return apiFetch("/categories");
}

export function createCategory(payload) {
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, {
    method: "DELETE",
  });
}