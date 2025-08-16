import CreateUserForm from "./CreateUserForm"
import CreateTestForm from "./CreateTestForm"
import TestList from "@/components/TestList"
import UserList from "@/components/UserList"
import LabInfoForm from "@/components/LabInfoForm"
import DoctorCard from "@/components/DoctorCard"
import RegisterPatient from "@/components/RegisterPatient"
import PatientsList from "@/components/PatientsList"
import PaymentComponent from "@/components/PaymentComponent"
import PatientCharts from "@/components/PatientCharts"

function AdminDashboard() {
  return (
    <div className="p-6 bg-gray-50 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <CreateUserForm/>
      <UserList/>
      {/* <CreateTestForm />
      <TestList/>
      <LabInfoForm/>
      <DoctorCard/>
      <RegisterPatient/>
      <PatientsList/>
      <PaymentComponent/>  */}
      <PatientCharts/>
    </div>
  )
}

export default AdminDashboard
