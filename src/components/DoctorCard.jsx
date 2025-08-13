import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddDoctorDialog from "./AddDoctorDialog";
import axios from "axios";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

export default function DoctorCard() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const res = await fetch("http://localhost:5000/api/doctors");
    const data = await res.json();
    setDoctors(data);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/doctors/${id}`);
    setDoctors(doctors.filter((doc) => doc._id !== id));
  };

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">Doctors</h2>
      <ul className="space-y-2">
        {doctors.map((doc) => (
          <li key={doc._id} className="flex justify-between items-center border-b pb-1">
            {doc.name}
            
            <ConfirmDialog
            title="Delete Doctor?"
            description={`Are you sure you want to delete "${doc.name}"?`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDelete(doc._id)}
            trigger={<Button className='border border-transparent text-red-600 hover:border hover:border-red-500' variant="destructive" size="sm" ><Trash2/> Delete</Button>}
          />
          </li>
          
        ))}
      </ul>
      <div className="mt-4">
        <AddDoctorDialog onDoctorAdded={(newDoc) => setDoctors([...doctors, newDoc])} />
      </div>
    </div>
  );
}
