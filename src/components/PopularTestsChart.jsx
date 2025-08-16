import { useContext } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PatientsContext } from "@/context/PatientsContext";
import { TestTube } from "lucide-react";

function PopularTestsChart() {
  const { patients } = useContext(PatientsContext);

  // Process data to get most popular tests
  const processTestData = () => {
    if (!patients || patients.length === 0) return [];

    const testCounts = {};
    let totalRevenue = 0;

    patients.forEach(patient => {
      if (patient.tests && patient.tests.length > 0) {
        patient.tests.forEach(test => {
          const testName = test.testName || 'Unknown Test';
          
          if (!testCounts[testName]) {
            testCounts[testName] = {
              name: testName.length > 20 ? testName.substring(0, 20) + '...' : testName,
              fullName: testName,
              count: 0,
              revenue: 0,
              avgPrice: 0
            };
          }
          
          testCounts[testName].count++;
          testCounts[testName].revenue += test.price || 0;
          totalRevenue += test.price || 0;
        });
      }
    });

    // Calculate average price for each test
    Object.keys(testCounts).forEach(testName => {
      if (testCounts[testName].count > 0) {
        testCounts[testName].avgPrice = Math.round(testCounts[testName].revenue / testCounts[testName].count);
      }
    });

    // Sort by count and get top 8
    const sortedTests = Object.values(testCounts)
      .filter(test => test.count > 0) // Only include tests with actual counts
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return sortedTests.map(test => ({
      ...test,
      revenuePercentage: totalRevenue > 0 ? Math.round((test.revenue / totalRevenue) * 100) : 0
    }));
  };

  const testData = processTestData();
  const totalTests = testData.reduce((sum, test) => sum + test.count, 0);
  const mostPopular = testData[0];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{data.fullName}</p>
          <p className="text-blue-600">
            Orders: {data.count}
          </p>
          <p className="text-green-600">
            Revenue:Rs.{data.revenue?.toLocaleString()}
          </p>
          <p className="text-purple-600">
            Avg Price:Rs.{data.avgPrice?.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            {data.revenuePercentage}% of total revenue
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index) => {
    const colors = [
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316'  // Orange
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            Most Popular Tests
          </h3>
          <p className="text-sm text-gray-600">Top requested lab tests</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
      </div>

      {testData.length > 0 ? (
        <>
         
          {/* Most Popular Test Highlight */}
          {mostPopular && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Most Popular</p>
                  <p className="text-lg font-semibold text-gray-900">{mostPopular.fullName}</p>
                  <p className="text-sm text-purple-600">{mostPopular.count} orders •Rs.{mostPopular.avgPrice} avg</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{mostPopular.revenuePercentage}%</p>
                  <p className="text-xs text-gray-600">of revenue</p>
                </div>
              </div>
            </div>
          )}

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={testData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Test Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{testData.length}</p>
              <p className="text-xs text-gray-600">Different Tests</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
               Rs.{Math.round(testData.reduce((sum, test) => sum + test.avgPrice, 0) / testData.length).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Avg Price</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">
               Rs.{(testData.reduce((sum, test) => sum + test.revenue, 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">
                {mostPopular ? Math.round((mostPopular.count / totalTests) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600">Top Test Share</p>
            </div>
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No test data available</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PopularTestsChart;