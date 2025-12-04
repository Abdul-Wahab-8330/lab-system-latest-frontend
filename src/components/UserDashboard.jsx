import { AlertTriangle, BarChart3, CheckCircle, Clock, FileText, Plus, TestTube, Users, DollarSign, Activity } from "lucide-react";
import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { PatientsContext } from "@/context/PatientsContext";
import { TestContext } from "../context/TestContext";
import DailyRevenueChart from "./DailyRevenueChart";
import TestStatusChart from "./TestStatusChart";
import PopularTestsChart from "./PopularTestsChart";
import { Link } from "react-router-dom";
import { LabUsersCard, RevenueAnalyticsCard } from "./AdminDashboardCards";
import { AuthContext } from "@/context/AuthProvider";

function UserDashboard() {
  const { patients, fetchPatients } = useContext(PatientsContext);
  const { tests, deleteTest, updateTest, loading } = useContext(TestContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPatients();
  }, []);

  // Memoize the stats calculation
  const stats = useMemo(() => {
    if (!patients || patients.length === 0) {
      return {
        pendingTests: 0,
        completedToday: 0,
        criticalResults: 0,
        totalRevenue: 0,
        paidPatients: 0,
        unpaidPatients: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTests = patients.filter(p => p.resultStatus === 'Pending').length;

    const addedPatients = patients.filter(p => p.resultStatus === 'Added');
    const completedToday = addedPatients.filter(p => {
      if (!p.updatedAt) {
        return false;
      }

      const resultDate = new Date(p.updatedAt);
      resultDate.setHours(0, 0, 0, 0);

      return resultDate.getTime() === today.getTime();
    }).length;

    const criticalResults = patients.filter(p =>
      p.total > 10000 || p.referencedBy !== 'Self'
    ).length;

    const totalRevenue = patients.reduce((sum, p) => sum + (p.total || 0), 0);
    const paidPatients = patients.filter(p => p.paymentStatus === 'Paid').length;
    const unpaidPatients = patients.filter(p => p.paymentStatus === 'Not Paid').length;

    return {
      pendingTests,
      completedToday,
      criticalResults,
      totalRevenue,
      paidPatients,
      unpaidPatients
    };
  }, [patients]); // Only recalculate when patients change

  // Memoize dashboard stats
  const dashboardStats = useMemo(() => [
    {
      title: 'Pending Results',
      value: stats.pendingTests.toString(),
      change: `${patients.length > 0 ? Math.round((stats.pendingTests / patients.length) * 100) : 0}%`,
      color: 'text-amber-600',
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday.toString(),
      change: `${patients.length > 0 ? Math.round((stats.completedToday / patients.length) * 100) : 0}%`,
      color: 'text-green-600',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'High Priority',
      value: stats.criticalResults.toString(),
      change: `${patients.length > 0 ? Math.round((stats.criticalResults / patients.length) * 100) : 0}%`,
      color: 'text-red-600',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Total Revenue',
      value: `Rs.${(stats.totalRevenue / 1000).toFixed(1)}K`,
      change: `${stats.paidPatients}/${patients.length} paid`,
      color: 'text-purple-600',
      icon: DollarSign,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ], [stats, patients.length]); // Only recalculate when stats or patients length change

  // Memoize helper function
  const getTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }, []); // No dependencies since it doesn't use any external state

  // Memoize recent tests calculation
  const recentTests = useMemo(() => {
    return patients.slice().reverse().slice(0, 5).map(patient => ({
      refNo: patient.refNo,
      caseNo: patient.caseNo,
      patient: patient.name,
      test: patient.tests.length > 0 ? patient.tests[0].testName : 'No tests',
      status: patient.resultStatus === 'Added' ? 'Completed' :
        patient.resultStatus === 'Pending' ? 'Pending' : 'Unknown',
      priority: patient.total > 10000 ? 'High' :
        patient.referencedBy !== 'Self' ? 'Urgent' : 'Normal',
      time: getTimeAgo(patient.createdAt),
      paymentStatus: patient.paymentStatus,
      total: patient.total,
      testCount: patient.tests.length
    }));
  }, [patients, getTimeAgo]); // Recalculate only when patients or getTimeAgo changes

  // Memoize status color functions
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 font-semibold';
      case 'High': return 'text-orange-600 font-medium';
      case 'Normal': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getPaymentStatusColor = useCallback((status) => {
    return status === 'Paid' ? 'text-green-600' : 'text-red-600';
  }, []);

  // Memoize admin role check
  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  if (loading) {
    return (
      <div className="flex-1 flex mt-40 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
        {dashboardStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tests Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent Patient Tests</h2>
            <div className="text-sm text-gray-500">
              Showing {recentTests.length} of {recentTests.length} patients
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Case No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pat No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Result Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tests Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentTests.map((test) => (
                console.log(recentTests),
                <tr key={test.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {test.caseNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {test.refNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {test.patient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPaymentStatusColor(test.paymentStatus)}`}>
                      {test.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs.{test.total?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {test.testCount} test{test.testCount !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.time}
                  </td>
                </tr>
              ))}
              {recentTests.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No patients found matching the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* admin cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <LabUsersCard />
          <RevenueAnalyticsCard />
        </div>
      )}



      {/* Quick Actions & Info Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-3">
              <Users className="w-4 h-4" />
              <Link to='/user/register-patient'>Add New Patient</Link>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors duration-200 flex items-center space-x-3">
              <FileText className="w-4 h-4" />
              <Link to='/user/result-print'>Generate Report</Link>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors duration-200 flex items-center space-x-3">
              <TestTube className="w-4 h-4" />
              <Link to='/user/results'>Manage Results</Link>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-800">Paid Patients</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.paidPatients}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-800">Unpaid Patients</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.unpaidPatients}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-800">Total Revenue</span>
              </div>
              <span className="text-lg font-bold text-blue-600">Rs.{stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Database</span>
              </span>
              <span className="text-sm text-green-600 font-semibold">Connected</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Total Patients</span>
              </span>
              <span className="text-sm text-blue-600 font-semibold">{patients.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Available Tests</span>
              </span>
              <span className="text-sm text-blue-600 font-semibold">{tests?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts - These should now receive stable props */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-6">
        <DailyRevenueChart />
        <TestStatusChart />
        <PopularTestsChart />
      </div>
    </main>
  );
}

export default UserDashboard;