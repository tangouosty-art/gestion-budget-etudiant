import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2>Budget Étudiant</h2>
          <p className="sidebar-subtitle">Pilotage simple du quotidien étudiant</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/budget">Budget</NavLink>
          <NavLink to="/tasks">Tâches</NavLink>
          <NavLink to="/documents">Documents</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <span>Connecté en tant que</span>
            <strong>{user?.email || "Utilisateur"}</strong>
          </div>

          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}