
import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Calendar,
  Activity,
  TrendingUp,
  Target,
  BarChart3,
  Users,
  Loader2
} from 'lucide-react';
import { PatientsContext } from '@/context/PatientsContext';

const TestsCharts = () => {
  const { patients, fetchPatients } = useContext(PatientsContext);
  const [timeFilter, setTimeFilter] = useState('30'); // 7, 30, 90 days
  const [isLoading, setIsLoading] = useState(false);

  // Memoize fetch function to prevent infinite re-renders
  const memoizedFetchPatients = useCallback(fetchPatients, []);

  // Load data only once on mount
  useEffect(() => {
    const loadData = async () => {
      if (!patients || patients.length === 0) {
        setIsLoading(true);
        try {
          await memoizedFetchPatients();
        } catch (error) {
          console.error("Error loading patients:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, []); 

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Safe patients array with fallback
  const safePatients = useMemo(() => Array.isArray(patients) ? patients : [], [patients]);

  // Filter patients based on time range
  const filteredPatients = useMemo(() => {
    if (safePatients.length === 0) return [];

    const days = parseInt(timeFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return safePatients.filter(patient => {
      if (!patient || !patient.createdAt) return false;
      return new Date(patient.createdAt) >= cutoffDate;
    });
  }, [safePatients, timeFilter]);

  // Daily tests trend
  const dailyTestsData = useMemo(() => {
    if (filteredPatients.length === 0) return [];

    const dateMap = {};
    filteredPatients.forEach(patient => {
      if (!patient || !patient.createdAt || !Array.isArray(patient.tests)) return;

      // Create a proper date string in YYYY-MM-DD format for consistent sorting
      const dateObj = new Date(patient.createdAt);
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      const displayDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          displayDate: displayDate,
          tests: 0,
          patients: 0,
          revenue: 0
        };
      }
      dateMap[dateKey].tests += patient.tests.length;
      dateMap[dateKey].patients += 1;
      dateMap[dateKey].revenue += patient.total || 0;
    });

    return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredPatients]);

  // Most popular tests
  const testPopularityData = useMemo(() => {
    if (filteredPatients.length === 0) return [];

    const testMap = {};
    filteredPatients.forEach(patient => {
      if (!patient || !Array.isArray(patient.tests)) return;
      
      patient.tests.forEach(test => {
        if (!test || !test.testName) return;
        
        if (!testMap[test.testName]) {
          testMap[test.testName] = { name: test.testName, count: 0, revenue: 0 };
        }
        testMap[test.testName].count += 1;
        testMap[test.testName].revenue += test.price || 0;
      });
    });

    return Object.values(testMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Limit to top 10 for better performance
  }, [filteredPatients]);

  // Status distribution
  const statusData = useMemo(() => {
    const statusCount = { pending: 0, completed: 0, paid: 0, unpaid: 0 };
    
    filteredPatients.forEach(patient => {
      if (!patient) return;
      
      if (patient.resultStatus === 'Pending') statusCount.pending += 1;
      if (patient.resultStatus === 'Added') statusCount.completed += 1;
      if (patient.paymentStatus === 'Paid') statusCount.paid += 1;
      if (patient.paymentStatus === 'Not Paid') statusCount.unpaid += 1;
    });

    return [
      { name: 'Results Pending', value: statusCount.pending, color: '#F59E0B' },
      { name: 'Results Added', value: statusCount.completed, color: '#10B981' },
      { name: 'Payment Paid', value: statusCount.paid, color: '#3B82F6' },
      { name: 'Payment Pending', value: statusCount.unpaid, color: '#EF4444' }
    ];
  }, [filteredPatients]);

  // Gender distribution
  const genderData = useMemo(() => {
    const genderCount = { Male: 0, Female: 0, Other: 0 };
    
    filteredPatients.forEach(patient => {
      if (!patient || !patient.gender) return;
      if (genderCount.hasOwnProperty(patient.gender)) {
        genderCount[patient.gender] += 1;
      }
    });

    return Object.entries(genderCount)
      .filter(([_, count]) => count > 0)
      .map(([gender, count], index) => ({
        name: gender,
        value: count,
        color: colors[index % colors.length]
      }));
  }, [filteredPatients, colors]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalTests = filteredPatients.reduce((sum, patient) => {
      if (!patient || !Array.isArray(patient.tests)) return sum;
      return sum + patient.tests.length;
    }, 0);
    
    const totalRevenue = filteredPatients.reduce((sum, patient) => {
      if (!patient) return sum;
      return sum + (patient.total || 0);
    }, 0);
    
    const avgTestsPerPatient = filteredPatients.length > 0 ? 
      (totalTests / filteredPatients.length).toFixed(1) : 0;

    return {
      totalPatients: filteredPatients.length,
      totalTests,
      totalRevenue,
      avgTestsPerPatient
    };
  }, [filteredPatients]);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              value
            )}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0 flex items-center gap-2">
            Tests Analytics
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          </h1>
          <div className="flex gap-2">
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeFilter(days)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            title="Total Patients"
            value={summaryStats.totalPatients}
            color="text-blue-600"
          />
          <StatCard
            icon={Activity}
            title="Total Tests Registered"
            value={summaryStats.totalTests}
            color="text-green-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value={`₨${summaryStats.totalRevenue.toLocaleString()}`}
            color="text-purple-600"
          />
          <StatCard
            icon={BarChart3}
            title="Avg Tests/Patient"
            value={summaryStats.avgTestsPerPatient}
            color="text-orange-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trends */}
          <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Daily Activity</h3>
            </div>
            <ChartWrapper
              hasData={dailyTestsData.length > 0}
              noDataMessage="No daily activity data available"
            >
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyTestsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const dateObj = new Date(value);
                      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const dateObj = new Date(value);
                      return dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    }}
                    formatter={(value, name) => [value, name === 'tests' ? 'Tests' : name === 'patients' ? 'Patients' : 'Revenue']}
                  />
                  <Area type="monotone" dataKey="tests" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Test Popularity */}
          <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Most Popular Tests</h3>
            </div>

            <ChartWrapper
              hasData={testPopularityData.length > 0}
              noDataMessage="No test popularity data available"
            >
              {/* Scrollable container */}
              <div className="overflow-y-auto max-h-[300px]">
                <ResponsiveContainer width="100%" height={Math.max(testPopularityData.length * 40, 250)}>
                  <BarChart
                    data={testPopularityData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={140}
                      tickFormatter={(value) =>
                        value.length > 15 ? value.substring(0, 15) + '...' : value
                      }
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        [value, name === 'count' ? 'Tests Count' : 'Revenue']
                      }
                    />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWrapper>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Status Overview</h3>
            </div>
            <ChartWrapper
              hasData={statusData.some(d => d.value > 0)}
              noDataMessage="No status data available"
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </div>
            <ChartWrapper
              hasData={dailyTestsData.length > 0 && dailyTestsData.some(d => d.revenue > 0)}
              noDataMessage="No revenue data available"
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyTestsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const dateObj = new Date(value);
                      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const dateObj = new Date(value);
                      return dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    }}
                    formatter={(value) => [`₨${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </div>

        {/* Gender Demographics - Only show if data exists */}
        {genderData.length > 0 && !isLoading && (
          <div className="mt-6">
            <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Patient Demographics</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestsCharts;