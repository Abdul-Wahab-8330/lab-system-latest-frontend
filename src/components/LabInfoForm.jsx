import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LabInfoForm() {
    const [labInfo, setLabInfo] = useState({
        labName: "",
        phoneNumber: "",
        email: "",
        address: "",
        logoUrl: "",
        website: "",
        description: "",
    });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5000/api/lab-info").then(res => {
            if (res.data) {
                setLabInfo(res.data);
                console.log(res.data)
            }

        });
    }, []);

    const handleChange = (e) => {
        setLabInfo({ ...labInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("http://localhost:5000/api/lab-info", labInfo);
        setOpen(false);
    };

    return (
        // <div>
        //   <Dialog open={open} onOpenChange={setOpen}>
        //     <DialogTrigger asChild>
        //       <Button>Edit Lab Info</Button>
        //     </DialogTrigger>
        //     <DialogContent>
        //       <DialogHeader>
        //         <DialogTitle>Lab Information</DialogTitle>
        //       </DialogHeader>
        //       <form onSubmit={handleSubmit} className="space-y-4">
        //         <Input name="labName" value={labInfo.labName} onChange={handleChange} placeholder="Lab Name" required />
        //         <Input name="phoneNumber" value={labInfo.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
        //         <Input name="email" type="email" value={labInfo.email} onChange={handleChange} placeholder="Email" required />
        //         <Input name="address" value={labInfo.address} onChange={handleChange} placeholder="Address" />
        //         <Input name="logoUrl" value={labInfo.logoUrl} onChange={handleChange} placeholder="Logo URL" />
        //         <Input name="website" value={labInfo.website} onChange={handleChange} placeholder="Website" />
        //         <Input name="additionalInfo" value={labInfo.additionalInfo} onChange={handleChange} placeholder="Additional Info" />
        //         <Button type="submit">Save</Button>
        //       </form>
        //     </DialogContent>
        //   </Dialog>
        // </div>
        <div className="p-6">
            <Card className="bg-white shadow-xl rounded-3xl border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg font-bold  text-gray-800">Lab Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-700">
                    <p><strong>Lab Name:</strong> {labInfo.labName}</p>
                    <p><strong>Phone:</strong> {labInfo.phoneNumber}</p>
                    <p><strong>Email:</strong> {labInfo.email}</p>
                    <p><strong>Address:</strong> {labInfo.address || "—"}</p>
                    <p><strong>Logo:</strong> {labInfo.logoUrl ? <a href={labInfo.logoUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">View Logo</a> : "—"}</p>
                    <p><strong>Website:</strong> {labInfo.website ? <a href={labInfo.website} target="_blank" rel="noreferrer" className="text-blue-500 underline">{labInfo.website}</a> : "—"}</p>
                    <p><strong>Description:</strong> {labInfo.description || "—"}</p>

                    {/* Edit Button + Dialog */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="mt-4 bg-purple-700 text-white">Edit</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-lg shadow-lg p-6">
                            <DialogHeader>
                                <DialogTitle>Edit Lab Information</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input name="labName" value={labInfo.labName} onChange={handleChange} placeholder="Lab Name" required />
                                <Input name="phoneNumber" value={labInfo.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
                                <Input name="email" type="email" value={labInfo.email} onChange={handleChange} placeholder="Email" required />
                                <Input name="address" value={labInfo.address} onChange={handleChange} placeholder="Address" />
                                <Input name="logoUrl" value={labInfo.logoUrl} onChange={handleChange} placeholder="Logo URL" />
                                <Input name="website" value={labInfo.website} onChange={handleChange} placeholder="Website" />
                                <Input name="description" value={labInfo.description} onChange={handleChange} placeholder="description" />
                                <Button type="submit" className="w-full bg-green-700 text-white">Save</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
