

import { useContext, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { User, Lock, FlaskConical, Microscope, TestTube2, Activity, Loader2, Eye, EyeOff } from 'lucide-react';

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        userName,
        password
      });

      if (res.data.success) {
        // Store user data securely in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', res.data.token);
        setIsAuthenticated(true);
        setUser(res.data.user);
        console.log('Login successful');

        // Redirect to dashboard/home
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full md:px-20 px-8">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full border border-blue-100 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
        
        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-full shadow-lg">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Lab Access Portal
          </h2>
          <p className="text-gray-600 font-medium">
            Secure login to your laboratory reporting system
          </p>
          
          {/* Lab Icons Decoration */}
          <div className="flex items-center justify-center gap-6 mt-6 opacity-20">
            <Microscope className="w-6 h-6 text-blue-500" />
            <TestTube2 className="w-6 h-6 text-cyan-500" />
            <Activity className="w-6 h-6 text-teal-500" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {/* Username Field */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Laboratory Username
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your lab username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Laboratory Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100" 
            type="submit"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Accessing Lab System...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Access Laboratory
              </div>
            )}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 relative z-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium text-center flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            <span>Secure • Encrypted</span>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;