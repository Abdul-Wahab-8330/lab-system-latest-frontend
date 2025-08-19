
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Image, 
  Globe, 
  FileText, 
  Edit3, 
  Save, 
  Loader2,
  ExternalLink,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchLabInfo = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/lab-info`);
                if (res.data) {
                    setLabInfo(res.data);
                    console.log(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch lab info:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLabInfo();
    }, []);

    const handleChange = (e) => {
        setLabInfo({ ...labInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/lab-info`, labInfo);
            setOpen(false);
            toast.success('Edited Successfully!')
        } catch (error) {
            console.error("Failed to save lab info:", error);
            toast.error('Failed to edit!')
        } finally {
            setSaving(false);
        }
    };

    const getLabAvatar = (labName) => {
        const initial = labName?.charAt(0)?.toUpperCase() || 'L';
        return (
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">{initial}</span>
            </div>
        );
    };

    const InfoRow = ({ icon: Icon, label, value, isLink = false, linkText = null }) => (
        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
                {value ? (
                    isLink ? (
                        <a 
                            href={value} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-purple-600 hover:text-purple-800 underline decoration-purple-300 hover:decoration-purple-500 transition-colors duration-200 flex items-center"
                        >
                            {linkText || value}
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                    ) : (
                        <p className="text-gray-700 break-words">{value}</p>
                    )
                ) : (
                    <p className="text-gray-400 italic">Not specified</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6 min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-lg mb-6">
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Laboratory Information</h1>
                    <p className="text-gray-600">Manage your laboratory details and settings</p>
                </div>

                {/* Main Card */}
                <Card className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden p-0">
                    {/* Card Header */}
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                {getLabAvatar(labInfo.labName)}
                                <div>
                                    <CardTitle className="text-2xl font-bold text-white mb-2">
                                        {labInfo.labName || "Laboratory Name"}
                                    </CardTitle>
                                    <p className="text-purple-100 flex items-center">
                                        <Info className="h-4 w-4 mr-2" />
                                        Laboratory Information Overview
                                    </p>
                                </div>
                            </div>
                            
                            {/* Edit Button */}
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 hover:border-white/50 rounded-xl px-6 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                        disabled={loading}
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit Information
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm p-0 rounded-2xl shadow-2xl border-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                                    {/* Dialog Header */}
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 sticky top-0 z-10">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-white flex items-center">
                                                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                                                    <Edit3 className="h-5 w-5" />
                                                </div>
                                                Edit Laboratory Information
                                            </DialogTitle>
                                        </DialogHeader>
                                    </div>

                                    {/* Dialog Content */}
                                    <div className="p-8">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Lab Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="labName" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <Building2 className="h-4 w-4 mr-2" />
                                                    Laboratory Name *
                                                </Label>
                                                <Input 
                                                    id="labName"
                                                    name="labName" 
                                                    value={labInfo.labName} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter laboratory name" 
                                                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                                    required 
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-2">
                                                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Phone Number *
                                                </Label>
                                                <Input 
                                                    id="phoneNumber"
                                                    name="phoneNumber" 
                                                    value={labInfo.phoneNumber} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter phone number" 
                                                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                                    required 
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Email Address *
                                                </Label>
                                                <Input 
                                                    id="email"
                                                    name="email" 
                                                    type="email" 
                                                    value={labInfo.email} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter email address" 
                                                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                                    required 
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    Laboratory Address
                                                </Label>
                                                <Input 
                                                    id="address"
                                                    name="address" 
                                                    value={labInfo.address} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter laboratory address" 
                                                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                                />
                                            </div>

                                            {/* Logo URL */}
                                            <div className="space-y-2">
                                                <Label htmlFor="logoUrl" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <Image className="h-4 w-4 mr-2" />
                                                    Logo URL
                                                </Label>
                                                <Input 
                                                    id="logoUrl"
                                                    name="logoUrl" 
                                                    value={labInfo.logoUrl} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter logo URL" 
                                                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                                />
                                            </div>

                                            {/* Website */}
                                            <div className="space-y-2">
                                                <Label htmlFor="website" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <Globe className="h-4 w-4 mr-2" />
                                                    Website
                                                </Label>
                                                <Input 
                                                    id="website"
                                                    name="website" 
                                                    value={labInfo.website} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter website URL" 
                                                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Description
                                                </Label>
                                                <Textarea 
                                                    id="description"
                                                    name="description" 
                                                    value={labInfo.description} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter laboratory description" 
                                                    className="min-h-[100px] border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500 resize-none"
                                                />
                                            </div>

                                            {/* Submit Button */}
                                            <Button 
                                                type="submit" 
                                                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Saving Changes...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>

                    {/* Card Content */}
                    <CardContent className="p-8">
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="animate-spin h-12 w-12 border-4 border-gray-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Laboratory Information...</h3>
                                <p className="text-gray-500">Please wait while we fetch your data</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <InfoRow icon={Building2} label="Laboratory Name" value={labInfo.labName} />
                                <InfoRow icon={Phone} label="Phone Number" value={labInfo.phoneNumber} />
                                <InfoRow icon={Mail} label="Email Address" value={labInfo.email} />
                                <InfoRow icon={MapPin} label="Address" value={labInfo.address} />
                                <InfoRow icon={Image} label="Logo" value={labInfo.logoUrl} isLink={true} linkText="View Logo" />
                                <InfoRow icon={Globe} label="Website" value={labInfo.website} isLink={true} />
                                <InfoRow icon={FileText} label="Description" value={labInfo.description} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}