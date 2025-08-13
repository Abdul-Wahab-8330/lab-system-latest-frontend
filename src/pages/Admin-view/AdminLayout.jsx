import { Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider";


function AdminLayout() {

    const {setIsAuthenticated, setUser} = useContext(AuthContext)

    const handleLogout = ()=>{
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser({})
        console.log('logged out successfully')
    }

    return (
        <>
            {/* Top Navbar */}
            <div className=" w-full border-b border-purple-400 flex justify-between items-center px-8 bg-gradient-to-br from-[#1f1b2e] via-[#2a223d] to-[#3a2b58] h-16 backdrop-blur-md shadow-md">
                {/* Gradient heading */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 text-transparent bg-clip-text">
                    XSystems
                </h1>

                {/* Logout button */}
                <button
                    className="hover:scale-105 transition-transform"
                    title="Logout"
                >
                    <LogOut onClick={handleLogout} style={{backgroundColor:'#7B1FA2'}} className="text-purple-300 hover:text-red-400 border-2  p-2 h-9 w-9 rounded-full" />
                </button>

            </div>

            {/* Page Content */}
            <div className="h-[calc(100vh-4rem)] w-full ">
                <Outlet />
            </div>
        </>
    );
}

export default AdminLayout;
