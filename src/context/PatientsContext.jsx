import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axiosInstance";
import { socket } from "@/socket";
import toast from "react-hot-toast";
import { AuthContext } from './AuthProvider';

export const PatientsContext = createContext();

export function PatientsProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true); // Start as true
  const { isAuthenticated } = useContext(AuthContext);

  const fetchPatients = async () => {
    // If not authenticated, immediately set loading to false and return
    if (!isAuthenticated) {
      setLoading(false);
      setPatients([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients`);
      setPatients(res.data || []);
    } catch (err) {
      console.error("fetchPatients err:", err);
      setPatients([]);
    } finally {
      setLoading(false); // ✅ CRITICAL: Always set to false
    }
  };

  const addPatientLocal = (patient) => setPatients(prev => [patient, ...prev]);

  const createPatient = async (payload) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/patients`, payload);
    if (res.status === 201 || res.status === 200) {
      addPatientLocal(res.data);
      return res.data;
    }
    throw new Error("Failed to create patient");
  };

  // ✅ Fetch when auth state changes or component mounts
  useEffect(() => {
    fetchPatients();
  }, [isAuthenticated]);

  // Socket listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    let debounceTimer;

    socket.on('patientRegistered', (data) => {
      console.log('Socket received:', data.patient.name);
      toast(`New patient registered: ${data.patient.name}`);

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchPatients();
      }, 500);
    });

    socket.on('patientDeleted', (data) => {
      console.log('Patient deleted:', data.patientName);
      fetchPatients();
      toast.error(`Patient deleted: ${data.patientName}`);
    });

    socket.on('resultAdded', (data) => {
      if (data.triggeredBySocketId === socket.id) {
        console.log('✅ Ignoring my own resultAdded event');
        return;
      }
      console.log('Result added for patient:', data.patientId);
      fetchPatients();
      toast.success(`Results updated for patient: ${data.patientName}`);
    });

    socket.on('resultReset', (data) => {
      console.log('Result reset for patient:', data.patientId);
      fetchPatients();
      toast(`Results reset for patient: ${data.patientName}`);
    });

    socket.on('paymentStatusUpdated', (data) => {
      console.log('Payment status updated for patient:', data.patientId);
      fetchPatients();
      toast.success(`Payment updated: ${data.patientName} - ${data.paymentStatus}`);
    });

    return () => {
      socket.off('patientRegistered');
      socket.off('patientDeleted');
      socket.off('resultAdded');
      socket.off('resultReset');
      socket.off('paymentStatusUpdated');
      clearTimeout(debounceTimer);
    };
  }, [isAuthenticated]);

  return (
    <PatientsContext.Provider value={{ patients, setPatients, loading, fetchPatients, createPatient }}>
      {children}
    </PatientsContext.Provider>
  );
}