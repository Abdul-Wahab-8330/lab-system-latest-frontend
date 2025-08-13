import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const PatientsContext = createContext();

export function PatientsProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/patients");
      setPatients(res.data || []);
    } catch (err) {
      console.error("fetchPatients err:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPatientLocal = (patient) => setPatients(prev => [patient, ...prev]);

  const createPatient = async (payload) => {
    const res = await axios.post("http://localhost:5000/api/patients", payload);
    if (res.status === 201 || res.status === 200) {
      addPatientLocal(res.data);
      return res.data;
    }
    throw new Error("Failed to create patient");
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <PatientsContext.Provider value={{ patients, setPatients, loading, fetchPatients, createPatient }}>
      {children}
    </PatientsContext.Provider>
  );
}
