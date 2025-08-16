import FinanceCharts from "@/components/FinanceCharts";
import PatientsList from "@/components/PatientsList";
import PaymentComponent from "@/components/PaymentComponent";
import RegisterPatient from "@/components/RegisterPatient";
import ResultAddingComponent from "@/components/ResultAddingComponent";
import ResultPrintComponent from "@/components/ResultPrintComponent";
import TestsCharts from "@/components/TestsCharts";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import UserManagementCharts from "@/components/UserManagementCharts";

function UserHome() {
  return (
    <div className="overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold">Welcome to Lab Report System</h1>
      </div>
      <div className="px-5 py-2">
        <RegisterPatient />
        <PatientsList />
        <PaymentComponent />
        <ResultAddingComponent />
        <ResultPrintComponent />
        <FinanceCharts />
        <TestsCharts />
        <UserManagementCharts/>
      </div>
    </div>
  );
}

export default UserHome;
