import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from './AuthProvider'; // ✅ Import AuthContext

export const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(false);
      const { isAuthenticated, user } = useContext(AuthContext); // ✅ Get auth state


  const API_URL = import.meta.env.VITE_API_URL;

  // ============================================
  // INVENTORY ITEMS
  // ============================================

  const fetchItems = async () => {
      if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/inventory/items`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("fetchItems error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/api/inventory/items`, payload);
      if (res.data.success) {
        await fetchItems();
        return res.data.item;
      }
    } catch (err) {
      console.error("createItem error:", err);
      throw err;
    }
  };

  const updateItem = async (id, payload) => {
    try {
      const res = await axios.put(`${API_URL}/api/inventory/items/${id}`, payload);
      if (res.data.success) {
        await fetchItems();
        return res.data.item;
      }
    } catch (err) {
      console.error("updateItem error:", err);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/api/inventory/items/${id}`);
      if (res.data.success) {
        await fetchItems();
      }
    } catch (err) {
      console.error("deleteItem error:", err);
      throw err;
    }
  };

  // ============================================
  // TRANSACTIONS
  // ============================================

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/inventory/transactions`);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("fetchTransactions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/api/inventory/transactions/add`, payload);
      if (res.data.success) {
        await fetchTransactions();
        await fetchStockLevels();
        return res.data.transaction;
      }
    } catch (err) {
      console.error("addStock error:", err);
      throw err;
    }
  };

  const removeStock = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/api/inventory/transactions/remove`, payload);
      if (res.data.success) {
        await fetchTransactions();
        await fetchStockLevels();
        return res.data.transaction;
      }
    } catch (err) {
      console.error("removeStock error:", err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/api/inventory/transactions/${id}`);
      if (res.data.success) {
        await fetchTransactions();
        await fetchStockLevels();
      }
    } catch (err) {
      console.error("deleteTransaction error:", err);
      throw err;
    }
  };

  const fetchTransactionsByDateRange = async (startDate, endDate) => {
    try {
      const res = await axios.get(`${API_URL}/api/inventory/transactions/report`, {
        params: { startDate, endDate }
      });
      return res.data.transactions || [];
    } catch (err) {
      console.error("fetchTransactionsByDateRange error:", err);
      throw err;
    }
  };

  // ============================================
  // STOCK LEVELS
  // ============================================

  const fetchStockLevels = async () => {
  setLoading(true);
  try {
    // Use the new endpoint that includes totals
    const res = await axios.get(`${API_URL}/api/inventory/stock-levels-with-totals`);
    setStockLevels(res.data.stockLevels || []);
  } catch (err) {
    console.error("fetchStockLevels error:", err);
  } finally {
    setLoading(false);
  }
};


  const fetchStockLevelsWithTotals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inventory/stock-levels-with-totals`);
      return response.data.stockLevels;
    } catch (error) {
      console.error('Error fetching stock levels with totals:', error);
      throw error;
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inventory/daily-summary`);
      return response.data.dailySummary;
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      throw error;
    }
  };





  useEffect(() => {
    if(isAuthenticated){
      fetchItems();
      fetchTransactions();
      fetchStockLevels(); 
    }
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        items,
        transactions,
        stockLevels,
        loading,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
        fetchTransactions,
        addStock,
        removeStock,
        deleteTransaction,
        fetchTransactionsByDateRange,
        fetchStockLevels,
        fetchStockLevelsWithTotals,
        fetchDailySummary
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}