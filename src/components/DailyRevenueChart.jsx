import { useContext } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PatientsContext } from "@/context/PatientsContext";
import { DollarSign } from "lucide-react";

function DailyRevenueChart() {
  const { patients } = useContext(PatientsContext);

  // Process data to get daily revenue for last 7 days
  const processRevenueData = () => {
    if (!patients || patients.length === 0) return [];

    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayData = {
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0,
        patients: 0
      };

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      patients.forEach(patient => {
        const patientDate = new Date(patient.createdAt);
        patientDate.setHours(0, 0, 0, 0);
        
        if (patientDate.getTime() === date.getTime()) {
          dayData.patients++;
          dayData.revenue += patient.total || 0;
          if (patient.paymentStatus === 'Paid') {
            dayData.paidRevenue += patient.total || 0;
          } else {
            dayData.unpaidRevenue += patient.total || 0;
          }
        }
      });

      last7Days.push(dayData);
    }

    return last7Days;
  };

  const revenueData = processRevenueData();
  const totalWeekRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const paidRevenue = revenueData.reduce((sum, day) => sum + day.paidRevenue, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{label}</p>
          <p className="text-green-600">
            Paid: Rs.{payload[0]?.payload.paidRevenue?.toLocaleString() || 0}
          </p>
          <p className="text-red-600">
            Unpaid: Rs.{payload[0]?.payload.unpaidRevenue?.toLocaleString() || 0}
          </p>
          <p className="text-blue-600 font-semibold">
            Total: Rs.{payload[0]?.value?.toLocaleString() || 0}
          </p>
          <p className="text-gray-600 text-sm">
            Patients: {payload[0]?.payload.patients || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Daily Revenue
          </h3>
          <p className="text-sm text-gray-600">Last 7 days revenue breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">Rs.{(totalWeekRevenue / 1000).toFixed(1)}K</p>
          <p className="text-sm text-green-600">
            {totalWeekRevenue > 0 ? Math.round((paidRevenue / totalWeekRevenue) * 100) : 0}% collected
          </p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Total Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Paid Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Unpaid Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Total Revenue</span>
        </div>
      </div>
    </div>
  );
}

export default DailyRevenueChart;