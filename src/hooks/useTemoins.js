import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import axios from '../utils/axios';

/**
 * Custom hook for managing temoins data and operations
 */
export const useTemoins = () => {
  const [temoins, setTemoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Total: ${total} témoins`
  });

  // Use ref to track ongoing requests
  const loadingRef = useRef(false);

  const fetchTemoins = useCallback(async (page = 1, pageSize = 10) => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) {
      console.log('Request already in progress, skipping...');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    
    try {
      console.log(`Fetching temoins: page ${page}, size ${pageSize}`);
      const response = await axios.get(`/api/superadmin/temoins/?page=${page}&page_size=${pageSize}`);
      
      // Handle paginated response
      if (response.data.results && response.data.total !== undefined) {
        setTemoins(response.data.results);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: pageSize,
          total: response.data.total
        }));
      } else {
        // Handle non-paginated response
        setTemoins(response.data);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: pageSize,
          total: response.data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching temoins:', error);
      message.error('Erreur lors du chargement des témoins');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // No dependencies - stable function

  const createTemoin = useCallback(async (values) => {
    try {
      await axios.post('/api/superadmin/temoins/', values);
      message.success('Témoin créé avec succès');
      return true;
    } catch (error) {
      // Extraire le message d'erreur détaillé
      let errorMessage = 'Erreur lors de la création du témoin';
      
      if (error.response) {
        // Erreur de réponse du serveur
        const errorData = error.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ') 
            : errorData.non_field_errors;
        } else {
          // Extraire les erreurs de validation par champ
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
              return `${field}: ${errorText}`;
            })
            .join(' | ');
          
          if (fieldErrors) {
            errorMessage = `Erreurs de validation: ${fieldErrors}`;
          } else {
            errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage, 5); // Afficher pendant 5 secondes
      console.error('Erreur détaillée:', error);
      return false;
    }
  }, []);

  const updateTemoin = useCallback(async (id, values) => {
    try {
      await axios.put(`/api/superadmin/temoins/${id}/`, values);
      message.success('Témoin mis à jour avec succès');
      return true;
    } catch (error) {
      // Extraire le message d'erreur détaillé
      let errorMessage = 'Erreur lors de la mise à jour du témoin';
      
      if (error.response) {
        // Erreur de réponse du serveur
        const errorData = error.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ') 
            : errorData.non_field_errors;
        } else {
          // Extraire les erreurs de validation par champ
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
              return `${field}: ${errorText}`;
            })
            .join(' | ');
          
          if (fieldErrors) {
            errorMessage = `Erreurs de validation: ${fieldErrors}`;
          } else {
            errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage, 5); // Afficher pendant 5 secondes
      console.error('Erreur détaillée:', error);
      return false;
    }
  }, []);

  const deleteTemoin = useCallback(async (id) => {
    try {
      await axios.delete(`/api/superadmin/temoins/${id}/`);
      message.success('Témoin supprimé avec succès');
      return true;
    } catch (error) {
      message.error('Erreur lors de la suppression');
      console.error(error);
      return false;
    }
  }, []);

  const validateTemoin = useCallback(async (id) => {
    try {
      await axios.post(`/api/temoins/${id}/valider/`);
      message.success('Témoin validé avec succès');
      return true;
    } catch (error) {
      message.error(error.response?.data?.error || 'Erreur lors de la validation');
      console.error(error);
      return false;
    }
  }, []);

  return {
    temoins,
    loading,
    pagination,
    fetchTemoins,
    createTemoin,
    updateTemoin,
    deleteTemoin,
    validateTemoin
  };
};

