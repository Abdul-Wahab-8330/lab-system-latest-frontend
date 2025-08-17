import { ShieldX, FlaskConical, ArrowLeft, RefreshCw } from 'lucide-react';

function UnauthPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute inset-0">
                {/* Molecular Structure Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="molecules-error" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="2" fill="white" opacity="0.3"/>
                                <circle cx="60" cy="40" r="1.5" fill="white" opacity="0.2"/>
                                <circle cx="100" cy="80" r="2.5" fill="white" opacity="0.25"/>
                                <line x1="20" y1="20" x2="60" y2="40" stroke="white" strokeWidth="0.5" opacity="0.2"/>
                                <line x1="60" y1="40" x2="100" y2="80" stroke="white" strokeWidth="0.5" opacity="0.2"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#molecules-error)"/>
                    </svg>
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-8" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Floating Particles */}
                <div className="absolute top-20 left-20 w-1 h-1 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-32 right-32 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-ping"></div>
                <div className="absolute bottom-40 left-16 w-1 h-1 bg-red-300 rounded-full opacity-50 animate-pulse delay-1000"></div>
                <div className="absolute bottom-60 right-20 w-1.5 h-1.5 bg-white rounded-full opacity-30 animate-ping delay-500"></div>

                {/* Gradient Orbs */}
                <div className="absolute top-1/4 -left-20 w-40 h-40 bg-gradient-to-r from-red-500 to-orange-600 rounded-full opacity-15 blur-xl"></div>
                <div className="absolute bottom-1/4 -right-20 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-10 blur-xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center space-y-8 max-w-lg">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        {/* Pulsing Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-full blur opacity-40 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-full backdrop-blur-sm border border-red-400/30">
                            <ShieldX className="w-16 h-16 text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                        Access Denied
                    </h1>
                    <p className="text-xl text-red-200 leading-relaxed">
                        Authentication Error
                    </p>
                    <p className="text-sm text-blue-200 opacity-80 max-w-md mx-auto">
                        Your session has expired or you don't have permission to access the LabSync system. Please contact your administrator or try logging in again.
                    </p>
                </div>

                {/* LabSync Branding */}
                <div className="flex items-center justify-center space-x-3 opacity-60">
                    <FlaskConical className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-blue-300 font-medium">LabSync</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 border border-blue-500/30 backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Go Back</span>
                    </button>
                    
                    <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 text-white rounded-lg hover:from-white/15 hover:to-white/10 transition-all duration-200 border border-white/20 backdrop-blur-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                    </button>
                </div>

                {/* Bottom Decorative Line */}
                <div className="pt-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent"></div>
                </div>
            </div>
        </div>
    );
}

export default UnauthPage;