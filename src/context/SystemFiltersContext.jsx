import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { socket } from '@/socket';

export const SystemFiltersContext = createContext();

export function SystemFiltersProvider({ children }) {
  const [filters, setFilters] = useState({
    registration: { daysLimit: null, isActive: false },
    payment: { daysLimit: null, isActive: false },
    results: { daysLimit: null, isActive: false }
  });
  const [loading, setLoading] = useState(false);

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/filters`);
      const filtersData = res.data;
      
      // Convert array to object for easy access
      const filtersObj = {};
      filtersData.forEach(f => {
        filtersObj[f.filterType] = {
          daysLimit: f.daysLimit,
          isActive: f.isActive,
          updatedBy: f.updatedBy,
          updatedAt: f.updatedAt
        };
      });
      
      setFilters(filtersObj);
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();

    // Listen for real-time filter updates via socket
    socket.on('filterUpdated', (data) => {
      console.log('Filter updated via socket:', data);
      fetchFilters();
    });

    return () => {
      socket.off('filterUpdated');
    };
  }, []);

  // Helper function to check if date passes filter
  const checkDateFilter = (dateString, filterType) => {
    const filter = filters[filterType];
    
    if (!filter || !filter.isActive || !filter.daysLimit) {
      return true; // No filter active, allow all
    }

    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - filter.daysLimit);
    filterDate.setHours(0, 0, 0, 0);

    const itemDate = new Date(dateString);
    itemDate.setHours(0, 0, 0, 0);

    return itemDate >= filterDate;
  };

  return (
    <SystemFiltersContext.Provider 
      value={{ 
        filters, 
        loading, 
        fetchFilters,
        checkDateFilter 
      }}
    >
      {children}
    </SystemFiltersContext.Provider>
  );
}