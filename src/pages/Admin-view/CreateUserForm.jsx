import { useContext, useState, useEffect } from "react";
import { ROLES, getRoleDisplayName } from '@/utils/permissions';
import axios from "../../api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthContext } from "@/context/AuthProvider";
import { UserPlus, Users, User, Shield, UserCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function CreateUserForm() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const { fetchUsers, users } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      await fetchUsers();
      setUsersLoading(false);
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        {
          name,
          userName,
          password,
          role,
        }
      );
      if (response.data.success) {
        console.log("Created successfully");
        // Reset form
        setName("");
        setUserName("");
        setPassword("");
        setRole("user");
        await fetchUsers();
        toast.success('User Created successfully')
      }
    } catch (error) {
      console.log("Error", error);
      toast.error('Failed to create user')
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (userRole) => {
    const badgeStyles = {
      [ROLES.ADMIN]: 'from-purple-500 to-indigo-600',
      [ROLES.USER]: 'from-blue-500 to-cyan-600',
      [ROLES.RECEPTIONIST]: 'from-green-500 to-emerald-600',
      [ROLES.LAB_TECH]: 'from-indigo-500 to-purple-600'
    };

    const IconComponent = userRole === ROLES.ADMIN ? Shield : User;

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${badgeStyles[userRole] || badgeStyles[ROLES.USER]} text-white shadow-sm`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {getRoleDisplayName(userRole)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        {/* <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Create new users and manage existing accounts</p>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create User Form */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <UserPlus className="h-5 w-5" />
                </div>
                Create New User
              </h2>
            </div>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                    Role
                  </Label>
                  <Select value={role} onValueChange={(value) => setRole(value)}>
                    <SelectTrigger id="role" className="h-12 w-full border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm transition-all duration-200 bg-white/70">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border-0 shadow-xl rounded-xl'>
                      <SelectItem className='hover:bg-purple-50 rounded-lg m-1' value={ROLES.ADMIN}>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-purple-500" />
                          {getRoleDisplayName(ROLES.ADMIN)}
                        </div>
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 rounded-lg m-1' value={ROLES.USER}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          {getRoleDisplayName(ROLES.USER)}
                        </div>
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 rounded-lg m-1' value={ROLES.RECEPTIONIST}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          {getRoleDisplayName(ROLES.RECEPTIONIST)}
                        </div>
                      </SelectItem>
                      <SelectItem className='hover:bg-purple-50 rounded-lg m-1' value={ROLES.LAB_TECH}>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-indigo-500" />
                          {getRoleDisplayName(ROLES.LAB_TECH)}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-0 overflow-hidden p-0">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                    <Users className="h-5 w-5" />
                  </div>
                  Existing Users
                </div>
                {!usersLoading && users && (
                  <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">
                    {users.length} {users.length === 1 ? 'User' : 'Users'}
                  </div>
                )}
              </h2>
            </div>

            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin h-8 w-8 border-3 border-gray-300 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                  <div className="text-gray-600 font-medium">Loading users...</div>
                  <div className="text-gray-500 text-sm mt-2">Please wait while we fetch user data</div>
                </div>
              ) : !users || users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600 font-medium mb-2">No Users Found</div>
                  <div className="text-gray-500 text-sm">Create your first user to get started</div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            User Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {users.map((user, index) => (
                          <tr
                            key={user._id || user.id}
                            className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                              }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-white">
                                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {user.name || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {user._id?.slice(-6) || user.id?.slice(-6) || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.userName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getRoleBadge(user.role)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateUserForm;