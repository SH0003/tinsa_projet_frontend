import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import axios from '../utils/axios';

/**
 * Custom hook for managing geographic data (regions, provinces, communes)
 */
export const useGeographicData = () => {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  
  const [regionsLoaded, setRegionsLoaded] = useState(false);

  // Fetch regions (only once)
  const fetchRegions = useCallback(async () => {
    if (regionsLoaded) return;

    setLoadingRegions(true);
    try {
      const response = await axios.get('/api/geographic-data/?action=regions');
      setRegions(response.data.regions);
      setRegionsLoaded(true);
    } catch (error) {
      console.error('Error fetching regions:', error);
      message.error('Erreur lors du chargement des régions');
    } finally {
      setLoadingRegions(false);
    }
  }, [regionsLoaded]);

  // Auto-fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Fetch provinces for a region
  const fetchProvinces = useCallback(async (region) => {
    if (!region) {
      setProvinces([]);
      return;
    }

    setLoadingProvinces(true);
    try {
      const response = await axios.get(
        `/api/geographic-data/?action=provinces&region=${encodeURIComponent(region)}`
      );
      setProvinces(response.data.provinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      message.error('Erreur lors du chargement des provinces');
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  // Fetch communes for a province
  const fetchCommunes = useCallback(async (region, province) => {
    if (!region || !province) {
      setCommunes([]);
      return;
    }

    setLoadingCommunes(true);
    try {
      const response = await axios.get(
        `/api/geographic-data/?action=communes&region=${encodeURIComponent(region)}&province=${encodeURIComponent(province)}`
      );
      setCommunes(response.data.communes);
    } catch (error) {
      console.error('Error fetching communes:', error);
      message.error('Erreur lors du chargement des communes');
      setCommunes([]);
    } finally {
      setLoadingCommunes(false);
    }
  }, []);

  // Reset provinces and communes
  const resetProvinces = useCallback(() => {
    setProvinces([]);
    setCommunes([]);
  }, []);

  const resetCommunes = useCallback(() => {
    setCommunes([]);
  }, []);

  return {
    regions,
    provinces,
    communes,
    loadingRegions,
    loadingProvinces,
    loadingCommunes,
    fetchProvinces,
    fetchCommunes,
    resetProvinces,
    resetCommunes
  };
};

