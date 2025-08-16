import { useContext } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PatientsContext } from "@/context/PatientsContext";
import { Activity } from "lucide-react";

function TestStatusChart() {
  const { patients } = useContext(PatientsContext);

  // Process data to get test status distribution
  const processStatusData = () => {
    if (!patients || patients.length === 0) return [];

    const statusCounts = {
      'Pending': 0,
      'Added': 0,
      'In Progress': 0
    };

    patients.forEach(patient => {
      if (patient.resultStatus && statusCounts.hasOwnProperty(patient.resultStatus)) {
        statusCounts[patient.resultStatus]++;
      } else if (patient.resultStatus === 'Added') {
        statusCounts['Added']++;
      } else {
        statusCounts['Pending']++;
      }
    });

    const colors = {
      'Pending': '#f59e0b',
      'Added': '#10b981', 
      'In Progress': '#3b82f6'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status === 'Added' ? 'Completed' : status,
      value: count,
      color: colors[status],
      percentage: patients.length > 0 ? Math.round((count / patients.length) * 100) : 0
    })).filter(item => item.value > 0);
  };

  const statusData = processStatusData();
  const totalTests = statusData.reduce((sum, item) => sum + item.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{data.name}</p>
          <p className="text-gray-600">
            Count: {data.value} tests
          </p>
          <p className="text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-600">
              {entry.value} ({entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Test Status Distribution
          </h3>
          <p className="text-sm text-gray-600">Current status of all tests</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
          <p className="text-sm text-gray-600">Total Tests</p>
        </div>
      </div>
      
      {statusData.length > 0 ? (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <CustomLegend payload={statusData.map(item => ({ 
              value: item.name, 
              color: item.color,
              payload: item 
            }))} />
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No test data available</p>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
        {statusData.map((item, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-2" 
              style={{ backgroundColor: item.color }}
            ></div>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-600">{item.name}</p>
            <p className="text-xs text-gray-500">{item.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestStatusChart;