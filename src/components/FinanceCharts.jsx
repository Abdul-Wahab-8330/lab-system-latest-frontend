import React, { useState, useEffect, useContext } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, Calendar, TestTube } from 'lucide-react';
import { PatientsContext } from "@/context/PatientsContext";

const FinanceCharts = () => {
  const [timeFilter, setTimeFilter] = useState('7days');
  const [financeData, setFinanceData] = useState({
    dailyRevenue: [],
    testRevenue: [],
    paymentStatus: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  const { fetchPatients, patients } = useContext(PatientsContext);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchPatients();
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (patients && patients.length > 0) {
      processFinanceData();
    }
  }, [patients]);

  const processFinanceData = () => {
    // Process daily revenue for last 30 days
    const dailyRevenue = [];
    const testRevenue = {};
    let paymentStatusData = { paid: 0, unpaid: 0, paidAmount: 0, unpaidAmount: 0 };

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPatients = patients.filter(patient => {
        const patientDate = new Date(patient.createdAt).toISOString().split('T')[0];
        return patientDate === dateStr;
      });

      const dayRevenue = dayPatients
        .filter(p => p.paymentStatus === 'Paid')
        .reduce((sum, p) => sum + p.total, 0);

      const dayTests = dayPatients.reduce((sum, p) => sum + p.tests.length, 0);

      dailyRevenue.push({
        date: dateStr,
        revenue: dayRevenue,
        tests: dayTests,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    // Process test-wise revenue
    patients.forEach(patient => {
      if (patient.paymentStatus === 'Paid') {
        patient.tests.forEach(test => {
          if (!testRevenue[test.testName]) {
            testRevenue[test.testName] = {
              testName: test.testName,
              revenue: 0,
              count: 0,
              avgPrice: 0
            };
          }
          testRevenue[test.testName].revenue += test.price;
          testRevenue[test.testName].count += 1;
        });
      }

      // Payment status
      if (patient.paymentStatus === 'Paid') {
        paymentStatusData.paid += 1;
        paymentStatusData.paidAmount += patient.total;
      } else {
        paymentStatusData.unpaid += 1;
        paymentStatusData.unpaidAmount += patient.total;
      }
    });

    // Calculate average prices
    Object.keys(testRevenue).forEach(testName => {
      const test = testRevenue[testName];
      test.avgPrice = Math.round(test.revenue / test.count);
    });

    const testRevenueArray = Object.values(testRevenue).sort((a, b) => b.revenue - a.revenue);

    const totalPatients = paymentStatusData.paid + paymentStatusData.unpaid;
    const paymentStatus = [
      { 
        status: 'Paid', 
        value: Math.round((paymentStatusData.paid / totalPatients) * 100), 
        amount: paymentStatusData.paidAmount 
      },
      { 
        status: 'Not Paid', 
        value: Math.round((paymentStatusData.unpaid / totalPatients) * 100), 
        amount: paymentStatusData.unpaidAmount 
      }
    ];

    // Generate monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthPatients = patients.filter(patient => {
        const patientDate = new Date(patient.createdAt);
        return patientDate >= monthStart && patientDate <= monthEnd && patient.paymentStatus === 'Paid';
      });

      const monthRevenue = monthPatients.reduce((sum, p) => sum + p.total, 0);
      const monthTests = monthPatients.reduce((sum, p) => sum + p.tests.length, 0);

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue,
        tests: monthTests
      });
    }

    setFinanceData({ dailyRevenue, testRevenue: testRevenueArray, paymentStatus, monthlyTrends });
  };

  const filterDataByTime = (data, days) => {
    return data.slice(-days);
  };

  const getFilteredData = () => {
    const days = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 30;
    return filterDataByTime(financeData.dailyRevenue, days);
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const totalRevenue = financeData.testRevenue.reduce((sum, test) => sum + test.revenue, 0);
  const totalTests = financeData.testRevenue.reduce((sum, test) => sum + test.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading finance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 py-4 sm:mb-0">Finance Analytics</h1>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">Rs.{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Tests</p>
              <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
            </div>
            <TestTube className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Test Price</p>
              <p className="text-2xl font-bold text-gray-900">Rs.{totalTests > 0 ? Math.round(totalRevenue/totalTests) : 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {financeData.paymentStatus[0]?.value || 0}%
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex gap-2 mb-4">
          {['7days', '30days'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === '7days' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>

        {/* Daily Revenue Trend */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={getFilteredData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `Rs.${value/1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`Rs.${value.toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              fill="#dbeafe" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Revenue Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Test Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financeData.testRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="testName" 
                tick={{ fontSize: 10 }}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `Rs.${value/1000}k`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `Rs.${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Count'
                ]}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={financeData?.paymentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, value }) => `${status}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {financeData.paymentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [`${value}%`, `Rs.${props.payload.amount?.toLocaleString()}`]}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financeData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `Rs.${value/1000}k`}
              />
              <Tooltip 
                formatter={(value) => [`Rs.${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Performance Matrix */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Test Performance</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {financeData.testRevenue.map((test, index) => (
              <div key={test.testName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900 text-sm">{test.testName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">Rs.{test.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{test.count} tests • Rs.{test.avgPrice} avg</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceCharts;