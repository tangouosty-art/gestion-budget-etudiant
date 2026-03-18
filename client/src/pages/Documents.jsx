import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDocuments,
  getDocumentsTree,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../services/documents.service";
import { formatDate } from "../utils/formatDate";

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
}

function FolderNode({ node, selectedFolder, onSelect }) {
  return (
    <li>
      <button
        type="button"
        className={`folder-node-btn ${
          selectedFolder === node.path ? "active" : ""
        }`}
        onClick={() => onSelect(node.path)}
      >
        {node.name}
      </button>

      {node.children?.length > 0 && (
        <ul className="folder-children">
          {node.children.map((child) => (
            <FolderNode
              key={child.path}
              node={child}
              selectedFolder={selectedFolder}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [tree, setTree] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("all");

  const [form, setForm] = useState({
    title: "",
    folder_path: "Personnel",
    note: "",
  });
  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDocumentsModule() {
    setLoading(true);
    setError("");

    try {
      const [documentsRes, treeRes] = await Promise.all([
        getDocuments(),
        getDocumentsTree(),
      ]);

      setDocuments(documentsRes.documents || []);
      setTree(treeRes.tree || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocumentsModule();
  }, []);

  const filteredDocuments = useMemo(() => {
    if (selectedFolder === "all") return documents;

    return documents.filter(
      (doc) =>
        doc.folder_path === selectedFolder ||
        doc.folder_path.startsWith(`${selectedFolder}/`)
    );
  }, [documents, selectedFolder]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!files.length) {
      setError("Sélectionne au moins un fichier");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("folder_path", form.folder_path);
      formData.append("note", form.note);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await uploadDocument(formData);

      setForm({
        title: "",
        folder_path: "Personnel",
        note: "",
      });
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Document(s) importé(s) avec succès");
      await loadDocumentsModule();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (documentId) => {
    setError("");
    setMessage("");

    try {
      await deleteDocument(documentId);
      setMessage("Document supprimé avec succès");
      await loadDocumentsModule();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownload = async (doc) => {
    setError("");
    setMessage("");

    try {
      await downloadDocument(doc.id, doc.original_name);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="page-subtitle">
            Importe plusieurs fichiers depuis ton appareil et range-les dans un
            dossier privé.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="documents-layout">
        <aside className="documents-sidebar card">
          <h2>Arborescence</h2>

          <button
            type="button"
            className={`folder-node-btn ${
              selectedFolder === "all" ? "active" : ""
            }`}
            onClick={() => setSelectedFolder("all")}
          >
            Tous les documents
          </button>

          {tree.length === 0 ? (
            <p className="muted">Aucun dossier pour le moment.</p>
          ) : (
            <ul className="folder-tree">
              {tree.map((node) => (
                <FolderNode
                  key={node.path}
                  node={node}
                  selectedFolder={selectedFolder}
                  onSelect={setSelectedFolder}
                />
              ))}
            </ul>
          )}
        </aside>

        <div className="documents-main">
          <form
            className="card form-card"
            onSubmit={handleUpload}
            style={{ marginBottom: 16 }}
          >
            <h2>Importer des documents</h2>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Titre personnalisé (utile pour un seul fichier)"
            />

            <input
              type="text"
              name="folder_path"
              value={form.folder_path}
              onChange={handleChange}
              placeholder="Ex: Administratif/CAF"
            />

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Note (optionnel)"
              rows="4"
            />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />

            {files.length > 0 && (
              <p className="selected-files-info">
                {files.length} fichier(s) sélectionné(s)
              </p>
            )}

            <button className="btn" type="submit">
              Importer
            </button>
          </form>

          <div className="card">
            <h2>
              {selectedFolder === "all"
                ? "Tous les documents"
                : `Dossier : ${selectedFolder}`}
            </h2>

            {loading ? (
              <p>Chargement...</p>
            ) : filteredDocuments.length === 0 ? (
              <p>Aucun document à afficher.</p>
            ) : (
              <div className="document-grid">
                {filteredDocuments.map((doc) => (
                  <article key={doc.id} className="document-card">
                    <div className="document-card-top">
                      <div>
                        <h3>{doc.title}</h3>
                        <p className="document-meta">
                          {doc.original_name} • {formatFileSize(doc.file_size)}
                        </p>
                      </div>

                      <span className="document-folder-chip">
                        {doc.folder_path}
                      </span>
                    </div>

                    {doc.note ? (
                      <p className="document-note">{doc.note}</p>
                    ) : (
                      <p className="document-note muted">
                        Aucune note pour ce document.
                      </p>
                    )}

                    <div className="document-info">
                      <small>Ajouté le {formatDate(doc.created_at)}</small>
                      <small>{doc.mime_type}</small>
                    </div>

                    <div className="document-actions">
                      <button type="button" onClick={() => handleDownload(doc)}>
                        Télécharger
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}