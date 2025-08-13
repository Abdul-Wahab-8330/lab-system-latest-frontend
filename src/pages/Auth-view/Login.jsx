import { useContext, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, setUser } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        userName,
        password
      }
      );

      if (res.data.success) {
        // Store user data securely in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', JSON.stringify(res.data.token));
        setIsAuthenticated(true);
        setUser(res.data.user)
        console.log('Login successful');
        console.log('userData', res.data);

        // Redirect to dashboard/home
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="flex items-center justify-center w-full md:px-20 px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full ">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-2">Welcome Back 👏</h2>
        <h5 className="text-sm font-medium text-center text-purple-700 mb-6">Please enter your credentials to login</h5>
        <form onSubmit={handleLogin} className="space-y-4 w-full">
          <Label className='text-gray-600'>Username</Label>
          <Input
            type="text"
            placeholder="Enter Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <Label className='text-gray-600'>Password</Label>
          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <Button disabled={loading} style={{ backgroundColor: '#7B1FA2' }} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold " type="submit">
            {loading ? 'Signing In...' : 'Login'}
          </Button>
        </form>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">
            {error}
          </p>
        )}
      </div>
    </div>

  );
}

export default Login;
