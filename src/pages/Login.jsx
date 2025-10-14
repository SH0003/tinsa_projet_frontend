import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est déjà connecté ou s'il y a un message de déconnexion
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const message = localStorage.getItem("logoutMessage");
    
    if (message) {
      setLogoutMessage(message);
      localStorage.removeItem("logoutMessage");
    }
    
    if (token) {
      navigate("/Autorisation");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(apiUrl+"api/token/", {
        email,
        password,
      });
    
      const { access, refresh } = res.data;
      
      // Stocker les tokens dans localStorage
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      
      // ✅ EXTRAIRE LE RÔLE ET L'EMAIL DIRECTEMENT DU TOKEN
      try {
        const payload = JSON.parse(atob(access.split('.')[1]));
        const expiryDate = new Date(payload.exp * 1000);
        localStorage.setItem("tokenExpiry", expiryDate.toString());
        localStorage.setItem("lastActivity", Date.now().toString());
        
        // ✅ Sauvegarder le rôle et l'email depuis le token JWT
        localStorage.setItem("userRole", payload.role);
        localStorage.setItem("userName", payload.email);
        
        console.log("✅ Rôle sauvegardé:", payload.role);
        console.log("✅ Email sauvegardé:", payload.email);
        
      } catch (e) {
        console.error("Erreur lors du décodage du token:", e);
      }

      setSuccess(true);

      // ✅ Rediriger après 1 seconde avec rechargement complet
      setTimeout(() => {
        const intendedRoute = localStorage.getItem("intendedRoute") || "/Autorisation";
        localStorage.removeItem("intendedRoute");
        window.location.href = intendedRoute; // Force le rechargement
      }, 1000);

    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Email ou mot de passe incorrect");
        } else if (err.response.status === 400) {
          setError("Données de connexion invalides. Vérifiez vos informations.");
        } else {
          setError(`Erreur d'authentification: ${err.response.data.detail || "Problème lors de la connexion"}`);
        }
      } else if (err.request) {
        setError("Impossible de se connecter au serveur. Vérifiez votre connexion internet.");
      } else {
        setError(`Erreur: ${err.message}`);
      }
      console.error("Erreur de connexion:", err);
    } finally {
      setLoading(false);
    }
  };

  // États de focus pour les inputs
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Styles CSS améliorés
  const styles = {
    container: {
      height: "100vh",
      width: "100vw",
      background: `linear-gradient(135deg, #42005A, #A9009C)`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    },
    backgroundCircle1: {
      position: "absolute",
      width: "600px",
      height: "600px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      top: "-200px",
      left: "-100px",
    },
    backgroundCircle2: {
      position: "absolute",
      width: "500px",
      height: "500px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      bottom: "-150px",
      right: "-100px",
    },
    card: {
      width: "100%",
      maxWidth: "450px",
      backgroundColor: "#fff",
      padding: "2.5rem",
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
      textAlign: "center",
      position: "relative",
      zIndex: 2,
      animation: "fadeIn 0.6s ease-out forwards",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#42005A",
      marginBottom: "0.75rem",
    },
    subtitle: {
      fontSize: "1rem",
      color: "#666",
      marginBottom: "2rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "0.5rem",
    },
    label: {
      fontSize: "0.95rem",
      fontWeight: "600",
      color: "#42005A",
      textAlign: "left",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      border: "1.5px solid #e1e1e1",
      borderRadius: "10px",
      fontSize: "1rem",
      transition: "all 0.2s ease",
      outline: "none",
      boxSizing: "border-box",
    },
    inputFocus: {
      border: "1.5px solid #A9009C",
      boxShadow: "0 0 0 4px rgba(169, 0, 156, 0.1)",
    },
    button: {
      marginTop: "1.5rem",
      padding: "14px",
      backgroundColor: "#42005A",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontWeight: "600",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50px",
      boxShadow: "0 4px 15px rgba(66, 0, 90, 0.25)",
    },
    buttonHover: {
      backgroundColor: "#5a0079",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(66, 0, 90, 0.35)",
    },
    error: {
      color: "#e53935",
      marginTop: "1rem",
      fontSize: "0.9rem",
      padding: "10px",
      backgroundColor: "#ffebee",
      borderRadius: "8px",
      textAlign: "center",
    },
    success: {
      color: "#2e7d32",
      marginTop: "1rem",
      fontSize: "0.9rem",
      padding: "10px",
      backgroundColor: "#e8f5e9",
      borderRadius: "8px",
      textAlign: "center",
    },
    info: {
      color: "#1976d2",
      marginTop: "1rem",
      fontSize: "0.9rem",
      padding: "10px",
      backgroundColor: "#e3f2fd",
      borderRadius: "8px",
      textAlign: "center",
    },
    spinner: {
      width: "20px",
      height: "20px",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderTop: "3px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
  };

  // Animation CSS
  const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  `;

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      {/* Éléments décoratifs d'arrière-plan */}
      <div style={styles.backgroundCircle1}></div>
      <div style={styles.backgroundCircle2}></div>
      
      <div style={styles.card}>
        
        <h1 style={styles.title}>Bienvenue</h1>
        
        {logoutMessage && <div style={styles.info}>{logoutMessage}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="Entrez votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
              style={{
                ...styles.input,
                ...(emailFocused ? styles.inputFocus : {})
              }}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              style={{
                ...styles.input,
                ...(passwordFocused ? styles.inputFocus : {})
              }}
            />
          </div>
          
          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = styles.button.boxShadow;
            }}
            disabled={loading || success}
          >
            {loading ? <span style={styles.spinner}></span> : success ? "Connexion réussie !" : "Se connecter"}
          </button>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>Connexion réussie ! Redirection...</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;