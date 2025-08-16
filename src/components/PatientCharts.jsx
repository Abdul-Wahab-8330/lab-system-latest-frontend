import React, { useState, useEffect, useContext } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, CreditCard, Clock, TrendingUp } from 'lucide-react';
import { PatientsContext } from "@/context/PatientsContext";

const PatientCharts = () => {
  const [timeFilter, setTimeFilter] = useState('30days');
  const [patientData, setPatientData] = useState({
    dailyRegistrations: [],
    paymentStatus: [],
    resultStatus: [],
    ageDistribution: [],
    genderDistribution: []
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
      processPatientData();
    }
  }, [patients]);

  const processPatientData = () => {
    // Daily registrations for last 30 days
    const dailyRegistrations = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPatients = patients.filter(patient => {
        const patientDate = new Date(patient.createdAt).toISOString().split('T')[0];
        return patientDate === dateStr;
      });

      const paidCount = dayPatients.filter(p => p.paymentStatus === 'Paid').length;
      const unpaidCount = dayPatients.filter(p => p.paymentStatus === 'Not Paid').length;

      dailyRegistrations.push({
        date: dateStr,
        total: dayPatients.length,
        paid: paidCount,
        unpaid: unpaidCount,
        day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }

    // Payment Status Distribution
    const paidPatients = patients.filter(p => p.paymentStatus === 'Paid').length;
    const unpaidPatients = patients.filter(p => p.paymentStatus === 'Not Paid').length;
    const totalPatients = patients.length;

    const paymentStatus = [
      { 
        status: 'Paid', 
        value: paidPatients, 
        percentage: Math.round((paidPatients / totalPatients) * 100),
        amount: patients.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + p.total, 0)
      },
      { 
        status: 'Not Paid', 
        value: unpaidPatients, 
        percentage: Math.round((unpaidPatients / totalPatients) * 100),
        amount: patients.filter(p => p.paymentStatus === 'Not Paid').reduce((sum, p) => sum + p.total, 0)
      }
    ];

    // Result Status Distribution
    const addedResults = patients.filter(p => p.resultStatus === 'Added').length;
    const pendingResults = patients.filter(p => p.resultStatus === 'Pending').length;

    const resultStatus = [
      { 
        status: 'Added', 
        value: addedResults, 
        percentage: Math.round((addedResults / totalPatients) * 100)
      },
      { 
        status: 'Pending', 
        value: pendingResults, 
        percentage: Math.round((pendingResults / totalPatients) * 100)
      }
    ];

    // Age Distribution (create age groups)
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0
    };

    patients.forEach(patient => {
      const age = patient.age;
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['60+']++;
    });

    const ageDistribution = Object.keys(ageGroups).map(group => ({
      ageGroup: group,
      count: ageGroups[group],
      percentage: Math.round((ageGroups[group] / totalPatients) * 100)
    }));

    // Gender Distribution
    const maleCount = patients.filter(p => p.gender === 'Male').length;
    const femaleCount = patients.filter(p => p.gender === 'Female').length;
    const otherCount = patients.filter(p => p.gender === 'Other').length;

    const genderDistribution = [
      { gender: 'Male', count: maleCount, percentage: Math.round((maleCount / totalPatients) * 100) },
      { gender: 'Female', count: femaleCount, percentage: Math.round((femaleCount / totalPatients) * 100) },
      { gender: 'Other', count: otherCount, percentage: Math.round((otherCount / totalPatients) * 100) }
    ].filter(item => item.count > 0);

    setPatientData({ 
      dailyRegistrations, 
      paymentStatus, 
      resultStatus, 
      ageDistribution, 
      genderDistribution 
    });
  };

  const filterDataByTime = (data, days) => {
    return data.slice(-days);
  };

  const getFilteredData = () => {
    const days = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 30;
    return filterDataByTime(patientData.dailyRegistrations, days);
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#3b82f6'];

  const totalPatients = patients?.length || 0;
  const totalRevenue = patients?.reduce((sum, p) => sum + p.total, 0) || 0;
  const paymentRate = patientData.paymentStatus[0]?.percentage || 0;
  const completionRate = patientData.resultStatus[0]?.percentage || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading patient data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 overflow-y-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Rate</p>
              <p className="text-2xl font-bold text-gray-900">{paymentRate}%</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Results Complete</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">Rs.{(totalRevenue/100000).toFixed(1)}L</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
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
              {filter === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>

        {/* Daily Patient Registrations */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Patient Registrations</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={getFilteredData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11 }}
              stroke="#666"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip 
              formatter={(value, name) => [
                value, 
                name === 'total' ? 'Total Registrations' : 
                name === 'paid' ? 'Paid Patients' : 'Unpaid Patients'
              ]}
              labelStyle={{ color: '#333' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="paid" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={patientData.paymentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {patientData.paymentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} patients`, 
                  `Rs.${props.payload.amount?.toLocaleString()}`
                ]}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Result Status */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Result Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={patientData.resultStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {patientData.resultStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} patients`, 'Count']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patientData.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="ageGroup" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value) => [`${value} patients`, 'Count']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar 
                dataKey="count" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={patientData.genderDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="gender" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} patients (${props.payload.percentage}%)`, 
                  'Count'
                ]}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Bar 
                dataKey="count" 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Payment Summary</h4>
          <div className="space-y-2">
            {patientData.paymentStatus.map((status, index) => (
              <div key={status.status} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-gray-700">{status.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{status.value} patients</div>
                  <div className="text-xs text-gray-500">Rs.{status.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Result Summary</h4>
          <div className="space-y-2">
            {patientData.resultStatus.map((status, index) => (
              <div key={status.status} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index + 2] }}
                  />
                  <span className="text-sm text-gray-700">{status.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{status.value} patients</div>
                  <div className="text-xs text-gray-500">{status.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Age:</span>
              <span className="text-sm font-medium">
                {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length) : 0} years
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Revenue/Patient:</span>
              <span className="text-sm font-medium">Rs.{patients.length > 0 ? Math.round(totalRevenue / patients.length) : 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Most Common Age Group:</span>
              <span className="text-sm font-medium">
                {patientData.ageDistribution.length > 0 ? 
                  patientData.ageDistribution.reduce((max, group) => group.count > max.count ? group : max, patientData.ageDistribution[0]).ageGroup 
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCharts;