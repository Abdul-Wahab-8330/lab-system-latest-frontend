import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";

export const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/expenses`);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error("fetchExpenses error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const addExpense = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/api/expenses`, payload);
      if (res.data.success) {
        await fetchExpenses();
        return res.data.expense;
      }
    } catch (err) {
      console.error("addExpense error:", err);
      throw err;
    }
  };

  // Update expense
  const updateExpense = async (id, payload) => {
    try {
      const res = await axios.put(`${API_URL}/api/expenses/${id}`, payload);
      if (res.data.success) {
        await fetchExpenses();
        return res.data.expense;
      }
    } catch (err) {
      console.error("updateExpense error:", err);
      throw err;
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/api/expenses/${id}`);
      if (res.data.success) {
        await fetchExpenses();
      }
    } catch (err) {
      console.error("deleteExpense error:", err);
      throw err;
    }
  };

  // Fetch expenses by date range
  const fetchExpensesByDateRange = async (startDate, endDate) => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses/date-range`, {
        params: { startDate, endDate }
      });
      return res.data.expenses || [];
    } catch (err) {
      console.error("fetchExpensesByDateRange error:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchExpensesByDateRange
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}