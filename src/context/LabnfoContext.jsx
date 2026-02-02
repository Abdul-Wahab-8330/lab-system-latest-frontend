


import axios from '../api/axiosInstance';
import { createContext, useState, useEffect } from 'react';

export const LabInfoContext = createContext();

export const LabInfoProvider = ({ children }) => {
    const [info, setInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabInfo = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/lab-info`);
                setInfo(res.data || {});
            } catch (error) {
                console.error('Error fetching lab info:', error);
                // Set default fallback
                setInfo({
                    labName: 'LabSync Pro'
                });

            } finally {
                setLoading(false); // ✅ Always set to false
            }
        };

        fetchLabInfo();
    }, []); // Fetch once on mount

    return (
        <LabInfoContext.Provider value={{ info, loading }}>
            {children}
        </LabInfoContext.Provider>
    );
};