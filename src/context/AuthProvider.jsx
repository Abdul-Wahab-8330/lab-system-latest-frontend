import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState([]);


    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to parse user data from sessionStorage:", error);
                setUser(null);
                setIsAuthenticated(false);
            }
        }
    }, []);


    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/all');
            setUsers(res.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };




    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated,
            setIsAuthenticated,
            users,
            fetchUsers,
            deleteUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
