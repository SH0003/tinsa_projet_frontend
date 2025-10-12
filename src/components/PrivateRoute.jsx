// Dans PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  
  if (!token) {
    // Sauvegarder la route prévue avant la redirection
    localStorage.setItem("intendedRoute", location.pathname);
    return <Navigate to="/login" />;
  }
  
  return children;
}