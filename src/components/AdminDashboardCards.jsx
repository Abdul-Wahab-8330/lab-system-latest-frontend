import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, Calendar, Activity, Eye } from 'lucide-react';
import { AuthContext } from "@/context/AuthProvider";
import { PatientsContext } from "@/context/PatientsContext";
import { Link } from 'react-router-dom';

// Enhanced Lab Users Management Card
const LabUsersCard = () => {
  const { user, users, fetchUsers } = useContext(AuthContext);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Function to calculate stats
  const calculateStats = useCallback((userData) => {
    if (!userData || userData.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsersThisMonth: 0
      };
    }

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const adminUsers = userData.filter(u => u.role === 'admin').length;
      const regularUsers = userData.filter(u => u.role === 'user' || !u.role).length;
      
      const newUsersThisMonth = userData.filter(u => {
        const createdAt = u.createdAt?.$date ? new Date(u.createdAt.$date) : new Date(u.createdAt);
        return createdAt >= startOfMonth;
      }).length;
      
      return {
        totalUsers: userData.length,
        activeUsers: adminUsers,
        inactiveUsers: regularUsers,
        newUsersThisMonth
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        totalUsers: userData.length || 0,
        activeUsers: 0,
        inactiveUsers: userData.length || 0,
        newUsersThisMonth: 0
      };
    }
  }, []);

  // Check for data and calculate stats
  useEffect(() => {
    const checkAndCalculate = () => {
      // If we already calculated, don't do it again
      if (hasCalculated) return;
      
      // If users data exists, calculate immediately
      if (users && users.length > 0) {
        const stats = calculateStats(users);
        setUserStats(stats);
        setHasCalculated(true);
        setLoading(false);
        return;
      }
      
      // If no users but fetchUsers exists, try fetching
      if (fetchUsers && !hasCalculated) {
        fetchUsers().then(() => {
          // Check again after a small delay
          setTimeout(() => {
            const contextUsers = users; // Get latest from context
            if (contextUsers && contextUsers.length > 0) {
              const stats = calculateStats(contextUsers);
              setUserStats(stats);
            }
            setHasCalculated(true);
            setLoading(false);
          }, 200);
        }).catch((error) => {
          console.error('Error fetching users:', error);
          setHasCalculated(true);
          setLoading(false);
        });
      } else {
        // No data and no fetch function, stop loading
        setHasCalculated(true);
        setLoading(false);
      }
    };

    // Initial check
    checkAndCalculate();

    // If still no data after 2 seconds, stop loading anyway
    const fallbackTimer = setTimeout(() => {
      if (!hasCalculated) {
        setHasCalculated(true);
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, []); // Only run on mount

  // One-time check when users become available (but only if we haven't calculated yet)
  useEffect(() => {
    if (users && users.length > 0) {
      const stats = calculateStats(users);
      setUserStats(stats);
      setHasCalculated(true);
      setLoading(false);
    }
  }, [users]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lab Team</h3>
            <p className="text-sm text-gray-500">User Management</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 hover:bg-green-50 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Admins</span>
          </div>
          <p className="text-xl font-semibold text-green-600">{userStats.activeUsers}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <p className="text-xl font-semibold text-blue-500">{userStats.inactiveUsers}</p>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 hover:bg-emerald-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-600">New This Month</span>
          </div>
          <span className="text-lg font-semibold text-emerald-600">+{userStats.newUsersThisMonth}</span>
        </div>
      </div>

      {/* Quick Action */}
      <Link to='/admin/all-users' 
        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View All Users
      </Link>
    </div>
  );
};

// Enhanced Revenue Analytics Card
const RevenueAnalyticsCard = () => {
  const { patients } = useContext(PatientsContext);
  const [revenueData, setRevenueData] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    averagePerPatient: 0,
    growthPercentage: 0,
    dailyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Function to calculate revenue
  const calculateRevenue = useCallback((patientsData) => {
    if (!patientsData || patientsData.length === 0) {
      return {
        todayRevenue: 0,
        monthlyRevenue: 0,
        averagePerPatient: 0,
        growthPercentage: 0,
        dailyTrend: []
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const parseDate = (dateField) => {
      if (!dateField) return new Date();
      return dateField.$date ? new Date(dateField.$date) : new Date(dateField);
    };

    const todayRevenue = patientsData
      .filter(p => {
        const patientDate = parseDate(p.createdAt);
        return patientDate >= today && patientDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      })
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const monthlyRevenue = patientsData
      .filter(p => parseDate(p.createdAt) >= startOfMonth)
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const lastMonthRevenue = patientsData
      .filter(p => {
        const date = parseDate(p.createdAt);
        return date >= lastMonth && date <= endOfLastMonth;
      })
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const growthPercentage = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
      : monthlyRevenue > 0 ? 100 : 0;

    const totalRevenue = patientsData.reduce((sum, p) => sum + (p.total || 0), 0);
    const averagePerPatient = patientsData.length > 0 ? totalRevenue / patientsData.length : 0;

    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayRevenue = patientsData
        .filter(p => {
          const patientDate = parseDate(p.createdAt);
          return patientDate >= dayStart && patientDate < dayEnd;
        })
        .reduce((sum, p) => sum + (p.total || 0), 0);
      
      dailyTrend.push({ 
        day: date.getDate(), 
        revenue: dayRevenue,
        date: date.toISOString().split('T')[0]
      });
    }

    return {
      todayRevenue,
      monthlyRevenue,
      averagePerPatient,
      growthPercentage: parseFloat(growthPercentage.toFixed(1)),
      dailyTrend
    };
  }, []);

  // Check for data and calculate revenue
  useEffect(() => {
    const checkAndCalculate = () => {
      // If we already calculated, don't do it again
      if (hasCalculated) return;
      
      // If patients data exists, calculate immediately
      if (patients && patients.length > 0) {
        const revenue = calculateRevenue(patients);
        setRevenueData(revenue);
        setHasCalculated(true);
        setLoading(false);
        return;
      }
      
      // If no patients data yet, wait a bit and check again
      const checkTimer = setTimeout(() => {
        const contextPatients = patients; // Get latest from context
        if (contextPatients && contextPatients.length >= 0) { // >= 0 to handle empty arrays too
          const revenue = calculateRevenue(contextPatients);
          setRevenueData(revenue);
        }
        setHasCalculated(true);
        setLoading(false);
      }, 500);

      return checkTimer;
    };

    // Initial check
    const timer = checkAndCalculate();

    // If still no data after 3 seconds, stop loading anyway
    const fallbackTimer = setTimeout(() => {
      if (!hasCalculated) {
        setHasCalculated(true);
        setLoading(false);
      }
    }, 3000);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []); // Only run on mount

  // One-time check when patients become available (but only if we haven't calculated yet)
  useEffect(() => {
    if (patients && patients.length >= 0) {
      const revenue = calculateRevenue(patients);
      setRevenueData(revenue);
      setHasCalculated(true);
      setLoading(false);
    }
  }, [patients]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.dailyTrend.map(d => d.revenue), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-200">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <p className="text-sm text-gray-500">Financial Overview</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            Rs.{(revenueData.monthlyRevenue / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-gray-500">This Month</p>
        </div>
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
          <p className="text-xl font-semibold text-blue-600">
            Rs.{revenueData.todayRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 hover:bg-purple-50 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Avg/Patient</span>
          </div>
          <p className="text-xl font-semibold text-purple-600">
            Rs.{Math.round(revenueData.averagePerPatient).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 hover:bg-emerald-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${revenueData.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
            <span className="text-sm text-gray-600">Monthly Growth</span>
          </div>
          <span className={`text-lg font-semibold ${revenueData.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {revenueData.growthPercentage >= 0 ? '+' : ''}{revenueData.growthPercentage}%
          </span>
        </div>
      </div>

      {/* Mini Chart - 7-day trend */}
      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
        <p className="text-sm font-medium text-gray-700 mb-3">7-Day Revenue Trend</p>
        <div className="flex items-end gap-1 h-12">
          {revenueData.dailyTrend.map((day, index) => (
            <div
              key={index}
              className="flex-1 bg-emerald-400 rounded-sm min-h-1 transition-all duration-300 hover:bg-emerald-500 cursor-pointer relative group/bar"
              style={{
                height: `${Math.max((day.revenue / maxRevenue) * 100, 8)}%`
              }}
              title={`${day.date}: Rs.${day.revenue.toLocaleString()}`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                Day {day.day}: Rs.{day.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { LabUsersCard, RevenueAnalyticsCard };