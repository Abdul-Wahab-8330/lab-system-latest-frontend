
import { useEffect, useState, useContext } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Users, User, Shield, AlertTriangle, Loader2, Key, Copy, Eye } from "lucide-react";
import { AuthContext } from "@/context/AuthProvider";
import toast from "react-hot-toast";
import { ROLES, getRoleDisplayName } from '@/utils/permissions';
import { SUPER_ADMIN_USERNAME } from '@/config/constants';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import axios from '../api/axiosInstance';

import { getPasswordStrength } from '@/utils/passwordStrength';

const UserList = () => {
  const { users, user, fetchUsers, deleteUser } = useContext(AuthContext);
  //user is the current loggedin user and user.username is to get username
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  // ============================================
  // STATE FOR RESET PASSWORD DIALOG
  // ============================================
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Filter out super admin for non-super admin users
  const filteredUsers = user?.userName === SUPER_ADMIN_USERNAME
    ? users
    : users.filter(u => u.userName !== SUPER_ADMIN_USERNAME);

  const totalAdmins = filteredUsers.filter(u => u.role === 'admin').length;

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    loadUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedUser) {
        setDeleting(true);
        await deleteUser(selectedUser._id);
        setDeleteDialogOpen(false);
        setDeleting(false);
        toast.success('User Deleted successfully')
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete user!')
    }
  };

  // ============================================
  // HANDLE RESET PASSWORD CLICK
  // ============================================
  const handleResetPasswordClick = (user) => {
    setResetPasswordUser(user);
    setResetPasswordDialogOpen(true);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordCopied(false);
  };

  // ============================================
  // COPY PASSWORD TO CLIPBOARD
  // ============================================
  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setPasswordCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setPasswordCopied(false), 3000);
    }
  };

  // ============================================
  // VALIDATE RESET PASSWORD FORM
  // ============================================
  const validateResetPassword = () => {
    if (!newPassword || !confirmNewPassword) {
      toast.error('Both password fields are required');
      return false;
    }

    if (newPassword.length < 3) {
      toast.error('Password must be at least 3 characters long');
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  // ============================================
  // CONFIRM RESET PASSWORD
  // ============================================
  const confirmResetPassword = async () => {
    // Validate form
    if (!validateResetPassword()) return;

    try {
      if (resetPasswordUser) {
        setResetting(true);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/reset-password`,
          {
            userId: resetPasswordUser._id,
            newPassword: newPassword,
          }
        );

        if (response.data.success) {
          toast.success(`Password reset successfully for ${resetPasswordUser.name}`);
          setResetPasswordDialogOpen(false);
          setNewPassword('');
          setConfirmNewPassword('');
          setResetting(false);
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      setResetting(false);
    }
  };

  const getRoleBadge = (userRole) => {
    const badgeConfig = {
      [ROLES.ADMIN]: {
        gradient: 'from-purple-500 to-indigo-600',
        icon: Shield
      },
      [ROLES.SENIOR_RECEPTIONIST]: {
        gradient: 'from-blue-500 to-cyan-600',
        icon: User
      },
      [ROLES.JUNIOR_RECEPTIONIST]: {
        gradient: 'from-cyan-500 to-blue-400',
        icon: User
      },
      [ROLES.SENIOR_LAB_TECH]: {
        gradient: 'from-green-500 to-emerald-600',
        icon: User
      },
      [ROLES.JUNIOR_LAB_TECH]: {
        gradient: 'from-emerald-500 to-green-400',
        icon: User
      }
    };

    const config = badgeConfig[userRole] || badgeConfig[ROLES.JUNIOR_RECEPTIONIST];
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${config.gradient} text-white shadow-sm`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {getRoleDisplayName(userRole)}
      </div>
    );
  };

  const getUserAvatar = (userName) => {
    const initial = userName?.charAt(0)?.toUpperCase() || 'U';
    return (
      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
        <span className="text-xs font-semibold text-white">{initial}</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        {/* <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage and monitor system users</p>

          </div>
        </div> */}



        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <div className="p-2 bg-indigo-500 rounded-xl mr-3">
                  <Users className="h-6 w-6" />
                </div>
                User Directory
              </h2>
              <div className="flex gap-4">
                {!loading && filteredUsers && filteredUsers.length > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-white font-medium text-sm">
                      {totalAdmins} {totalAdmins == 1 ? 'Admin' : 'Admins'} • {filteredUsers.filter(u => u.role === 'user' || u.role == 'senior_receptionist' || u.role == 'junior_receptionist' || u.role == 'senior_lab_tech' || u.role == 'junior_lab_tech').length} Users
                    </span>
                  </div>
                )}
                {!loading && users && (
                  <div className="inline-flex items-center px-4 py-2 bg-purple-500 rounded-xl shadow-sm text-white">
                    <Users className="h-4 w-4  mr-2" />
                    <span className="text-sm font-medium">
                      {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Total
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-12 w-12 border-4 border-gray-200 border-t-indigo-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Users...</h3>
                <p className="text-gray-500">Please wait while we fetch user data</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border-2 border-gray-100 shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-100">
                      <TableHead className="text-gray-800 font-bold text-sm uppercase tracking-wider py-6 px-6">
                        User Details
                      </TableHead>
                      <TableHead className="text-gray-800 font-bold text-sm uppercase tracking-wider py-6 px-6">
                        Username
                      </TableHead>
                      <TableHead className="text-gray-800 font-bold text-sm uppercase tracking-wider py-6 px-6">
                        Role & Access
                      </TableHead>
                      <TableHead className="text-right text-gray-800 font-bold text-sm uppercase tracking-wider py-6 px-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50">
                          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Users Found</h3>
                          <p className="text-gray-500">There are no users in the system yet.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u, index) => (
                        <TableRow
                          key={u._id}
                          className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                        >
                          <TableCell className="py-6 px-6">
                            <div className="flex items-center space-x-4">
                              {getUserAvatar(u.userName)}
                              <div>
                                <div className="text-sm font-bold text-gray-900">{u.name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ID: {u._id?.slice(-8) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-6">
                            <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg inline-block">
                              {u.userName}
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-6">
                            {getRoleBadge(u.role)}
                          </TableCell>

                          <TableCell className="text-right py-6 px-6">
                            {user?.userName === u.userName ? (
                              <div className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <User className="h-3 w-3 mr-1" />
                                Current User
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                {/* ✅ Reset Password Button - Only for Admin role */}
                                {user?.role === 'admin' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all duration-200 border border-transparent hover:border-indigo-200"
                                    onClick={() => handleResetPasswordClick(u)}
                                  >
                                    <Key className="h-4 w-4 mr-2" />
                                    Reset Password
                                  </Button>
                                )}

                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                                  onClick={() => handleDeleteClick(u)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          {selectedUser && (
            <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border-0 overflow-hidden">
              {/* Dialog Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center">
                    <div className="p-2 bg-red-400 rounded-lg mr-3">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    Confirm User Deletion
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Dialog Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete User Account
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {selectedUser.name}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
        {/* ============================================ */}
        {/* RESET PASSWORD DIALOG */}
        {/* ============================================ */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          {resetPasswordUser && (
            <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border-0 overflow-hidden">
              {/* Dialog Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center">
                    <div className="p-2 bg-indigo-400 rounded-lg mr-3">
                      <Key className="h-5 w-5" />
                    </div>
                    Reset User Password
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Dialog Content */}
              <div className="p-8">
                {/* User Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-white">
                        {resetPasswordUser.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Resetting password for</p>
                      <p className="font-semibold text-gray-900">
                        {resetPasswordUser.name} (@{resetPasswordUser.userName})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Form */}
                <div className="space-y-4 mb-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password (min 3 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-indigo-500 rounded-xl pr-20"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {/* Copy Button */}
                        {newPassword && (
                          <button
                            type="button"
                            onClick={handleCopyPassword}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Copy password"
                          >
                            {passwordCopied ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {/* Show/Hide Button */}
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Strength:</span>
                        <span className={`text-sm font-semibold ${getPasswordStrength(newPassword).color}`}>
                          {getPasswordStrength(newPassword).strength}
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="h-11 border-2 border-gray-200 focus:border-indigo-500 rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password Match Indicator */}
                    {confirmNewPassword && (
                      <div className="flex items-center gap-2 mt-2">
                        {newPassword === confirmNewPassword ? (
                          <span className="text-sm text-green-600 font-medium">✓ Passwords match</span>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">✗ Passwords do not match</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200"
                    onClick={() => {
                      setResetPasswordDialogOpen(false);
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    disabled={resetting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    onClick={confirmResetPassword}
                    disabled={resetting}
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default UserList;