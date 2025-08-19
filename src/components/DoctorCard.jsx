// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import AddDoctorDialog from "./AddDoctorDialog";
// import axios from "axios";
// import { Trash2 } from "lucide-react";
// import ConfirmDialog from "./ConfirmDialog";

// export default function DoctorCard() {
//   const [doctors, setDoctors] = useState([]);

//   useEffect(() => {
//     fetchDoctors();
//   }, []);

//   const fetchDoctors = async () => {
//     const res = await fetch("http://localhost:5000/api/doctors");
//     const data = await res.json();
//     setDoctors(data);
//   };

//   const handleDelete = async (id) => {
//     await axios.delete(`http://localhost:5000/api/doctors/${id}`);
//     setDoctors(doctors.filter((doc) => doc._id !== id));
//   };

//   return (
//     <div className="p-4 border rounded-lg shadow">
//       <h2 className="text-lg font-bold mb-2">Doctors</h2>
//       <ul className="space-y-2">
//         {doctors.map((doc) => (
//           <li key={doc._id} className="flex justify-between items-center border-b pb-1">
//             {doc.name}
            
//             <ConfirmDialog
//             title="Delete Doctor?"
//             description={`Are you sure you want to delete "${doc.name}"?`}
//             confirmText="Delete"
//             cancelText="Cancel"
//             onConfirm={() => handleDelete(doc._id)}
//             trigger={<Button className='border border-transparent text-red-600 hover:border hover:border-red-500' variant="destructive" size="sm" ><Trash2/> Delete</Button>}
//           />
//           </li>
          
//         ))}
//       </ul>
//       <div className="mt-4">
//         <AddDoctorDialog onDoctorAdded={(newDoc) => setDoctors([...doctors, newDoc])} />
//       </div>
//     </div>
//   );
// }
















import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Trash2, User, Loader2, UserCheck, Plus, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";

// Confirm Dialog Component
const ConfirmDialog = ({ title, description, confirmText, cancelText, onConfirm, trigger }) => {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm();
    setConfirming(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border-0 overflow-hidden">
        {/* Dialog Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <div className="p-2 bg-red-400 rounded-lg mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Dialog Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Action
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200"
              onClick={() => setOpen(false)}
              disabled={confirming}
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {confirmText}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add Doctor Dialog Component
const AddDoctorDialog = ({ onDoctorAdded }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/doctors`, { name });
      onDoctorAdded(response.data);
      setName("");
      setOpen(false);
      toast.success('Created Successfully!')
    } catch (error) {
      console.error("Failed to add doctor:", error);
      toast.error('Something went wrong!')
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Referring Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border-0 overflow-hidden">
        {/* Dialog Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <User className="h-5 w-5" />
              </div>
              Add Referring Doctor
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Dialog Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Add a new referring doctor to your referral network
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorName" className="text-sm font-semibold text-gray-700">
                  Doctor Name
                </Label>
                <Input
                  id="doctorName"
                  type="text"
                  placeholder="Enter doctor's full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200"
                onClick={() => setOpen(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                disabled={adding || !name.trim()}
              >
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Doctor Card Component
export default function DoctorCard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/doctors`);
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/doctors/${id}`);
      setDoctors(doctors.filter((doc) => doc._id !== id));
      toast.success('Deleted Successfully!')
    } catch (error) {
      console.error("Failed to delete doctor:", error);
      toast.error('Failed to Delete!')
    } finally {
      setDeleting(null);
    }
  };

  const getDoctorAvatar = (doctorName) => {
    const initial = doctorName?.charAt(0)?.toUpperCase() || 'D';
    return (
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
        <span className="text-sm font-semibold text-white">{initial}</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl border-0 overflow-hidden m-2">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-xl mr-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Referring Doctors</h2>
              <p className="text-blue-100 text-sm">Manage doctor references and referrals</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!loading && doctors.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="text-white font-medium text-sm flex items-center">
                  <UserCheck className="h-4 w-4 mr-2" />
                  {doctors.length} {doctors.length === 1 ? 'Referrer' : 'Referrers'}
                </span>
              </div>
            )}
            <AddDoctorDialog 
              onDoctorAdded={(newDoc) => setDoctors([...doctors, newDoc])} 
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Referring Doctors...</h3>
            <p className="text-gray-500">Please wait while we fetch referrer data</p>
          </div>
        ) : (
          <>
            {doctors.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Referring Doctors Found</h3>
                <p className="text-gray-500">Add your first referring doctor to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc, index) => (
                  <div
                    key={doc._id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                      index % 2 === 0 
                        ? 'bg-white border-blue-100 hover:bg-blue-50' 
                        : 'bg-blue-50/50 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {getDoctorAvatar(doc.name)}
                      <div>
                        <div className="text-lg font-bold text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          Referring Doctor
                        </div>
                      </div>
                    </div>

                    <ConfirmDialog
                      title="Delete Referring Doctor?"
                      description={`Are you sure you want to delete "${doc.name}" from the referrers list? This action cannot be undone.`}
                      confirmText="Delete"
                      cancelText="Cancel"
                      onConfirm={() => handleDelete(doc._id)}
                      trigger={
                        <Button 
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl transition-all duration-200 border-2 border-transparent" 
                          variant="ghost" 
                          size="sm"
                          disabled={deleting === doc._id}
                        >
                          {deleting === doc._id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}