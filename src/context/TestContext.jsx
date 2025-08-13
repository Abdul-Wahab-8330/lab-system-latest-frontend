import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const TestContext = createContext();


export const TestProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tests/all');
      setTests(res.data.tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };


  const deleteTest = async (id) => {
    await axios.delete(`http://localhost:5000/api/tests/delete/${id}`);
    setTests(tests.filter(test => test._id !== id));
  };

  const updateTest = async (id, data) => {
    const res = await axios.put(`http://localhost:5000/api/tests/update/${id}`, data);
    setTests(tests.map(test => (test._id === id ? res.data : test)));
  };



  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <TestContext.Provider value={{ tests, setTests, loading, fetchTests, setLoading, deleteTest, updateTest }}>
      {children}
    </TestContext.Provider>
  );
};
