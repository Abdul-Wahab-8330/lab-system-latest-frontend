import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";

export const AddedPatientsContext = createContext();

export function AddedPatientsProvider({ children }) {
  const [addedPatients, setAddedPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAddedPatients = async () => {
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
    fetchAddedPatients();
  }, []);

  return (
    <AddedPatientsContext.Provider value={{ addedPatients, setAddedPatients, loading, fetchAddedPatients }}>
      {children}
    </AddedPatientsContext.Provider>
  );
}
