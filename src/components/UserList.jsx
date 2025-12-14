
import { useEffect, useState, useContext } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Users, User, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { AuthContext } from "@/context/AuthProvider";
import toast from "react-hot-toast";
import { ROLES, getRoleDisplayName } from '@/utils/permissions';

const UserList = () => {
  const { users, user, fetchUsers, deleteUser } = useContext(AuthContext);
  //user is the current loggedin user and user.username is to get username
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const totalAdmins = users.filter(u => u.role === 'admin').length;

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
                {!loading && users && users.length > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <span className="text-white font-medium text-sm">
                      {totalAdmins} {totalAdmins == 1 ? 'Admin' : 'Admins'} • {users.filter(u => u.role === 'user').length} Users
                    </span>
                  </div>
                )}
                {!loading && users && (
                  <div className="inline-flex items-center px-4 py-2 bg-purple-500 rounded-xl shadow-sm text-white">
                    <Users className="h-4 w-4  mr-2" />
                    <span className="text-sm font-medium">
                      {users.length} {users.length === 1 ? 'User' : 'Users'} Total
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
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50">
                          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Users Found</h3>
                          <p className="text-gray-500">There are no users in the system yet.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u, index) => (
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
                          {/* <TableCell className="text-right py-6 px-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                              onClick={() => handleDeleteClick(u)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </TableCell> */}
                          <TableCell className="text-right py-6 px-6">
                            {user?.userName === u.userName ? (
                              <div className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <User className="h-3 w-3 mr-1" />
                                Current User
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                                onClick={() => handleDeleteClick(u)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
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
      </div>
    </div>
  );
};

export default UserList;