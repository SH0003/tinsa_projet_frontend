import axios from "axios";


const apiUrl = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

let refreshTokenPromise = null;

// Fonction pour rafraîchir le token
const refreshAccessToken = async () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        reject(new Error("Pas de token de rafraîchissement disponible"));
        return;
      }
      
      const response = await axios.post(apiUrl+"api/token/refresh/", {
        refresh: refreshToken,
      });
      
      if (response.data.access) {
        localStorage.setItem("accessToken", response.data.access);
        
        // Mettre à jour la date d'expiration
        try {
          const payload = JSON.parse(atob(response.data.access.split('.')[1]));
          const expiryDate = new Date(payload.exp * 1000);
          localStorage.setItem("tokenExpiry", expiryDate.toString());
          // Mettre à jour également le moment de la dernière activité
          localStorage.setItem("lastActivity", Date.now().toString());
        } catch (e) {
          console.error("Erreur lors du décodage du token:", e);
        }
        
        resolve(response.data.access);
      } else {
        reject(new Error("Token de rafraîchissement invalide"));
      }
    } catch (error) {
      reject(error);
    } finally {
      refreshTokenPromise = null;
    }
  });

  return refreshTokenPromise;
};

// Ajouter un intercepteur de requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Mettre à jour l'horodatage de la dernière activité
    localStorage.setItem("lastActivity", Date.now().toString());
    return config;
  },
  (error) => Promise.reject(error)
);

// Ajouter un intercepteur de réponse pour gérer l'expiration du token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (Non autorisé) et que nous n'avons pas encore essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Essayer d'obtenir un nouveau token
        const newAccessToken = await refreshAccessToken();
        
        // Mettre à jour le header d'autorisation
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Réessayer la requête originale
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si le token de rafraîchissement est également invalide, déconnexion silencieuse
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        // Rediriger vers la page de connexion (si la fenêtre est disponible)
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;