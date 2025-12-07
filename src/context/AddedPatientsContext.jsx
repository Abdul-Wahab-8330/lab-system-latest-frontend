import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from './AuthProvider'; // ✅ Import AuthContext


export const AddedPatientsContext = createContext();

export function AddedPatientsProvider({ children }) {
  const [addedPatients, setAddedPatients] = useState([]);
  const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useContext(AuthContext); 

  const fetchAddedPatients = async () => {
      if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/results/added`);
      setAddedPatients(res.data || []);
    } catch (err) {
      console.error("fetchPatients err:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if(isAuthenticated){
      fetchAddedPatients();
    }
  }, []);

  return (
    <AddedPatientsContext.Provider value={{ addedPatients, setAddedPatients, loading, fetchAddedPatients }}>
      {children}
    </AddedPatientsContext.Provider>
  );
}
