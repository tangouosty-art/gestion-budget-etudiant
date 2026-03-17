import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="page">Chargement...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}