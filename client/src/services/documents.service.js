import { apiFetch } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getDocuments() {
  return apiFetch("/documents");
}

export function getDocumentsTree() {
  return apiFetch("/documents/tree");
}

export async function uploadDocument(formData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Une erreur est survenue");
  }

  return data;
}

export async function downloadDocument(id, originalName) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/documents/${id}/download`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Téléchargement impossible");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function previewDocument(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/documents/${id}/download`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Prévisualisation impossible");
  }

  const blob = await response.blob();

  return {
    blob,
    mimeType: blob.type || response.headers.get("content-type") || "",
  };
}

export function deleteDocument(id) {
  return apiFetch(`/documents/${id}`, {
    method: "DELETE",
  });
}