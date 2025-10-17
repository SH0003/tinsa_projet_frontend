import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000;
const TOKEN_CHECK_INTERVAL = 60 * 60 *1000; 

const SessionTimeout = () => {
  const navigate = useNavigate();
  
  // Fonction pour vérifier le token JWT
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      logout();
      return;
    }

    try {
      // Décodage du payload JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; 
      const currentTime = Date.now();
      
      // Si le token est expiré
      if (currentTime >= expiry) {
        logout();
      }
    } catch (e) {
      console.error('Erreur lors de la vérification du token', e);
      logout();
    }
  };

  // Fonction pour vérifier l'inactivité
  const checkInactivity = () => {
    const currentTime = Date.now();
    const lastActivity = parseInt(localStorage.getItem("lastActivity") || currentTime);
    
    if (currentTime - lastActivity >= INACTIVITY_TIMEOUT) {
      logout();
    }
  };

  // Fonction de déconnexion silencieuse
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  // Effet pour initialiser les écouteurs d'événements
  useEffect(() => {
    // Événements à écouter pour détecter l'activité de l'utilisateur
    const events = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'
    ];

    // Ajouter les écouteurs pour chaque événement
    const resetTimerFn = () => resetInactivityTimer();
    events.forEach(event => {
      window.addEventListener(event, resetTimerFn);
    });

    // Nettoyer les écouteurs lors du démontage du composant
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimerFn);
      });
    };
  }, []);

  // Effet pour mettre en place les vérifications périodiques
  useEffect(() => {
    // Vérification initiale
    checkTokenExpiration();
    
    // Initialiser le timestamp de dernière activité s'il n'existe pas
    if (!localStorage.getItem("lastActivity")) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
    
    // Configurer les intervalles de vérification
    const tokenCheckInterval = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL);
    const inactivityCheckInterval = setInterval(checkInactivity, TOKEN_CHECK_INTERVAL);
    
    // Nettoyer les intervalles lors du démontage du composant
    return () => {
      clearInterval(tokenCheckInterval);
      clearInterval(inactivityCheckInterval);
    };
  }, []);

  // Ce composant ne rend rien
  return null;
};

export default SessionTimeout;