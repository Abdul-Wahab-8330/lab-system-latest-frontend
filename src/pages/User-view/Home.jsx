import PatientsList from "@/components/PatientsList";
import PaymentComponent from "@/components/PaymentComponent";
import RegisterPatient from "@/components/RegisterPatient";
import ResultAddingComponent from "@/components/ResultAddingComponent";
import ResultPrintComponent from "@/components/ResultPrintComponent";

function UserHome() {
  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold">Welcome to Lab Report System</h1>
      </div>
      <div className="px-5 py-2">
      <RegisterPatient/>
      <PatientsList/>
      <PaymentComponent/>
      <ResultAddingComponent/>
      <ResultPrintComponent/>
      </div>
    </>
  );
}

export default UserHome;
