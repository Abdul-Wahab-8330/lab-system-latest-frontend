import { UserAvatar } from '@/components/UserAvatar';
import { AuthContext } from '@/context/AuthProvider';
import { LogOut } from 'lucide-react'
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { Outlet } from 'react-router-dom'

const UserLayout = () => {

    const {setIsAuthenticated, setUser} = useContext(AuthContext)

    const handleLogout = ()=>{
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser({})
        console.log('logged out successfully')
    }

    return (
        <div className='flex flex-col min-h-screen w-full'>
            <div className='h-16 w-full border-b flex items-center justify-between px-6'>
                <div className=' '>
                    <div className="text-center bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent flex items-center justify-center font-bold text-3xl">
                        <strong>XSystems</strong>
                    </div>
                </div>
                <UserAvatar/>
                {/* <button
                    className="hover:scale-105 transition-transform"
                    title="Logout"
                >
                    <LogOut onClick={handleLogout} className="text-purple-800 hover:text-red-400 border-2 border-purple-400 p-2 h-9 w-9 rounded-full" />
                </button> */}
            </div>

            <div className=' bg-background '>
                <Outlet />
            </div>

        </div>
        
    )
}

export default UserLayout
