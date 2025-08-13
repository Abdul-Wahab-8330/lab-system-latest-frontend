import { Outlet } from 'react-router-dom';
import { Landmark } from 'lucide-react';

const AuthLayout = () => {


    
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side */}
            <div className="hidden lg:flex justify-center items-center bg-gradient-to-br from-purple-600 to-indigo-700 w-1/2 px-12 text-white">
                <div className="max-w-lg text-center space-y-6">
                    <h1 className="text-5xl font-extrabold">Welcome to XSystems</h1>
                    <p className="text-lg text-purple-100">XSystems - Secure Login and Access</p>
                    <div className="flex justify-center">
                        <Landmark className="w-24 h-24 text-white opacity-80" />
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-1 items-center justify-center bg-purple-50 px-4 py-12 sm:px-6 lg:px-8">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
