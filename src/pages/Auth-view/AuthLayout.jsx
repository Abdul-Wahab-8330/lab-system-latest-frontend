// import { Outlet } from 'react-router-dom';
// import { Landmark } from 'lucide-react';

// const AuthLayout = () => {


    
//     return (
//         <div className="flex min-h-screen w-full">
//             {/* Left Side */}
//             <div className="hidden lg:flex justify-center items-center bg-gradient-to-br from-purple-600 to-indigo-700 w-1/2 px-12 text-white">
//                 <div className="max-w-lg text-center space-y-6">
//                     <h1 className="text-5xl font-extrabold">Welcome to XSystems</h1>
//                     <p className="text-lg text-purple-100">XSystems - Secure Login and Access</p>
//                     <div className="flex justify-center">
//                         <Landmark className="w-24 h-24 text-white opacity-80" />
//                     </div>
//                 </div>
//             </div>

//             {/* Right Side */}
//             <div className="flex flex-1 items-center justify-center bg-purple-50 px-4 py-12 sm:px-6 lg:px-8">
//                 <Outlet />
//             </div>
//         </div>
//     );
// };

// export default AuthLayout;






import { Outlet } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

const AuthLayout = () => {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Enhanced Design */}
            <div className="hidden lg:flex justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 w-1/2 px-12 text-white relative overflow-hidden">
                {/* Enhanced Background Patterns */}
                <div className="absolute inset-0">
                    {/* Hexagon Pattern */}
                    <div className="absolute inset-0 opacity-15" style={{
                        backgroundImage: `
                            radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 2px),
                            radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px, 100px 100px'
                    }}></div>

                    {/* Molecular Structure Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="molecules" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                                    <circle cx="20" cy="20" r="2" fill="white" opacity="0.3"/>
                                    <circle cx="60" cy="40" r="1.5" fill="white" opacity="0.2"/>
                                    <circle cx="100" cy="80" r="2.5" fill="white" opacity="0.25"/>
                                    <line x1="20" y1="20" x2="60" y2="40" stroke="white" strokeWidth="0.5" opacity="0.2"/>
                                    <line x1="60" y1="40" x2="100" y2="80" stroke="white" strokeWidth="0.5" opacity="0.2"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#molecules)"/>
                        </svg>
                    </div>

                    {/* Animated Lab Equipment Silhouettes */}
                    <div className="absolute top-10 right-10 opacity-5">
                        <div className="w-16 h-16 border border-white rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
                    </div>
                    <div className="absolute bottom-20 left-10 opacity-5">
                        <div className="w-12 h-12 border border-white rounded animate-pulse" style={{animationDuration: '3s'}}></div>
                    </div>
                    
                    {/* Floating Particles - More */}
                    <div className="absolute top-16 left-16 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
                    <div className="absolute top-28 right-28 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-ping"></div>
                    <div className="absolute top-44 left-32 w-1 h-1 bg-blue-300 rounded-full opacity-50 animate-pulse delay-500"></div>
                    <div className="absolute bottom-32 left-12 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-50 animate-pulse delay-1000"></div>
                    <div className="absolute bottom-48 right-16 w-1 h-1 bg-white rounded-full opacity-30 animate-ping delay-500"></div>
                    <div className="absolute bottom-64 right-32 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse delay-700"></div>
                    <div className="absolute top-52 right-12 w-1.5 h-1.5 bg-white rounded-full opacity-35 animate-ping delay-300"></div>
                    <div className="absolute top-72 left-24 w-1 h-1 bg-blue-300 rounded-full opacity-45 animate-pulse delay-900"></div>
                    
                    {/* Enhanced Gradient Orbs */}
                    <div className="absolute top-1/4 -left-20 w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
                    <div className="absolute bottom-1/4 -right-20 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-15 blur-xl"></div>
                    <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-10 blur-lg"></div>
                </div>

                {/* Enhanced Grid Pattern */}
                <div className="absolute inset-0 opacity-8" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(45deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px, 40px 40px, 80px 80px'
                }}></div>

                {/* Main Content */}
                <div className="max-w-sm text-center space-y-6 z-10 relative">
                    {/* Logo Section */}
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <div className="relative">
                                {/* Icon Background with Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-white/20 to-white/10 p-5 rounded-full backdrop-blur-sm border border-white/20">
                                    <FlaskConical className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Brand Name */}
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                LabSync
                            </h1>
                            <p className="text-sm text-blue-200 font-medium">Laboratory Management System</p>
                        </div>
                    </div>

                    {/* Simple Description */}
                    <p className="text-base text-blue-100 leading-relaxed">
                        Secure access to your laboratory platform
                    </p>
                </div>
            </div>

            {/* Right Side - Enhanced Pattern */}
            <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-white  py-12 sm:px-6 lg:px-8 relative">
                {/* Enhanced Pattern Background */}
                <div className="absolute inset-0">
                    {/* Primary Dot Pattern */}
                    <div className="absolute inset-0 opacity-40" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59,130,246,0.15) 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }}></div>
                    
                    {/* Secondary Dot Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 0.5px, transparent 0)',
                        backgroundSize: '16px 16px'
                    }}></div>

                    {/* Diagonal Lines Pattern */}
                    <div className="absolute inset-0 opacity-15" style={{
                        backgroundImage: `
                            linear-gradient(45deg, rgba(59,130,246,0.08) 1px, transparent 1px),
                            linear-gradient(-45deg, rgba(59,130,246,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px, 20px 20px'
                    }}></div>

                    {/* Circuit-like Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                    <rect x="38" y="0" width="2" height="20" fill="rgb(59,130,246)" opacity="0.3"/>
                                    <rect x="0" y="38" width="20" height="2" fill="rgb(59,130,246)" opacity="0.3"/>
                                    <rect x="60" y="38" width="20" height="2" fill="rgb(59,130,246)" opacity="0.3"/>
                                    <rect x="38" y="60" width="2" height="20" fill="rgb(59,130,246)" opacity="0.3"/>
                                    <circle cx="40" cy="40" r="3" fill="none" stroke="rgb(59,130,246)" strokeWidth="1" opacity="0.2"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#circuit)"/>
                        </svg>
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="flex flex-1 items-center justify-center bg-white ">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;