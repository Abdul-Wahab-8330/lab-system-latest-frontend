import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth-view/Login";
import AuthLayout from "./pages/Auth-view/AuthLayout";
import UserLayout from "./pages/User-view/UserLayout";
import UserHome from "./pages/User-view/Home";
import AdminLayout from "./pages/Admin-view/AdminLayout";
import AdminDashboard from "./pages/Admin-view/AdminDashboard";
import NotFound from "./pages/not-found/NotFound";
import UnauthPage from "./pages/unauth-page/UnauthPage";
import { Toaster } from "react-hot-toast";
import { useContext } from "react";
import CheckAuth from "./Authentication/CheckAuth";
import { AuthContext } from "./context/AuthProvider";
import UserDashboardLayout from "./components/UserDashboardLayout";
import UserDashboard from "./components/UserDashboard";
import RegisterPatient from "./components/RegisterPatient";
import PatientsList from "./components/PatientsList";
import PaymentComponent from "./components/PaymentComponent";
import ResultAddingComponent from "./components/ResultAddingComponent";
import ResultPrintComponent from "./components/ResultPrintComponent";
import PatientCharts from "./components/PatientCharts";
import AllPatientsComponent from "./components/AllPatientsComponent";
import CreateTestForm from "./pages/Admin-view/CreateTestForm";
import TestList from "./components/TestList";
import CreateUserForm from "./pages/Admin-view/CreateUserForm";
import UserList from "./components/UserList";
import DoctorCard from "./components/DoctorCard";
import LabInfoForm from "./components/LabInfoForm";
import FinanceCharts from "./components/FinanceCharts";
import TestsCharts from "./components/TestsCharts";
import UserManagementCharts from "./components/UserManagementCharts";
import AccessDenied from './components/AccesssDenied'
import InventoryManagement from "./components/InventoryManagement";

const UserManagementRoute = ({ children, user }) => {
    if (user?.userName !== 'abdulwahab123') {
      return <AccessDenied/>;
    }
    return children;
  };


function App() {
  const { isAuthenticated, user } = useContext(AuthContext);


  return (
    <>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Auth Routes */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <UserDashboardLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="create-test" element={<CreateTestForm />} />
          <Route path="all-tests" element={<TestList />} />


          <Route path="create-user" element={
              <UserManagementRoute user={user}>
                <CreateUserForm />
              </UserManagementRoute>
            }
          />
          <Route path="all-users" element={
              <UserManagementRoute user={user}>
                <UserList />
              </UserManagementRoute>
            }
          />



          <Route path="add-reference" element={<DoctorCard />} />
          <Route path="edit-labinfo" element={<LabInfoForm />} />
          <Route path="finance-analytics" element={<FinanceCharts />} />
          <Route path="user-analytics" element={<UserManagementCharts />} />
          <Route path="test-analytics" element={<TestsCharts />} />

          <Route path="inventory" element={<InventoryManagement />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <UserDashboardLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="register-patient" element={<RegisterPatient />} />
          <Route path="patients" element={<PatientsList />} />
          <Route path="all-patients" element={<AllPatientsComponent />} />
          <Route path="payments" element={<PaymentComponent />} />
          <Route path="results" element={<ResultAddingComponent />} />
          <Route path="result-print" element={<ResultPrintComponent />} />
          <Route path="patient-analytics" element={<PatientCharts />} />
        </Route>

        {/* Other Routes */}
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 5000 }}
      />
    </>
  );
}

export default App;
