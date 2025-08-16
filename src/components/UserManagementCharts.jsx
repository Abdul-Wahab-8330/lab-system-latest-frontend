import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, Shield, Activity, TrendingUp, UserPlus, Clock, Settings, BarChart3, Loader2 } from 'lucide-react';
import { useContext } from "react";
import { AuthContext } from "@/context/AuthProvider";
import { PatientsContext } from "@/context/PatientsContext";
import { TestContext } from "@/context/TestContext";

const UserManagementCharts = () => {
    const [timeRange, setTimeRange] = useState('30');
    const [isLoading, setIsLoading] = useState(false);

    const { users, fetchUsers } = useContext(AuthContext);
    const { patients, fetchPatients } = useContext(PatientsContext);
    const { tests, loading: testsLoading } = useContext(TestContext);

    // Memoize fetch functions to prevent infinite re-renders
    const memoizedFetchUsers = useCallback(fetchUsers, []);
    const memoizedFetchPatients = useCallback(fetchPatients, []);

    // Load data only once on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Only fetch if data doesn't exist
                const promises = [];
                if (!users || users.length === 0) {
                    promises.push(memoizedFetchUsers());
                }
                if (!patients || patients.length === 0) {
                    promises.push(memoizedFetchPatients());
                }

                if (promises.length > 0) {
                    await Promise.all(promises);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []); // Empty dependency array - only run once

    // Safely get array data with fallbacks
    const safeUsers = useMemo(() => Array.isArray(users) ? users : [], [users]);
    const safePatients = useMemo(() => Array.isArray(patients) ? patients : [], [patients]);

    // Filter data based on time range - optimized
    const filteredUsers = useMemo(() => {
        if (safeUsers.length === 0) return [];

        const now = new Date();
        const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));

        return safeUsers.filter(user => {
            if (!user) return false;
            const createdAt = user.createdAt ? new Date(user.createdAt) :
                user.joinedAt ? new Date(user.joinedAt) : now;
            return createdAt >= daysAgo;
        });
    }, [safeUsers, timeRange]);

    // User registration trends - optimized
    const userRegistrationTrends = useMemo(() => {
        const getLast7Days = () => {
            const today = new Date();
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(today);
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString();
            });
        };

        const last7Days = getLast7Days();

        if (filteredUsers.length === 0) {
            return last7Days.map(date => ({ date, registrations: 0 }));
        }

        // Group users by date
        const trends = {};
        filteredUsers.forEach(user => {
            if (!user) return;
            const date = user.createdAt ? new Date(user.createdAt) :
                user.joinedAt ? new Date(user.joinedAt) : new Date();
            const key = date.toLocaleDateString();
            trends[key] = (trends[key] || 0) + 1;
        });

        return last7Days.map(date => ({
            date,
            registrations: trends[date] || 0,
        }));
    }, [filteredUsers]);

    // Role distribution - optimized
    const roleData = useMemo(() => {
        if (filteredUsers.length === 0) {
            return [{ name: 'No Data', value: 1, color: '#9CA3AF' }];
        }

        const roles = {};
        filteredUsers.forEach(user => {
            if (!user) return;
            const role = user.role || 'User';
            roles[role] = (roles[role] || 0) + 1;
        });

        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        return Object.entries(roles).map(([role, count], index) => ({
            name: role,
            value: count,
            color: colors[index % colors.length]
        }));
    }, [filteredUsers]);

    // User activity data - optimized with null checks
    const userActivityData = useMemo(() => {
        if (safePatients.length === 0) {
            return [{ user: 'No Data', registrations: 0 }];
        }

        const activity = {};
        safePatients.forEach(patient => {
            if (!patient) return;
            const registeredBy = patient.patientRegisteredBy || 'Unknown';
            activity[registeredBy] = (activity[registeredBy] || 0) + 1;
        });

        const result = Object.entries(activity)
            .map(([user, count]) => ({ user: user.substring(0, 20), registrations: count })) // Limit user name length
            .sort((a, b) => b.registrations - a.registrations)
            .slice(0, 5);

        return result.length > 0 ? result : [{ user: 'No Data', registrations: 0 }];
    }, [safePatients]);

    // Payment activity - optimized
    const paymentActivityData = useMemo(() => {
        if (safePatients.length === 0) {
            return [{ user: 'No Data', payments: 0 }];
        }

        const paymentUpdates = {};
        safePatients.forEach(patient => {
            if (!patient || patient.paymentStatus !== 'Paid') return;
            const updatedBy = patient.paymentStatusUpdatedBy || 'Unknown';
            paymentUpdates[updatedBy] = (paymentUpdates[updatedBy] || 0) + 1;
        });

        const result = Object.entries(paymentUpdates)
            .map(([user, count]) => ({ user: user.substring(0, 20), payments: count }))
            .sort((a, b) => b.payments - a.payments)
            .slice(0, 5);

        return result.length > 0 ? result : [{ user: 'No Data', payments: 0 }];
    }, [safePatients]);

    // Result activity - optimized
    const resultActivityData = useMemo(() => {
        if (safePatients.length === 0) {
            return [{ user: 'No Data', results: 0 }];
        }

        const resultUpdates = {};
        safePatients.forEach(patient => {
            if (!patient || !patient.resultAddedBy) return;
            const addedBy = patient.resultAddedBy;
            resultUpdates[addedBy] = (resultUpdates[addedBy] || 0) + 1;
        });

        const result = Object.entries(resultUpdates)
            .map(([user, count]) => ({ user: user.substring(0, 20), results: count }))
            .sort((a, b) => b.results - a.results)
            .slice(0, 5);

        return result.length > 0 ? result : [{ user: 'No Data', results: 0 }];
    }, [safePatients]);

    // User status distribution - optimized
    const userStatusData = useMemo(() => {
        if (filteredUsers.length === 0) {
            return [
                { name: 'Active', value: 0, color: '#10b981' },
                { name: 'Inactive', value: 0, color: '#ef4444' }
            ];
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        let activeUsers = 0;
        let inactiveUsers = 0;

        filteredUsers.forEach(user => {
            if (!user) return;
            const lastActivity = user.lastActivity ? new Date(user.lastActivity) :
                user.createdAt ? new Date(user.createdAt) : now;
            if (lastActivity >= thirtyDaysAgo) {
                activeUsers++;
            } else {
                inactiveUsers++;
            }
        });

        return [
            { name: 'Active', value: activeUsers, color: '#10b981' },
            { name: 'Inactive', value: inactiveUsers, color: '#ef4444' }
        ];
    }, [filteredUsers]);

    // Stats calculation - optimized
    const stats = useMemo(() => {
        const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

        return [
            {
                title: 'Total Users',
                value: filteredUsers.length,
                icon: Users,
                color: 'bg-blue-50 text-blue-600'
            },
            {
                title: 'Active Users',
                value: userStatusData.find(d => d.name === 'Active')?.value || 0,
                icon: UserPlus,
                color: 'bg-green-50 text-green-600'
            },
            {
                title: 'Admin Users',
                value: filteredUsers.filter(u => u && (u.role === 'admin' || u.role === 'Admin')).length,
                icon: Shield,
                color: 'bg-purple-50 text-purple-600'
            },
            {
                title: 'Recent Joins',
                value: filteredUsers.filter(u => {
                    if (!u) return false;
                    const joinDate = u.createdAt ? new Date(u.createdAt) :
                        u.joinedAt ? new Date(u.joinedAt) : new Date();
                    return joinDate >= sevenDaysAgo;
                }).length,
                icon: Clock,
                color: 'bg-orange-50 text-orange-600'
            }
        ];
    }, [filteredUsers, userStatusData]);

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    // Loading component
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading data...</span>
        </div>
    );

    // No data component
    const NoDataMessage = ({ message = "No data available" }) => (
        <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{message}</p>
            </div>
        </div>
    );

    // Chart wrapper component
    const ChartWrapper = ({ children, hasData, noDataMessage }) => {
        if (isLoading) return <LoadingSpinner />;
        if (!hasData) return <NoDataMessage message={noDataMessage} />;
        return children;
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    User Management Analytics
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </h1>

                <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value)} // use onValueChange instead of onChange
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-[180px] bg-white border border-gray-300">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {isLoading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            stat.value
                                        )}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Registration Trends */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        User Registration Trends
                    </h3>
                    <ChartWrapper
                        hasData={userRegistrationTrends.some(d => d.registrations > 0)}
                        noDataMessage="No user registrations found"
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={userRegistrationTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="registrations"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.1}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>

                {/* Role Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Role Distribution
                    </h3>
                    <ChartWrapper
                        hasData={roleData.some(d => d.name !== 'No Data')}
                        noDataMessage="No role data available"
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>

                {/* User Activity - Patient Registrations */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Patient Registrations by User
                    </h3>
                    <ChartWrapper
                        hasData={userActivityData.some(d => d.user !== 'No Data' && d.registrations > 0)}
                        noDataMessage="No patient registration data"
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={userActivityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="user"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="registrations" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>

                {/* Payment Processing by User */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                    <h3 className="text-lg font-semibold mb-4">Payment Processing Activity</h3>
                    <ChartWrapper
                        hasData={paymentActivityData.some(d => d.user !== 'No Data' && d.payments > 0)}
                        noDataMessage="No payment processing data"
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={paymentActivityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="user"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="payments" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>

                {/* Result Processing by User */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                    <h3 className="text-lg font-semibold mb-4">Result Processing Activity</h3>
                    <ChartWrapper
                        hasData={resultActivityData.some(d => d.user !== 'No Data' && d.results > 0)}
                        noDataMessage="No result processing data"
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={resultActivityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="user"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="results" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>

                {/* User Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border border-gray-100-gray-300-none">
                    <h3 className="text-lg font-semibold mb-4">User Activity Status</h3>
                    <ChartWrapper
                        hasData={userStatusData.some(d => d.value > 0)}
                        noDataMessage="No user status data"
                    >
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={userStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartWrapper>
                </div>
            </div>
        </div>
    );
};

export default UserManagementCharts;