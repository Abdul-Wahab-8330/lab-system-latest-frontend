import axios from '../api/axiosInstance';
import { createContext, useState, useEffect } from 'react';

export const LabInfoContext = createContext();

export const LabInfoProvider = ({ children }) => {
    const [info, setInfo] = useState({});


    useEffect(() => {

        const fetchLabInfo = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/lab-info`);
                setInfo(res.data || {});
            } catch (error) {
                console.error('Error fetching lab info:', error);
            }
        };
        fetchLabInfo()
    }, []);


    return (
        <LabInfoContext.Provider value={{
            info,
        }}>
            {children}
        </LabInfoContext.Provider>
    );
};
