import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
import loader from '../assets/loading.gif'


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // prevent blank screen on first render


    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem("user");
            const token = sessionStorage.getItem("token");

            if (storedUser && token) {
                // ✅ Safe parse
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("AuthContext error:", error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false); // ✅ always run
        }
    }, []);


    const fetchUsers = async () => {
        try {
            const res = await axios.get('https://labsync-lab-reporting-system-backend.onrender.com/api/users/all');
            setUsers(res.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const deleteUser = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`https://labsync-lab-reporting-system-backend.onrender.com/api/users/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleLogout = ()=>{
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser({})
        console.log('logged out successfully')
    }

    if (loading) {
        return <div className='flex h-screen justify-center items-center text-gray-600 text-2xl'><img className='w-9 mr-4 ' src={loader} alt="" /> Loading</div>; // ✅ avoids blank login page
    }


    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated,
            setIsAuthenticated,
            users,
            fetchUsers,
            deleteUser,
            handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
