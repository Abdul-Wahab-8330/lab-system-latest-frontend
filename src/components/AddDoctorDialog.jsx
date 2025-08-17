import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Input } from "./ui/input";

export default function AddDoctorDialog({ onDoctorAdded }) {
    const [name, setName] = useState("");
        const [open, setOpen] = useState(false); // track dialog state


    const handleAdd = async (e) => {
        e.preventDefault()
        if (!name.trim()) return;
        const res = await axios.post("https://labsync-lab-reporting-system-backend.onrender.com/api/doctors", { name });
        if (res.status === 201 || res.status === 200) {
            const newDoctor = res.data;
            onDoctorAdded(newDoctor);
            setName("");
            setOpen(false)
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='bg-purple-700 text-white'>Add Doctor</Button>
            </DialogTrigger>
            <DialogContent className='bg-white'>
                <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd}>
                    <Input
                        className="border p-2 w-full rounded"
                        placeholder="Doctor Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button type='submit' className="mt-3 w-full bg-green-700 text-white" >Save</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
