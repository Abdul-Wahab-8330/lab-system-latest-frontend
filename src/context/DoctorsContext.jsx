import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DoctorsContext = createContext();

export function DoctorsProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`);
      setDoctors(res.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <DoctorsContext.Provider value={{ doctors, loading, fetchDoctors }}>
      {children}
    </DoctorsContext.Provider>
  );
}