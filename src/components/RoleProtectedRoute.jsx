// Composant pour protéger les routes selon le rôle utilisateur
import { Navigate } from "react-router-dom";
import { Result, Button } from "antd";

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = "/Temoins" 
}) {
  const userRole = localStorage.getItem("userRole");
  
  // Vérifier si l'utilisateur a le rôle requis
  if (!allowedRoles.includes(userRole)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Désolé, vous n'avez pas l'autorisation d'accéder à cette page."
        extra={
          <Button type="primary" onClick={() => window.location.href = redirectTo}>
            Retour à l'accueil
          </Button>
        }
      />
    );
  }
  
  return children;
}

