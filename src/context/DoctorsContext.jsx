import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from './AuthProvider'; // ✅ Import AuthContext

export const DoctorsContext = createContext();

export function DoctorsProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useContext(AuthContext); // ✅ Get auth state


  const fetchDoctors = async () => {
      if (!isAuthenticated) return;
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
    if(isAuthenticated){
      fetchDoctors();
    }
  }, []);

  return (
    <DoctorsContext.Provider value={{ doctors, loading, fetchDoctors }}>
      {children}
    </DoctorsContext.Provider>
  );
}