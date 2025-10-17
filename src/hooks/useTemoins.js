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
      message.error('Erreur lors de la création');
      console.error(error);
      return false;
    }
  }, []);

  const updateTemoin = useCallback(async (id, values) => {
    try {
      await axios.put(`/api/superadmin/temoins/${id}/`, values);
      message.success('Témoin mis à jour avec succès');
      return true;
    } catch (error) {
      message.error('Erreur lors de la mise à jour');
      console.error(error);
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

