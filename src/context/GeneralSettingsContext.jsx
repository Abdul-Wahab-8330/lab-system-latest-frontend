import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from './AuthProvider';

export const GeneralSettingsContext = createContext();

export function GeneralSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    printShowHeader: true,
    printShowFooter: true,
    headerTopMargin: 0,
    tableWidthMode: 'smart'
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchSettings = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/general-settings`);
      setSettings(res.data);
    } catch (error) {
      console.error('Error fetching general settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates, updatedBy = 'Admin') => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/general-settings`,
        { ...updates, updatedBy }
      );
      setSettings(res.data);
      return res.data;
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  return (
    <GeneralSettingsContext.Provider 
      value={{ 
        settings, 
        loading, 
        fetchSettings,
        updateSettings 
      }}
    >
      {children}
    </GeneralSettingsContext.Provider>
  );
}