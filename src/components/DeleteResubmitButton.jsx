import { useContext, useState } from "react";
import axios from "../api/axiosInstance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { AddedPatientsContext } from "@/context/AddedPatientsContext";

export default function DeleteResubmitButton({ patientId,setAddedPatients, refreshData, patientName, loadPatients, addedPatients }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {fetchAddedPatients} = useContext(AddedPatientsContext)
  const handleDeleteResubmit = async () => {
    try {
      setLoading(true);
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/results/${patientId}/reset`);
      refreshData();
      loadPatients()
      // setAddedPatients(addedPatients.filter((elem)=>{elem._id !== patientId}))
      setOpen(false);
      toast.success('Results restored! Please go to results section to add results again')
    } catch (error) {
      toast.error("Error deleting and resubmitting results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Button inside table cell */}
      <Button variant="destructive" className='bg-transparent text-red-700 border border-red-700 hover:bg-red-500 hover:text-white' onClick={() => setOpen(true)}>
        <RefreshCcw/> Delete & Resubmit
      </Button>

      {/* Confirmation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete all results for "${patientName}" and resubmit?
              This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className='bg-transparent text-red-700 border border-red-700 hover:bg-red-500 hover:text-white'
              onClick={handleDeleteResubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
