// import { createContext, useContext, useEffect, useState } from 'react';
// import axios from '../api/axiosInstance';
// import { AuthContext } from './AuthProvider'; // ✅ Import AuthContext

// export const TestContext = createContext();


// export const TestProvider = ({ children }) => {
//   const [tests, setTests] = useState([]);
//   const [loading, setLoading] = useState(true);
//       const { isAuthenticated, user } = useContext(AuthContext); // ✅ Get auth state


//   const fetchTests = async () => {
//       if (!isAuthenticated) return;
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/all`);
//       setTests(res.data.tests);
//     } catch (error) {
//       console.error('Error fetching tests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const deleteTest = async (id) => {
//     await axios.delete(`${import.meta.env.VITE_API_URL}/api/tests/delete/${id}`);
//     setTests(tests.filter(test => test._id !== id));
//   };

//   const updateTest = async (id, data) => {
//     const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/tests/update/${id}`, data);
//     setTests(tests.map(test => (test._id === id ? res.data : test)));
//   };



//   useEffect(() => {
//     if (isAuthenticated){
//       fetchTests();
//     }
//   }, []);

//   return (
//     <TestContext.Provider value={{ tests, setTests, loading, fetchTests, setLoading, deleteTest, updateTest }}>
//       {children}
//     </TestContext.Provider>
//   );
// };








import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from './AuthProvider';

export const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true); // Start as true
  const { isAuthenticated } = useContext(AuthContext);

  const fetchTests = async () => {
    // If not authenticated, immediately set loading to false
    if (!isAuthenticated) {
      setLoading(false);
      setTests([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/all`);
      setTests(res.data.tests || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]);
    } finally {
      setLoading(false); // ✅ CRITICAL: Always set to false
    }
  };

  const deleteTest = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/tests/${id}`);
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/all`);
    setTests(res.data.tests || []);
  };

  const updateTest = async (id, updatedData) => {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/tests/update/${id}`, updatedData);
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/all`);
    setTests(res.data.tests || []);
  };

  // ✅ Fetch when auth changes
  useEffect(() => {
    fetchTests();
  }, [isAuthenticated]);

  return (
    <TestContext.Provider value={{ tests, deleteTest, updateTest, loading }}>
      {children}
    </TestContext.Provider>
  );
};