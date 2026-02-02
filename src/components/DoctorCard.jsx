import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, User, Loader2, UserCheck, Plus, AlertTriangle, Pencil, Phone, Mail, MapPin, FileText } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../api/axiosInstance";

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
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
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
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button style={{flex:1,height:'2.75rem',backgroundColor:'#ffffff',color:'#374151',border:'2px solid #e5e7eb',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',padding:'0 0.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}
              variant="outline"
              className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200"
              onClick={() => setOpen(false)}
              disabled={confirming}
            >
              {cancelText}
            </Button>
            <Button style={{flex:1,height:'2.75rem',backgroundColor:'#dc2626',color:'#ffffff',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',padding:'0 0.5rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 15px rgba(0,0,0,0.1)'}}
              variant="destructive"
              className="flex-1 h-11 bg-red-600 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" />{confirmText}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reusable form fields component — used by both Add and Edit dialogs
const DoctorFormFields = ({ form, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Name — mandatory */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">Doctor Name<span className="text-red-500">*</span></Label>
        <Input
          type="text"
          placeholder="Enter doctor's full name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="h-11 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-all duration-200"
          required
        />
      </div>

      {/* Commission Section */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-4 mt-2">
        <p className="text-sm font-semibold text-amber-800">💰 Doctor Share (Commission %)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Routine Test % <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 10"
              value={form.routinePercentage}
              onChange={(e) => onChange("routinePercentage", e.target.value)}
              className="h-11 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Special Test % <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 20"
              value={form.specialPercentage}
              onChange={(e) => onChange("specialPercentage", e.target.value)}
              className="h-11 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Clinic Name */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" /> Clinic / Hospital Name
        </Label>
        <Input
          type="text"
          placeholder="e.g., City Hospital"
          value={form.clinicName}
          onChange={(e) => onChange("clinicName", e.target.value)}
          className="h-11 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {/* Phone and Email side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-500" /> Phone Number
          </Label>
          <Input
            type="text"
            placeholder="e.g., 03001234567"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className="h-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-500" /> Email
          </Label>
          <Input
            type="email"
            placeholder="e.g., doctor@email.com"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="h-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" /> Address
        </Label>
        <Input
          type="text"
          placeholder="e.g., 123 Main Street, Lahore"
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          className="h-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {/* Specialty and CNIC side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> Specialty
          </Label>
          <Input
            type="text"
            placeholder="e.g., Cardiology"
            value={form.specialty}
            onChange={(e) => onChange("specialty", e.target.value)}
            className="h-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-500" /> CNIC Number
          </Label>
          <Input
            type="text"
            placeholder="e.g., 38401-1234567-8"
            value={form.cnic}
            onChange={(e) => onChange("cnic", e.target.value)}
            className="h-11 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>


      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" /> Notes
        </Label>
        <textarea
          placeholder="Any additional notes..."
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={2}
          className="w-full h-20 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
        />
      </div>
    </div>
  );
};

// Empty form template — reused for reset
const emptyForm = {
  name: "",
  clinicName: "",
  phone: "",
  email: "",
  address: "",
  specialty: "",
  cnic: "",
  notes: "",
  routinePercentage: 0,
  specialPercentage: 0
};

// Add Doctor Dialog
const AddDoctorDialog = ({ onDoctorAdded }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [adding, setAdding] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setAdding(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/doctors`, form);
      onDoctorAdded(response.data);
      setForm({ ...emptyForm });
      setOpen(false);
      toast.success("Created Successfully!");
    } catch (error) {
      console.error("Failed to add doctor:", error);
      toast.error("Something went wrong!");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button style={{backgroundColor:'#2563eb',color:'#ffffff',border:'1px solid #9ca3af',padding:'0.75rem 1.5rem',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 15px rgba(0,0,0,0.1)'}} className="bg-blue-600  border border-gray-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Referring Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Plus className="h-5 w-5" />
              </div>
              Add Referring Doctor
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <DoctorFormFields form={form} onChange={handleChange} />
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <Button style={{flex:1,height:'2.75rem',backgroundColor:'#ffffff',color:'#374151',border:'2px solid #e5e7eb',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',padding:'0 0.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}
                type="button"
                variant="outline"
                className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200"
                onClick={() => setOpen(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button style={{flex:1,height:'2.75rem',backgroundColor:'#3b82f6',color:'#ffffff',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',padding:'0 0.5rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 15px rgba(0,0,0,0.1)'}}
                type="submit"
                className="flex-1 h-11 bg-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
                disabled={adding || !form.name.trim()}
              >
                {adding ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />Add Doctor</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit Doctor Dialog
const EditDoctorDialog = ({ doctor, onDoctorUpdated }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [updating, setUpdating] = useState(false);

  // Populate form when dialog opens
  const handleOpen = (isOpen) => {
    if (isOpen) {
      setForm({
        name: doctor.name || "",
        clinicName: doctor.clinicName || "",
        phone: doctor.phone || "",
        email: doctor.email || "",
        address: doctor.address || "",
        specialty: doctor.specialty || "",
        cnic: doctor.cnic || "",
        notes: doctor.notes || "",
        routinePercentage: doctor.routinePercentage || 0,
        specialPercentage: doctor.specialPercentage || 0
      });
    }
    setOpen(isOpen);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setUpdating(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/doctors/${doctor._id}`, form);
      onDoctorUpdated(response.data);
      setOpen(false);
      toast.success("Updated Successfully!");
    } catch (error) {
      console.error("Failed to update doctor:", error);
      toast.error("Something went wrong!");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button style={{border:'1px solid transparent',color:'#2563eb',borderRadius:'0.75rem',fontSize:'0.875rem',fontWeight:500,padding:'0.25rem 0.6rem',display:'flex',alignItems:'center',justifyContent:'center'}}
          className="text-blue-600 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200 rounded-xl transition-all duration-200 border-2 border-transparent"
          variant="ghost"
          size="sm"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                <Pencil className="h-5 w-5" />
              </div>
              Edit Doctor — {doctor.name}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <DoctorFormFields form={form} onChange={handleChange} />
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <Button style={{flex:1,height:'2.75rem',backgroundColor:'#ffffff',color:'#374151',border:'2px solid #e5e7eb',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',padding:'0 0.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}
                type="button"
                variant="outline"
                className="flex-1 h-11 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200"
                onClick={() => setOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button style={{flex:1,height:'2.75rem',backgroundColor:'#4f46e5',color:'#ffffff',borderRadius:'0.75rem',fontWeight:600,fontSize:'0.875rem',padding:'0 0.5rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 15px rgba(0,0,0,0.1)'}}
                type="submit"
                className="flex-1 h-11 bg-indigo-600 border  hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
                disabled={updating || !form.name.trim()}
              >
                {updating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                ) : (
                  <><Pencil className="h-4 w-4 mr-2" />Update Doctor</>
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`);
      setDoctors(res.data || []);
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
      toast.success("Deleted Successfully!");
    } catch (error) {
      console.error("Failed to delete doctor:", error);
      toast.error("Failed to Delete!");
    } finally {
      setDeleting(null);
    }
  };

  // Called after adding a new doctor
  const handleDoctorAdded = (newDoc) => {
    setDoctors([...doctors, newDoc]);
  };

  // Called after updating a doctor — replaces the old entry in state
  const handleDoctorUpdated = (updatedDoc) => {
    setDoctors(doctors.map(d => d._id === updatedDoc._id ? updatedDoc : d));
  };

  const getDoctorAvatar = (doctorName) => {
    const initial = doctorName?.charAt(0)?.toUpperCase() || "D";
    return (
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
        <span className="text-sm font-semibold text-white">{initial}</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-3xl shadow-2xl border-0 overflow-hidden m-2">
      {/* Header */}
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
                  {doctors.length} {doctors.length === 1 ? "Referrer" : "Referrers"}
                </span>
              </div>
            )}
            <AddDoctorDialog onDoctorAdded={handleDoctorAdded} />
          </div>
        </div>
      </div>

      {/* Content */}
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
              <div className="space-y-2">
                {doctors.map((doc, index) => (
                  <div
                    key={doc._id}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${index % 2 === 0
                      ? "bg-white border-blue-100 hover:bg-blue-50"
                      : "bg-blue-50/50 border-blue-200 hover:bg-blue-100"
                      }`}
                  >
                    {/* Left side — avatar and info */}
                    <div className="flex items-center space-x-4">
                      {getDoctorAvatar(doc.name)}
                      <div>
                        <div className="text-lg font-bold text-gray-900">{doc.name}</div>
                        {/* Show clinic or specialty if available, otherwise fallback */}
                        <div className="text-sm text-gray-500 flex items-center gap-3">
                          {doc.clinicName && <span className="flex items-center"><FileText className="h-3 w-3 mr-1" />{doc.clinicName}</span>}
                          {doc.specialty && <span className="flex items-center"><User className="h-3 w-3 mr-1" />{doc.specialty}</span>}
                          {!doc.clinicName && !doc.specialty && <span className="flex items-center"><User className="h-3 w-3 mr-1" />Referring Doctor</span>}
                        </div>
                        {/* Commission badges */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                            Routine: {doc.routinePercentage || 0}%
                          </span>
                          <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                            Special: {doc.specialPercentage || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side — Edit and Delete buttons */}
                    <div className="flex items-center gap-2">
                      <EditDoctorDialog doctor={doc} onDoctorUpdated={handleDoctorUpdated} />
                      <ConfirmDialog
                        title="Delete Referring Doctor?"
                        description={`Are you sure you want to delete "${doc.name}" from the referrers list? This action cannot be undone.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(doc._id)}
                        trigger={
                          <Button style={{color:'#dc2626',border:'2px solid transparent',borderRadius:'0.75rem',fontSize:'0.875rem',fontWeight:500,padding:'0.25rem 0.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl transition-all duration-200 border-2 border-transparent"
                            variant="ghost"
                            size="sm"
                            disabled={deleting === doc._id}
                          >
                            {deleting === doc._id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
                            ) : (
                              <><Trash2 className="h-4 w-4 mr-2" />Delete</>
                            )}
                          </Button>
                        }
                      />
                    </div>
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