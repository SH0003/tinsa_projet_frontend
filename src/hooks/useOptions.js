import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import axios from '../utils/axios';

/**
 * Custom hook for managing application options (type_operation, orientation, etc.)
 */
export const useOptions = () => {
  const [options, setOptions] = useState({
    type_operation: [],
    orientation: [],
    niveau_standing: [],
    etat_conservation: [],
    source_temoin: []
  });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchOptions = useCallback(async () => {
    if (loaded) return; // Don't reload if already loaded

    setLoading(true);
    try {
      const response = await axios.get('/api/temoins/options/');
      setOptions(response.data);
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching options:', error);
      message.error('Erreur lors du chargement des options');
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const getLabel = useCallback((fieldName, value) => {
    if (!value || !options[fieldName]) return value || 'N/A';
    const option = options[fieldName].find(opt => opt.value === value);
    return option ? option.label : value;
  }, [options]);

  return {
    options,
    loading,
    getLabel
  };
};

