
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { PatientsContext } from "@/context/PatientsContext";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Printer, Info } from "lucide-react";

export default function ResultPrintComponent() {
    const { fetchPatients,  } = useContext(PatientsContext);
    const [pendingPatients, setPendingPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [testSearch, setTestSearch] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [printPatient, setPrintPatient] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [labInfo, setLabInfo] = useState(null);

    useEffect(() => {
        loadPendingPatients();
        loadLabInfo();

    }, []);

    useEffect(() => {
        let data = [...pendingPatients];
        if (search) {
            data = data.filter(
                (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.refNo.toString().includes(search)
            );
        }
        if (testSearch) {
            data = data.filter((p) =>
                p.tests?.some((t) =>
                    t.testName?.toLowerCase().includes(testSearch.toLowerCase())
                )
            );
        }
        setFilteredPatients(data);
    }, [search, testSearch, pendingPatients]);

    async function loadPendingPatients() {
        try {
            const res = await axios.get("http://localhost:5000/api/results/added");
            const allPatients = res.data || [];
            setPendingPatients(allPatients);
            setFilteredPatients(allPatients);
            fetchPatients()
        } catch (err) {
            console.error("loadPendingPatients:", err);
        }
    }

    async function loadLabInfo() {
        try {
            const res = await axios.get("http://localhost:5000/api/lab-info");
            const info = Array.isArray(res.data) ? res.data[0] || null : res.data;
            setLabInfo(info || null);
        } catch (err) {
            console.error("loadLabInfo:", err);
        }
    }

    async function openPrintPreview(patient) {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/results/${patient._id}/tests`
            );
            setPrintPatient(res.data);
            await loadLabInfo();
            setPreviewOpen(true);
        } catch (err) {
            console.error("openPrintPreview:", err);
        }
    }

    async function openPatientDetails(patient) {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/results/${patient._id}/tests`
            );
            setSelectedPatient(res.data);
            setDetailsOpen(true);
        } catch (err) {
            console.error("openPatientDetails:", err);
        }
    }

    const handlePrint = async () => {
        const content = document.getElementById("printable-report").innerHTML;
        const printWindow = window.open("", "", "width=900,height=650");

        printWindow.document.write(`
      <html>
        <head>
          <title>Lab Report</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #222; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .rp-letterhead { background: #0b4f7a; color: #fff; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; }
            .rp-logo { width:72px; height:72px; object-fit:contain; background: white; padding:8px; border-radius:6px; }
            .rp-patient { display:flex; justify-content:space-between; padding:12px 4px; border-bottom: 2px solid #d0d7de; margin-top:10px; }
            .rp-results th, .rp-results td { border:1px solid #9aa6b2; padding:8px 6px; }
            .rp-results th { background:#f1f5f8; font-weight:700; }
            .rp-test-block { margin-top:12px; border:1px solid #cfd8df; page-break-inside: avoid; }
            .rp-footer-note { margin-top:16px; background:#f4f8fb; padding:12px; font-size:12.5px; border:1px dashed #c5d1da; }
            .rp-signs { display:flex; justify-content:space-between; margin-top:18px; font-size:12px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

        printWindow.document.close();

        // Wait for images to load before printing
        if (labInfo?.logoUrl) {
            const images = printWindow.document.getElementsByTagName('img');
            if (images.length > 0) {
                const imagePromises = Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.onload = resolve;
                            img.onerror = resolve; // Still resolve on error to not block printing
                        }
                    });
                });

                try {
                    await Promise.all(imagePromises);
                    // Small additional delay to ensure rendering
                    setTimeout(() => {
                        printWindow.focus();
                        printWindow.print();
                    }, 100);
                } catch (error) {
                    console.error('Error loading images for print:', error);
                    printWindow.focus();
                    printWindow.print();
                }
            } else {
                printWindow.focus();
                printWindow.print();
            }
        } else {
            printWindow.focus();
            printWindow.print();
        }
    };

    const fmt = (iso) => {
        if (!iso) return "—";
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch {
            return iso;
        }
    };

    return (
        <Card className="p-4 mt-8 bg-white/80 backdrop-blur-md shadow-lg border rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Pending Results to Print
                    <Badge className="border-none bg-gray-700 text-gray-200 rounded-2xl pb-1">
                        {filteredPatients.length}
                    </Badge>
                </h2>
                <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-3 ">
                    <div className="flex items-center relative">
                        <Input
                        placeholder="Search by name or ref no..."
                        className="border md:w-xs w-[250px] border-gray-500 rounded-2xl "
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="w-4 absolute right-3 h-4 text-gray-500" />
                    </div>
                    <div className="flex items-center relative">
                        <Input
                        placeholder="Search by tests..."
                        className="border md:w-xs w-[250px] border-gray-500 rounded-2xl"
                        value={testSearch}
                        onChange={(e) => setTestSearch(e.target.value)}
                    />
                    <Search className="w-4 absolute right-3 h-4 text-gray-500" />
                    </div>

                </div>
            </div>
            <Separator className="mb-4" />
            <div className="overflow-x-auto">
                {filteredPatients.length > 0 ? (
                    <Table>
                        <TableHeader className="bg-gray-300">
                            <TableRow>
                                <TableHead className="font-bold">Ref No</TableHead>
                                <TableHead className="font-bold">Name</TableHead>
                                <TableHead className="font-bold">Gender</TableHead>
                                <TableHead className="font-bold">Details</TableHead>
                                <TableHead className="font-bold">Results Completed</TableHead>
                                <TableHead className="font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPatients
                                .slice()
                                .reverse()
                                .map((p) => (
                                    <TableRow key={p._id} className="hover:bg-purple-50">
                                        <TableCell>{p.refNo}</TableCell>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.gender}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className='bg-amber-100  border border-gray-500'
                                                onClick={() => openPatientDetails(p)}
                                            >
                                                <Info className="text-gray-800" />
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {p.results?.length || 0} / {p.tests?.length || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                size="sm"
                                                onClick={() => openPrintPreview(p)}
                                            >
                                                <Printer className="w-4 h-4 mr-1" /> Preview
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                ) : (
                    <span className="font-semibold text-md px-1 text-gray-600">
                        No Results Pending!
                    </span>
                )}
            </div>

            {/* Patient Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle>Patient Details — {selectedPatient?.name || ""}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {selectedPatient && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Name:</label>
                                        <p className="text-base">{selectedPatient.name || "—"}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Reference No:</label>
                                        <p className="text-base">{selectedPatient.refNo || "—"}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Age:</label>
                                        <p className="text-base">{selectedPatient.age || "—"}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Gender:</label>
                                        <p className="text-base">{selectedPatient.gender || "—"}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Phone:</label>
                                        <p className="text-base">{selectedPatient.phone || "—"}</p>
                                    </div>

                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Referred By:</label>
                                        <p className="text-base">{selectedPatient.referencedBy || "—"}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Total Amount:</label>
                                        <p className="text-base">{selectedPatient.total ? `${selectedPatient.total} PKR` : "—"}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-3">
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Registered:</label>
                                        <p className="text-base">{fmt(selectedPatient.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold text-sm text-gray-600">Last Updated:</label>
                                        <p className="text-base">{fmt(selectedPatient.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tests Information */}
                        {selectedPatient?.tests && selectedPatient.tests.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-3">Ordered Tests</h3>
                                <div className="space-y-3">
                                    {selectedPatient.tests.map((test, index) => (
                                        <Card key={index} className="p-3 bg-cyan-50 shadow-md border-none">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-base">{test.testName}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Fields: {test.fields?.length || 0}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={selectedPatient?.resultStatus?.toLowerCase() == 'added' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                                                >
                                                    {selectedPatient?.resultStatus?.toLowerCase() == 'added' ? "Completed" : "Pending"}
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                </DialogContent>
            </Dialog>

            {/* Print Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl bg-white p-1">
                    <DialogHeader>
                        <DialogTitle>
                            Print Preview — {printPatient?.name || ""}
                            <Separator className='bg-gray-900 mt-3' />
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mb-2">
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handlePrint}
                        >
                            <Printer className="mr-1" /> Print Report
                        </Button>
                        
                    </div>
                    <div
                        id="printable-report"
                        className="mx-auto max-h-[80vh] overflow-y-auto bg-white shadow-lg"
                        style={{ maxWidth: '794px', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.4', color: '#222' }}
                    >
                        {/* HEADER */}
                        <div style={{
                            background: '#0b4f7a',
                            color: '#fff',
                            padding: '18px 22px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                {labInfo?.logoUrl ? (
                                    <img
                                        src={labInfo.logoUrl}
                                        alt="logo"
                                        style={{
                                            width: '72px',
                                            height: '72px',
                                            objectFit: 'contain',
                                            background: 'white',
                                            padding: '8px',
                                            borderRadius: '6px'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '72px',
                                        height: '72px',
                                        objectFit: 'contain',
                                        background: 'white',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#0b4f7a',
                                        fontWeight: 'bold'
                                    }}>LOGO</div>
                                )}
                                <div>
                                    <div style={{ fontSize: '22px', fontWeight: '700' }}>
                                        {labInfo?.labName || "Your Lab Name"}
                                    </div>
                                    <div style={{ fontSize: '13px' }}>{labInfo?.address || ""}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right", fontSize: '13px' }}>
                                <div>{labInfo?.phoneNumber || ""}</div>
                                <div>{labInfo?.email || ""}</div>
                                <div>{labInfo?.website || ""}</div>
                            </div>
                        </div>

                        {/* PATIENT */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 4px',
                            borderBottom: '2px solid #d0d7de',
                            marginTop: '10px'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '16px' }}>
                                    {printPatient?.name || "—"}
                                </div>
                                <div>Age / Sex: {printPatient?.age || "—"} / {printPatient?.gender || "—"}</div>
                                <div>Referred by: {printPatient?.referencedBy || "—"}</div>
                                <div>Reg. no.: {printPatient?.refNo || "—"}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div>Registered: {fmt(printPatient?.createdAt)}</div>
                                <div>Reported: {fmt(printPatient?.updatedAt)}</div>
                            </div>
                        </div>

                        {/* RESULTS */}
                        <div>
                            {printPatient?.tests?.map((test, ti) => (
                                <div key={ti} style={{
                                    marginTop: '12px',
                                    border: '1px solid #cfd8df',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <div style={{
                                        background: "#eef6fb",
                                        padding: "8px 10px",
                                        fontWeight: '700'
                                    }}>
                                        {test.testName}
                                    </div>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        marginTop: '10px'
                                    }}>
                                        <thead>
                                            <tr>
                                                <th style={{
                                                    border: '1px solid #9aa6b2',
                                                    padding: '8px 6px',
                                                    background: '#f1f5f8',
                                                    fontWeight: '700'
                                                }}>TEST</th>
                                                <th style={{
                                                    border: '1px solid #9aa6b2',
                                                    padding: '8px 6px',
                                                    background: '#f1f5f8',
                                                    fontWeight: '700'
                                                }}>VALUE</th>
                                                <th style={{
                                                    border: '1px solid #9aa6b2',
                                                    padding: '8px 6px',
                                                    background: '#f1f5f8',
                                                    fontWeight: '700'
                                                }}>UNIT</th>
                                                <th style={{
                                                    border: '1px solid #9aa6b2',
                                                    padding: '8px 6px',
                                                    background: '#f1f5f8',
                                                    fontWeight: '700'
                                                }}>REFERENCE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {test.fields?.map((f, fi) => (
                                                <tr key={fi}>
                                                    <td style={{
                                                        border: '1px solid #9aa6b2',
                                                        padding: '8px 6px'
                                                    }}>{f.fieldName}</td>
                                                    <td style={{
                                                        textAlign: "center",
                                                        border: '1px solid #9aa6b2',
                                                        padding: '8px 6px'
                                                    }}>{f.defaultValue || "—"}</td>
                                                    <td style={{
                                                        textAlign: "center",
                                                        border: '1px solid #9aa6b2',
                                                        padding: '8px 6px'
                                                    }}>{f.unit || "—"}</td>
                                                    <td style={{
                                                        textAlign: "center",
                                                        border: '1px solid #9aa6b2',
                                                        padding: '8px 6px'
                                                    }}>{f.range || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div style={{
                            marginTop: '16px',
                            background: '#f4f8fb',
                            padding: '12px',
                            fontSize: '12.5px',
                            border: '1px dashed #c5d1da'
                        }}>
                            <strong>Clinical Notes:</strong> {labInfo?.description}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '18px',
                            fontSize: '12px'
                        }}>
                            <div>
                                <div style={{ fontWeight: '700' }}>Lab Incharge</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: '700' }}>Pathologist</div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}