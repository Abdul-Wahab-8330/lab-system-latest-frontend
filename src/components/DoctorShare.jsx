import React, { useState, useContext, useRef } from "react";
import axios from "@/api/axiosInstance";
import { useReactToPrint } from "react-to-print";
import { DoctorsContext } from "@/context/DoctorsContext";
import { LabInfoContext } from "@/context/LabnfoContext";
import {
    User, FileText, Loader2, Printer, Calendar, BarChart2
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================================
// HELPERS
// ============================================================

// Get first day of current month as YYYY-MM-DD
function getFirstOfMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
}

// Get today as YYYY-MM-DD
function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Format date for display in reports
function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ============================================================
// SHARED: Print Header
// ============================================================
const PrintHeader = ({ info, title, subtitle }) => (
    <div className="mb-3 mt-1">
        <div className="flex items-start">
            {info?.logoUrl && (
                <img src={info.logoUrl} alt="Lab Logo" style={{ height: "64px", width: "64px" }} className="mr-3 object-contain" onError={(e) => (e.target.style.display = "none")} />
            )}
            <div>
                <h1 className="text-lg font-bold">{info?.labName || "Lab Name"}</h1>
                <p className="text-xs text-gray-600">{info?.address || ""}</p>
                <p className="text-xs text-gray-500 italic">{info?.tagline || ""}</p>
            </div>
        </div>
        <div className="text-center mt-2 pb-1.5 border-b-2 border-gray-800">
            <p className="text-sm font-bold text-gray-900">{title}</p>
            {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

// ============================================================
// SHARED: Doctor info header block
// ============================================================
const DoctorInfoBlock = ({ doctor, startDate, endDate }) => (
    <div className="mb-3 text-xs border border-gray-300 bg-gray-50 p-2">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <div>
                <span className="font-semibold text-gray-600">Doctor's Name:</span>{" "}
                <span className="font-bold text-gray-900">{doctor?.name || "N/A"}</span>
            </div>
            {doctor?.clinicName && (
                <div>
                    <span className="font-semibold text-gray-600">Clinic/Hospital:</span>{" "}
                    <span className="text-gray-800">{doctor.clinicName}</span>
                </div>
            )}
            {doctor?.phone && (
                <div>
                    <span className="font-semibold text-gray-600">Phone:</span>{" "}
                    <span className="text-gray-800">{doctor.phone}</span>
                </div>
            )}
            {doctor?.email && (
                <div>
                    <span className="font-semibold text-gray-600">Email:</span>{" "}
                    <span className="text-gray-800">{doctor.email}</span>
                </div>
            )}
            {doctor?.specialty && (
                <div>
                    <span className="font-semibold text-gray-600">Specialty:</span>{" "}
                    <span className="text-gray-800">{doctor.specialty}</span>
                </div>
            )}
            {doctor?.address && (
                <div className="col-span-2">
                    <span className="font-semibold text-gray-600">Address:</span>{" "}
                    <span className="text-gray-800">{doctor.address}</span>
                </div>
            )}
        </div>
        <div className="flex gap-6 mt-2 pt-2 border-t border-gray-300">
            <div>
                <span className="font-semibold text-gray-600">Period From:</span>{" "}
                <span className="text-gray-800">{formatDate(startDate)}</span>
            </div>
            <div>
                <span className="font-semibold text-gray-600">Period To:</span>{" "}
                <span className="text-gray-800">{formatDate(endDate)}</span>
            </div>
        </div>
    </div>
);

// ============================================================
// SHARED: WITH DETAIL table — patient-wise, every test shown
// Columns: Date | Case No | Patient Name | Test Names | Charges | Discount% | Discount Amt | Net Paid | Due | Type | Share
// ============================================================
const DetailTable = ({ patients, showGrandTotal = true }) => {
    // Group patients by date for the date-group headers
    const groupedByDate = {};
    patients.forEach((p) => {
        const dateKey = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Unknown";
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(p);
    });

    let grandCharges = 0;
    let grandDiscount = 0;
    let grandNetPaid = 0;
    let grandDue = 0;
    let grandShare = 0;

    return (
        <table className="w-full text-xs border-collapse border border-gray-800 mt-2" style={{ fontSize: "11.5px" }}>
            <thead>
                <tr className="bg-gray-900 text-white" style={{ fontSize: "12px" }}>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold">Date</th>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold">Case No</th>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold" style={{ minWidth: "90px" }}>Patient's Name</th>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold" style={{ minWidth: "100px" }}>Tests</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Charges</th>
                    <th className="px-2 py-2 text-center border-r border-gray-600 font-bold">Disc%</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Disc Amt</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Net Paid</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Due</th>
                    <th className="px-2 py-2 text-center border-r border-gray-600 font-bold">Type</th>
                    <th className="px-2 py-2 text-right font-bold">Share</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(groupedByDate).map(([dateLabel, patientsInDate]) => {
                    // Date group totals
                    let dateCharges = 0, dateDiscount = 0, dateNetPaid = 0, dateDue = 0, dateShare = 0;

                    const rows = patientsInDate.map((patient, idx) => {
                        const total = patient.total || 0;
                        const discountAmt = patient.discountAmount || 0;
                        const discPct = patient.discountPercentage || (total > 0 ? ((discountAmt / total) * 100) : 0);
                        const netTotal = patient.netTotal || 0;
                        const paidAmount = patient.paidAmount || 0;
                        const dueAmount = patient.dueAmount || 0;

                        // Calculate share per patient using snapshot
                        const snapshot = patient.doctorCommissionSnapshot || { routine: 0, special: 0 };
                        const uniformDiscPct = total > 0 ? (discountAmt / total) * 100 : 0;

                        let patientShare = 0;
                        const tests = (patient.tests || []);
                        tests.forEach((t) => {
                            const testFinal = (t.price || 0) - ((t.price || 0) * uniformDiscPct / 100);
                            const pct = (t.testType === "special") ? snapshot.special : snapshot.routine;
                            patientShare += (testFinal * pct / 100);
                        });
                        patientShare = Math.round(patientShare * 100) / 100;

                        dateCharges += total;
                        dateDiscount += discountAmt;
                        dateNetPaid += paidAmount;
                        dateDue += dueAmount;
                        dateShare += patientShare;

                        const dateStr = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

                        // Build test lines: each test on its own sub-row style
                        const testLines = tests.map((t, ti) => {
                            const testFinal = (t.price || 0) - ((t.price || 0) * uniformDiscPct / 100);
                            const pct = (t.testType === "special") ? snapshot.special : snapshot.routine;
                            const tShare = Math.round((testFinal * pct / 100) * 100) / 100;
                            return { name: t.testName, price: t.price, type: t.testType || "routine", share: tShare };
                        });

                        return (
                            <React.Fragment key={patient._id || idx}>
                                {/* Main patient row */}
                                <tr className="border-b border-gray-200 bg-white">
                                    <td className="px-1.5 py-1 border-r border-gray-300 text-gray-700 align-top">{dateStr}</td>
                                    <td className="px-1.5 py-1 border-r border-gray-300 text-gray-700 align-top font-semibold">{patient.caseNo || "-"}</td>
                                    <td className="px-1.5 py-1 border-r border-gray-300 font-bold text-gray-900 align-top">{patient.name}</td>
                                    <td className="px-1.5 py-0.5 border-r border-gray-300 align-top">
                                        {testLines.map((tl, ti) => (
                                            <div key={ti} className="text-gray-700" style={{ lineHeight: "1.4" }}>{tl.name}</div>
                                        ))}
                                    </td>
                                    <td className="px-1.5 py-0.5 border-r border-gray-300 text-right align-top">
                                        {/* Show per-test prices aligned with test names */}
                                        {testLines.map((tl, ti) => (
                                            <div key={ti} className="text-gray-800">{tl.price}</div>
                                        ))}
                                        <div className="border-t border-gray-400 mt-0.5 font-bold text-gray-900">{total}</div>
                                    </td>
                                    <td className="px-1.5 py-1 border-r border-gray-300 text-center text-gray-700 align-top">{discPct > 0 ? `${Math.round(discPct)}%` : "0"}</td>
                                    <td className="px-1.5 py-1 border-r border-gray-300 text-right text-gray-700 align-top">{discountAmt > 0 ? discountAmt : "0"}</td>
                                    <td className="px-1.5 py-1 border-r border-gray-300 text-right font-bold text-gray-900 align-top">{paidAmount}</td>
                                    <td className="px-1.5 py-1 border-r border-gray-300 text-right text-gray-700 align-top">{dueAmount > 0 ? dueAmount : "0"}</td>
                                    <td className="px-1.5 py-0.5 border-r border-gray-300 text-center align-top">
                                        {testLines.map((tl, ti) => (
                                            <div key={ti}>
                                                <span className={`text-xs px-1 py-0.5 rounded ${tl.type === "special" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                                    {tl.type === "special" ? "Sp" : "Rt"}
                                                </span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-1.5 py-0.5 border-r border-gray-300 text-right align-top">
                                        {testLines.map((tl, ti) => (
                                            <div key={ti} className="text-gray-700 font-semibold">{tl.share}</div>
                                        ))}
                                        <div className="border-t border-gray-400 mt-0.5 font-bold text-gray-900">{patientShare}</div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    });

                    grandCharges += dateCharges;
                    grandDiscount += dateDiscount;
                    grandNetPaid += dateNetPaid;
                    grandDue += dateDue;
                    grandShare += dateShare;

                    return (
                        <React.Fragment key={dateLabel}>
                            {/* Date group header */}
                            <tr>
                                <td colSpan={11} className="px-2 py-1 bg-gray-100 border-b border-gray-400 font-bold text-gray-800 text-left" style={{ fontSize: "11.5px" }}>
                                    {dateLabel}
                                </td>
                            </tr>
                            {rows}
                            {/* Date group total row */}
                            <tr className="bg-gray-500 border-b-2 border-gray-900">
                                <td colSpan={4} className="px-2 py-2 border-r border-gray-400 font-bold text-white text-right">Total</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateCharges * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300"></td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateDiscount * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateNetPaid * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateDue * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300"></td>
                                <td className="px-2 py-2 text-right font-bold text-white">{Math.round(dateShare * 100) / 100}</td>
                            </tr>
                        </React.Fragment>
                    );
                })}
            </tbody>
            {showGrandTotal && (
                <tfoot>
                    <tr className="bg-gray-900 text-white font-bold" style={{ fontSize: "13px" }}>
                        <td colSpan={4} className="px-2 py-3 border-r border-gray-500 text-right">Grand Total</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandCharges * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600"></td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandDiscount * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandNetPaid * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandDue * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600"></td>
                        <td className="px-2 py-2 text-right">{Math.round(grandShare * 100) / 100}</td>
                    </tr>
                </tfoot>
            )}
        </table>
    );
};

// ============================================================
// SHARED: WITHOUT DETAIL table — patient-wise summary WITH SHARE COLUMN
// Columns: Date | Case No | Patient Name | Tests | Charges | Discount/Less | Net Paid | Due Amount | Share
// ============================================================
const SimpleTable = ({ patients, showGrandTotal = true }) => {
    const groupedByDate = {};
    patients.forEach((p) => {
        const dateKey = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Unknown";
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(p);
    });

    let grandCharges = 0, grandDiscount = 0, grandNetPaid = 0, grandDue = 0, grandShare = 0;

    return (
        <table className="w-full text-xs border-collapse border border-gray-800 mt-2" style={{ fontSize: "11.5px" }}>
            <thead>
                <tr className="bg-gray-900 text-white" style={{ fontSize: "12px" }}>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold">Date</th>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold">Case No</th>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold" style={{ minWidth: "100px" }}>Patient's Name</th>
                    <th className="px-2 py-2 text-left border-r border-gray-600 font-bold" style={{ minWidth: "110px" }}>Tests</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Charges</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Discount/Less</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Net Paid</th>
                    <th className="px-2 py-2 text-right border-r border-gray-600 font-bold">Due Amount</th>
                    <th className="px-2 py-2 text-right font-bold">Share</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(groupedByDate).map(([dateLabel, patientsInDate]) => {
                    let dateCharges = 0, dateDiscount = 0, dateNetPaid = 0, dateDue = 0, dateShare = 0;

                    const rows = patientsInDate.map((patient, idx) => {
                        const total = patient.total || 0;
                        const discountAmt = patient.discountAmount || 0;
                        const paidAmount = patient.paidAmount || 0;
                        const dueAmount = patient.dueAmount || 0;

                        // Calculate patient's total share
                        const snapshot = patient.doctorCommissionSnapshot || { routine: 0, special: 0 };
                        const uniformDiscPct = total > 0 ? (discountAmt / total) * 100 : 0;

                        let patientShare = 0;
                        const tests = (patient.tests || []);
                        tests.forEach((t) => {
                            const testFinal = (t.price || 0) - ((t.price || 0) * uniformDiscPct / 100);
                            const pct = (t.testType === "special") ? snapshot.special : snapshot.routine;
                            patientShare += (testFinal * pct / 100);
                        });
                        patientShare = Math.round(patientShare * 100) / 100;

                        dateCharges += total;
                        dateDiscount += discountAmt;
                        dateNetPaid += paidAmount;
                        dateDue += dueAmount;
                        dateShare += patientShare;

                        const dateStr = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
                        const testNames = (patient.tests || []).map((t) => t.testName);

                        return (
                            <tr key={patient._id || idx} className="border-b border-gray-200 bg-white">
                                <td className="px-2 py-1 border-r border-gray-300 text-gray-700 align-top">{dateStr}</td>
                                <td className="px-2 py-1 border-r border-gray-300 text-gray-700 font-semibold align-top">{patient.caseNo || "-"}</td>
                                <td className="px-2 py-1 border-r border-gray-300 font-bold text-gray-900 align-top">{patient.name}</td>
                                <td className="px-2 py-0.5 border-r border-gray-300 align-top">
                                    {testNames.map((name, ti) => (
                                        <div key={ti} className="text-gray-700" style={{ lineHeight: "1.4" }}>{name}</div>
                                    ))}
                                </td>
                                <td className="px-2 py-1 border-r border-gray-300 text-right font-bold text-gray-900 align-top">{total}</td>
                                <td className="px-2 py-1 border-r border-gray-300 text-right text-gray-700 align-top">{discountAmt > 0 ? discountAmt : "0"}</td>
                                <td className="px-2 py-1 border-r border-gray-300 text-right font-bold text-gray-900 align-top">{paidAmount}</td>
                                <td className="px-2 py-1 border-r border-gray-300 text-right text-gray-700 align-top">{dueAmount > 0 ? dueAmount : "0"}</td>
                                <td className="px-2 py-1 text-right font-bold text-gray-900 align-top">{patientShare}</td>
                            </tr>
                        );
                    });

                    grandCharges += dateCharges;
                    grandDiscount += dateDiscount;
                    grandNetPaid += dateNetPaid;
                    grandDue += dateDue;
                    grandShare += dateShare;

                    return (
                        <React.Fragment key={dateLabel}>
                            <tr>
                                <td colSpan={9} className="px-2 py-1 bg-gray-100 border-b border-gray-400 font-bold text-gray-800 text-left" style={{ fontSize: "11.5px" }}>
                                    {dateLabel}
                                </td>
                            </tr>
                            {rows}
                            <tr className="bg-gray-500 border-b-2 border-gray-900">
                                <td colSpan={4} className="px-2 py-2 border-r border-gray-400 font-bold text-white text-right">Total</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateCharges * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateDiscount * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateNetPaid * 100) / 100}</td>
                                <td className="px-2 py-2 border-r border-gray-300 text-right font-bold text-white">{Math.round(dateDue * 100) / 100}</td>
                                <td className="px-2 py-2 text-right font-bold text-white">{Math.round(dateShare * 100) / 100}</td>
                            </tr>
                        </React.Fragment>
                    );
                })}
            </tbody>
            {showGrandTotal && (
                <tfoot>
                    <tr className="bg-gray-900 text-white font-bold" style={{ fontSize: "13px" }}>
                        <td colSpan={4} className="px-2 py-3 border-r border-gray-500 text-right">Grand Total</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandCharges * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandDiscount * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandNetPaid * 100) / 100}</td>
                        <td className="px-2 py-2 border-r border-gray-600 text-right">{Math.round(grandDue * 100) / 100}</td>
                        <td className="px-2 py-2 text-right">{Math.round(grandShare * 100) / 100}</td>
                    </tr>
                </tfoot>
            )}
        </table>
    );
};

// ============================================================
// TAB 1 — DOCTOR STATEMENT
// Single doctor, date range, with/without detail print
// ============================================================
const DoctorStatement = ({ doctors, info }) => {
    const [doctorName, setDoctorName] = useState("");
    const [startDate, setStartDate] = useState(getFirstOfMonth());
    const [endDate, setEndDate] = useState(getToday());
    const [patients, setPatients] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const detailRef = useRef();
    const simpleRef = useRef();

    const handlePrintDetail = useReactToPrint({
        contentRef: detailRef,
        documentTitle: `Doctor_Statement_Detailed_${doctorName}_${startDate}_to_${endDate}`,
    });

    const handlePrintSimple = useReactToPrint({
        contentRef: simpleRef,
        documentTitle: `Doctor_Statement_Summary_${doctorName}_${startDate}_to_${endDate}`,
    });

    const fetchData = async () => {
        if (!doctorName || !startDate || !endDate) return;
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor-share/doctor-patients`, {
                params: { doctorName, startDate, endDate }
            });
            setPatients(res.data.patients);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Simple Heading */}
            <div className="bg-white border border-gray-300 px-4 py-3">
                <h3 className="text-lg font-bold text-gray-900">Doctor Commission Statement</h3>
                <p className="text-xs text-gray-600 mt-1">Generate detailed or summary commission reports for individual doctors</p>
            </div>
            {/* Filters + Print Buttons */}
            <div className="bg-white border border-gray-500 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Doctor */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1"><User className="w-3 h-3" /> Doctor</label>
                        <select value={doctorName}
                            onChange={(e) => {
                                const docName = e.target.value;
                                setDoctorName(docName);
                                setPatients(null);
                                // Find and store the full doctor object
                                const doc = doctors.find(d => d.name === docName);
                                setSelectedDoctor(doc || null);
                            }}
                            className="h-9 border border-gray-400 px-3 text-sm text-gray-700 focus:outline-none focus:border-gray-600 min-w-[200px] bg-white">
                            <option value="">-- Select Doctor --</option>
                            {doctors.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="h-9 border border-gray-400 px-3 text-sm text-gray-700 focus:outline-none focus:border-gray-600" />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1"><Calendar className="w-3 h-3" /> End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="h-9 border border-gray-400 px-3 text-sm text-gray-700 focus:outline-none focus:border-gray-600" />
                    </div>

                    {/* Generate */}
                    <button onClick={fetchData} disabled={!doctorName || !startDate || !endDate || loading}
                        className="h-9 px-5 bg-gray-600 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-700 hover:bg-gray-700">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : <><BarChart2 className="w-4 h-4" /> Generate Report</>}
                    </button>

                    {/* Print buttons */}
                    {patients && (
                        <div className="flex gap-2 ml-2">
                            <button onClick={handlePrintDetail}
                                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 border border-blue-700">
                                <Printer className="w-4 h-4" /> Print Detailed Report
                            </button>
                            <button onClick={handlePrintSimple}
                                className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm flex items-center gap-2 border border-green-700">
                                <Printer className="w-4 h-4" /> Print Summary Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* WITH DETAIL — printable */}
            {patients && (
                <div ref={detailRef} className="bg-white border border-gray-300 p-4">
                    <PrintHeader info={info} title="DOCTOR COMMISSION STATEMENT — DETAILED REPORT" subtitle={`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`} />
                    <DoctorInfoBlock doctor={selectedDoctor} startDate={startDate} endDate={endDate} />
                    <DetailTable patients={patients} />
                </div>
            )}

            {/* WITHOUT DETAIL — printable */}
            {patients && (
                <div ref={simpleRef} className="bg-white border border-gray-300 p-4">
                    <PrintHeader info={info} title="DOCTOR COMMISSION STATEMENT — SUMMARY REPORT" subtitle={`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`} />
                    <DoctorInfoBlock doctor={selectedDoctor} startDate={startDate} endDate={endDate} />
                    <SimpleTable patients={patients} />
                </div>
            )}
        </div>
    );
};

// ============================================================
// TAB 2 — LAB REFERRAL SUMMARY
// All doctors, date range, with/without detail print
// ============================================================
const LabReferralSummary = ({ doctors, info }) => {
    const [startDate, setStartDate] = useState(getFirstOfMonth());
    const [endDate, setEndDate] = useState(getToday());
    const [patients, setPatients] = useState(null);
    const [loading, setLoading] = useState(false);

    const detailRef = useRef();
    const simpleRef = useRef();

    const handlePrintDetail = useReactToPrint({
        contentRef: detailRef,
        documentTitle: `Lab_Referral_Summary_Detailed_${startDate}_to_${endDate}`,
    });

    const handlePrintSimple = useReactToPrint({
        contentRef: simpleRef,
        documentTitle: `Lab_Referral_Summary_Summary_${startDate}_to_${endDate}`,
    });

    const fetchData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor-share/lab-referral-patients`, {
                params: { startDate, endDate }
            });
            setPatients(res.data.patients);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Group patients by doctor for display
    const patientsByDoctor = {};
    if (patients) {
        patients.forEach((p) => {
            const doc = p.referencedBy || "Self";
            if (!patientsByDoctor[doc]) patientsByDoctor[doc] = [];
            patientsByDoctor[doc].push(p);
        });
    }

    return (
        <div className="space-y-4">
            {/* Simple Heading */}
        <div className="bg-white border border-gray-300 px-4 py-3">
            <h3 className="text-lg font-bold text-gray-900">Lab Referral Summary</h3>
            <p className="text-xs text-gray-600 mt-1">View commission summary for all referring doctors in a date range</p>
        </div>
            {/* Filters + Print Buttons */}
            <div className="bg-white border border-gray-500 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Start Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            className="h-9 border border-gray-400 px-3 text-sm text-gray-700 focus:outline-none focus:border-gray-600" />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1"><Calendar className="w-3 h-3" /> End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            className="h-9 border border-gray-400 px-3 text-sm text-gray-700 focus:outline-none focus:border-gray-600" />
                    </div>

                    {/* Generate */}
                    <button onClick={fetchData} disabled={!startDate || !endDate || loading}
                        className="h-9 px-5 bg-gray-600 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-700 hover:bg-gray-700">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : <><BarChart2 className="w-4 h-4" /> Generate Report</>}
                    </button>

                    {/* Print buttons */}
                    {patients && (
                        <div className="flex gap-2 ml-2">
                            <button onClick={handlePrintDetail}
                                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 border border-blue-700">
                                <Printer className="w-4 h-4" /> Print Detailed Report
                            </button>
                            <button onClick={handlePrintSimple}
                                className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm flex items-center gap-2 border border-green-700">
                                <Printer className="w-4 h-4" /> Print Summary Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* WITH DETAIL — printable, grouped by doctor */}
            {patients && (
                <div ref={detailRef} className="bg-white border border-gray-300 p-4">
                    <PrintHeader info={info} title="LAB REFERRAL SUMMARY — DETAILED REPORT (ALL DOCTORS)" subtitle={`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`} />
                    {Object.entries(patientsByDoctor).map(([docName, docPatients]) => {
                        const doctor = doctors.find(d => d.name === docName);
                        return (
                            <div key={docName} className="mt-4">
                                <DoctorInfoBlock doctor={doctor} startDate={startDate} endDate={endDate} />
                                <DetailTable patients={docPatients} showGrandTotal={false} />
                            </div>
                        );
                    })}
                    {/* Overall grand total */}
                    {/* <div className="mt-3 flex justify-end">
                        <div className="bg-gray-800 text-white px-4 py-2 text-xs border border-gray-900">
                            <span className="font-semibold">Grand Total (All Doctors): </span>
                            <span className="font-bold">
                                Charges: {Math.round((patients.reduce((s, p) => s + (p.total || 0), 0)) * 100) / 100} |
                                Net Paid: {Math.round((patients.reduce((s, p) => s + (p.paidAmount || 0), 0)) * 100) / 100}
                            </span>
                        </div>
                    </div> */}
                </div>
            )}

            {/* WITHOUT DETAIL — printable, grouped by doctor */}
            {patients && (
                <div ref={simpleRef} className="bg-white border border-gray-300 p-4">
                    <PrintHeader info={info} title="LAB REFERRAL SUMMARY — SUMMARY REPORT (ALL DOCTORS)" subtitle={`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`} />
                    {Object.entries(patientsByDoctor).map(([docName, docPatients]) => {
                        const doctor = doctors.find(d => d.name === docName);
                        return (
                            <div key={docName} className="mt-4">
                                <DoctorInfoBlock doctor={doctor} startDate={startDate} endDate={endDate} />
                                <SimpleTable patients={docPatients} showGrandTotal={false} />
                            </div>
                        );
                    })}
                    {/* <div className="mt-3 flex justify-end">
                        <div className="bg-gray-800 text-white px-4 py-2 text-xs border border-gray-900">
                            <span className="font-semibold">Grand Total (All Doctors): </span>
                            <span className="font-bold">
                                Charges: {Math.round((patients.reduce((s, p) => s + (p.total || 0), 0)) * 100) / 100} |
                                Net Paid: {Math.round((patients.reduce((s, p) => s + (p.paidAmount || 0), 0)) * 100) / 100}
                            </span>
                        </div>
                    </div> */}
                </div>
            )}
        </div>
    );
};

// ============================================================
// MAIN — Two tabs: Doctor Statement + Lab Referral Summary
// ============================================================
const TABS = [
    { key: "statement", label: "Doctor Statement", icon: FileText },
    { key: "referral", label: "Lab Referral Summary", icon: BarChart2 },
];

export default function DoctorShare() {
    const [activeTab, setActiveTab] = useState("statement");
    const { doctors, loading: doctorsLoading } = useContext(DoctorsContext);
    const { info } = useContext(LabInfoContext);

    if (doctorsLoading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header + Tabs */}
                <div className="bg-white border rounded-t-xl border-gray-400 overflow-hidden mb-5">
                    <div className="bg-blue-700  px-6 py-4 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <User className="w-6 h-6" /> Doctor Commission Reports
                        </h2>
                        <p className="text-gray-300 text-sm mt-1 pl-8">Generate commission and referral statements for referring doctors</p>
                    </div>
                    <div className="flex border-b border-gray-300 bg-gray-100">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 ${isActive ? "border-gray-700 text-gray-900 bg-white" : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}>
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Tab */}
                <div>
                    {activeTab === "statement" && <DoctorStatement doctors={doctors} info={info} />}
                    {activeTab === "referral" && <LabReferralSummary doctors={doctors} info={info} />}
                </div>
            </div>
        </div>
    );
}