import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing filters state and logic
 */
export const useFilters = (temoins) => {
  const [filters, setFilters] = useState({
    validation: null,
    region: null,
    province: null,
    commune: null,
    typeOperation: null,
    typologie: null,
    dateStart: null,
    dateEnd: null
  });

  // Handle filter change
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      validation: null,
      region: null,
      province: null,
      commune: null,
      typeOperation: null,
      typologie: null,
      dateStart: null,
      dateEnd: null
    });
  }, []);

  // Apply filters to temoins data
  const filteredTemoins = useMemo(() => {
    if (!temoins || temoins.length === 0) return [];

    let filtered = [...temoins];

    // Filter by validation status
    if (filters.validation !== null) {
      filtered = filtered.filter(t => t.is_validated === filters.validation);
    }

    // Filter by region
    if (filters.region) {
      filtered = filtered.filter(t => t.region === filters.region);
    }

    // Filter by province
    if (filters.province) {
      filtered = filtered.filter(t => t.province === filters.province);
    }

    // Filter by commune
    if (filters.commune) {
      filtered = filtered.filter(t => t.commune === filters.commune);
    }

    // Filter by type operation
    if (filters.typeOperation) {
      filtered = filtered.filter(t => t.type_operation === filters.typeOperation);
    }

    // Filter by typologie
    if (filters.typologie) {
      filtered = filtered.filter(t => t.typologie_bien === filters.typologie);
    }

    // Filter by date start
    if (filters.dateStart) {
      const startDate = filters.dateStart.startOf('day').toDate();
      filtered = filtered.filter(t => 
        t.date_transaction && new Date(t.date_transaction) >= startDate
      );
    }

    // Filter by date end
    if (filters.dateEnd) {
      const endDate = filters.dateEnd.endOf('day').toDate();
      filtered = filtered.filter(t => 
        t.date_transaction && new Date(t.date_transaction) <= endDate
      );
    }

    return filtered;
  }, [temoins, filters]);

  // Extract unique typologies from temoins
  const uniqueTypologies = useMemo(() => 
    [...new Set(temoins?.map(t => t.typologie_bien).filter(Boolean) || [])],
    [temoins]
  );

  return {
    filters,
    filteredTemoins,
    uniqueTypologies,
    handleFilterChange,
    resetFilters
  };
};

