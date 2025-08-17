


import { useContext, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PatientsContext } from "@/context/PatientsContext";
import { DollarSign } from "lucide-react";

function DailyRevenueChart() {
  const { patients, fetchPatients } = useContext(PatientsContext);

  // Memoize the revenue data processing to prevent unnecessary recalculations
  const revenueData = useMemo(() => {
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
  }, [patients]);

  // Memoize calculated totals
  const { totalWeekRevenue, paidRevenue } = useMemo(() => {
    const totalWeekRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
    const paidRevenue = revenueData.reduce((sum, day) => sum + day.paidRevenue, 0);
    return { totalWeekRevenue, paidRevenue };
  }, [revenueData]);

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
          <p className="text-2xl font-bold text-gray-900">
            Rs.{totalWeekRevenue > 0 ? (totalWeekRevenue / 1000).toFixed(1) : '0.0'}K
          </p>
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













// import { useContext, useMemo, useState, useEffect, useCallback } from "react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// import { PatientsContext } from "@/context/PatientsContext";
// import { DollarSign } from "lucide-react";

// function DailyRevenueChart() {
//   const { patients, fetchPatients } = useContext(PatientsContext);
  
//   // State to hold the "frozen" chart data that only updates every 30 seconds
//   const [chartData, setChartData] = useState([]);
//   const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

//   // Function to process revenue data
//   const processRevenueData = useCallback((patientsData) => {
//     if (!patientsData || patientsData.length === 0) return [];

//     const last7Days = [];
//     const today = new Date();
    
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(date.getDate() - i);
//       date.setHours(0, 0, 0, 0);
      
//       const dayData = {
//         date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
//         revenue: 0,
//         paidRevenue: 0,
//         unpaidRevenue: 0,
//         patients: 0
//       };

//       patientsData.forEach(patient => {
//         const patientDate = new Date(patient.createdAt);
//         patientDate.setHours(0, 0, 0, 0);
        
//         if (patientDate.getTime() === date.getTime()) {
//           dayData.patients++;
//           dayData.revenue += patient.total || 0;
//           if (patient.paymentStatus === 'Paid') {
//             dayData.paidRevenue += patient.total || 0;
//           } else {
//             dayData.unpaidRevenue += patient.total || 0;
//           }
//         }
//       });

//       last7Days.push(dayData);
//     }

//     return last7Days;
//   }, []);

//   // Timer-based update effect - updates every 30 seconds
//   useEffect(() => {
//     // Initial load
//     const initialData = processRevenueData(patients);
//     setChartData(initialData);
//     setLastUpdateTime(Date.now());

//     // Set up interval for updates every 30 seconds
//     const interval = setInterval(() => {
//       console.log('Updating chart data after 30 seconds...');
//       const newData = processRevenueData(patients);
//       setChartData(newData);
//       setLastUpdateTime(Date.now());
//     }, 30000); // 30 seconds

//     // Cleanup interval on component unmount
//     return () => clearInterval(interval);
//   }, [patients, processRevenueData]);

//   // Memoize calculated totals based on chartData (not live patients data)
//   const { totalWeekRevenue, paidRevenue } = useMemo(() => {
//     const totalWeekRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
//     const paidRevenue = chartData.reduce((sum, day) => sum + day.paidRevenue, 0);
//     return { totalWeekRevenue, paidRevenue };
//   }, [chartData]);

//   // Memoize the custom tooltip
//   const CustomTooltip = useCallback(({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
//           <p className="text-gray-900 font-medium">{label}</p>
//           <p className="text-green-600">
//             Paid: Rs.{payload[0]?.payload.paidRevenue?.toLocaleString() || 0}
//           </p>
//           <p className="text-red-600">
//             Unpaid: Rs.{payload[0]?.payload.unpaidRevenue?.toLocaleString() || 0}
//           </p>
//           <p className="text-blue-600 font-semibold">
//             Total: Rs.{payload[0]?.value?.toLocaleString() || 0}
//           </p>
//           <p className="text-gray-600 text-sm">
//             Patients: {payload[0]?.payload.patients || 0}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   }, []);

//   // Calculate seconds since last update for display (optional)
//   const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  
//   useEffect(() => {
//     const updateTimer = setInterval(() => {
//       const elapsed = Math.floor((Date.now() - lastUpdateTime) / 1000);
//       setSecondsSinceUpdate(elapsed);
//     }, 1000);

//     return () => clearInterval(updateTimer);
//   }, [lastUpdateTime]);

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//             <DollarSign className="w-5 h-5 text-green-600" />
//             Daily Revenue
//           </h3>
//           <p className="text-sm text-gray-600">
//             Last 7 days revenue breakdown 
//             <span className="ml-2 text-xs text-blue-600">
//               (Updates every 30s • Last: {secondsSinceUpdate}s ago)
//             </span>
//           </p>
//         </div>
//         <div className="text-right">
//           <p className="text-2xl font-bold text-gray-900">
//             Rs.{totalWeekRevenue > 0 ? (totalWeekRevenue / 1000).toFixed(1) : '0.0'}K
//           </p>
//           <p className="text-sm text-green-600">
//             {totalWeekRevenue > 0 ? Math.round((paidRevenue / totalWeekRevenue) * 100) : 0}% collected
//           </p>
//         </div>
//       </div>
      
//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//             <XAxis 
//               dataKey="date" 
//               stroke="#64748b"
//               fontSize={12}
//               tickLine={false}
//             />
//             <YAxis 
//               stroke="#64748b"
//               fontSize={12}
//               tickLine={false}
//               tickFormatter={(value) => `Rs.${(value / 1000).toFixed(0)}K`}
//             />
//             <Tooltip content={<CustomTooltip />} />
//             <Bar 
//               dataKey="revenue" 
//               fill="#3b82f6" 
//               radius={[4, 4, 0, 0]}
//               name="Total Revenue"
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
      
//       <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//           <span className="text-sm text-gray-600">Paid Revenue</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//           <span className="text-sm text-gray-600">Unpaid Revenue</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//           <span className="text-sm text-gray-600">Total Revenue</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DailyRevenueChart;