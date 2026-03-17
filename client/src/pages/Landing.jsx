import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    title: "Suivi du budget",
    text: "Définis un budget mensuel clair et visualise instantanément ce qu’il te reste.",
  },
  {
    title: "Gestion des dépenses",
    text: "Classe tes dépenses par catégorie pour mieux comprendre où part ton argent.",
  },
  {
    title: "Tâches et rappels",
    text: "Centralise tes échéances importantes pour éviter les oublis du quotidien.",
  },
  {
    title: "Documents personnels",
    text: "Retrouve tes documents utiles dans un seul espace organisé.",
  },
];

const problems = [
  "Budget dépassé sans s’en rendre compte",
  "Petites dépenses oubliées au fil du mois",
  "Tâches importantes non suivies",
  "Documents dispersés entre téléphone et ordinateur",
];

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">Application étudiante</span>
          <h1>Maîtrise ton budget étudiant avec une interface claire et moderne.</h1>
          <p>
            Gère ton budget mensuel, suis tes dépenses, organise tes tâches et
            centralise tes documents dans une seule application pensée pour la
            vie étudiante.
          </p>

          <div className="landing-actions">
            <Link className="btn" to="/register">
              Commencer
            </Link>
            <Link className="btn btn-outline" to="/login">
              Se connecter
            </Link>
          </div>
        </div>

        <div className="landing-preview-card">
          <div className="preview-top">
            <div>
              <p className="preview-label">Budget du mois</p>
              <h3>750,00 €</h3>
            </div>
            <span className="status-chip warning">80% utilisé</span>
          </div>

          <div className="preview-stats">
            <div className="mini-stat">
              <span>Dépenses</span>
              <strong>602,40 €</strong>
            </div>
            <div className="mini-stat">
              <span>Reste</span>
              <strong>147,60 €</strong>
            </div>
            <div className="mini-stat">
              <span>Tâches</span>
              <strong>5 actives</strong>
            </div>
          </div>

          <div className="preview-bars">
            <div>
              <label>Transport</label>
              <div className="bar">
                <span style={{ width: "68%" }} />
              </div>
            </div>
            <div>
              <label>Nourriture</label>
              <div className="bar">
                <span style={{ width: "84%" }} />
              </div>
            </div>
            <div>
              <label>Loisirs</label>
              <div className="bar">
                <span style={{ width: "42%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span>Pourquoi cette application ?</span>
          <h2>Les difficultés étudiantes les plus fréquentes</h2>
        </div>

        <div className="problem-grid">
          {problems.map((problem) => (
            <div key={problem} className="problem-card">
              <div className="problem-dot" />
              <p>{problem}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span>Fonctionnalités</span>
          <h2>Tout le nécessaire dans une seule application</h2>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-highlight">
        <div className="highlight-text">
          <span>Objectif</span>
          <h2>Une gestion plus sereine et plus visible du quotidien étudiant</h2>
          <p>
            L’application aide l’utilisateur à mieux anticiper ses dépenses,
            repérer les dépassements, suivre ses priorités et retrouver ses
            informations importantes plus facilement.
          </p>
        </div>

        <div className="highlight-card">
          <div className="highlight-row">
            <span>Budget maîtrisé</span>
            <strong>Oui</strong>
          </div>
          <div className="highlight-row">
            <span>Suivi mensuel</span>
            <strong>Oui</strong>
          </div>
          <div className="highlight-row">
            <span>Alertes prévues</span>
            <strong>Bientôt</strong>
          </div>
          <div className="highlight-row">
            <span>Documents centralisés</span>
            <strong>Oui</strong>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <h3>Gestion Budget Étudiant</h3>
          <p>Projet web de gestion budgétaire, tâches et documents.</p>
        </div>

        <div className="landing-footer-actions">
          <Link to="/register">Créer un compte</Link>
          <Link to="/login">Connexion</Link>
        </div>
      </footer>
    </div>
  );
}