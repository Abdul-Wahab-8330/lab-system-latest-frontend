import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axiosInstance';
import { getPasswordStrength } from '@/utils/passwordStrength';

const ChangePassword = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ============================================
  // PASSWORD STRENGTH INDICATOR
  // ============================================
  const passwordStrength = getPasswordStrength(newPassword);

  // ============================================
  // FORM VALIDATION
  // ============================================
  const validateForm = () => {
    // Check all fields are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return false;
    }

    // Check minimum length
    if (newPassword.length < 3) {
      toast.error('Password must be at least 3 characters long');
      return false;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }

    // Check new password is different from current
    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return false;
    }

    return true;
  };

  // ============================================
  // HANDLE FORM SUBMISSION
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/change-password`,
        {
          userId: user.id,
          currentPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        toast.success('Password changed successfully! Please login again.');
        
        // Auto-logout for security (user must login with new password)
        setTimeout(() => {
          handleLogout();
          navigate('/auth/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Main Card */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex gap-3 ">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-purple-500 rounded-xl">
                <Lock className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl flex justify-center items-center font-bold text-white text-center">Change Password</h1>
          </div>

          {/* Form Content */}
          <CardContent className="p-8">
            {/* User Info Badge */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Changing password for</p>
                  <p className="font-semibold text-gray-900">{user?.name} (@{user?.userName})</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password Field */}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-semibold text-gray-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password (min 3 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Strength:</span>
                    <span className={`text-sm font-semibold ${passwordStrength.color}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {newPassword === confirmPassword ? (
                      <span className="text-sm text-green-600 font-medium">✓ Passwords match</span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">✗ Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full border h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;