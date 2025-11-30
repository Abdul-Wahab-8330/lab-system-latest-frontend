import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2 } from 'lucide-react';

export default function PrintReport() {
    const { id } = useParams();

    const [printPatient, setPrintPatient] = useState(null);
    const [labInfo, setLabInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const patientRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/results/${id}/tests`
            );

            // ✅ FILTER: Remove diagnostic tests before setting state
            const filteredPatient = {
                ...patientRes.data,
                tests: patientRes.data.tests.filter(test => test.testId?.isDiagnosticTest !== true)
            };

            setPrintPatient(filteredPatient);

            const labRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/lab-info`
            );
            const info = Array.isArray(labRes.data) ? labRes.data[0] || null : labRes.data;
            setLabInfo(info || null);

        } catch (error) {
            console.error('Error loading print data:', error);
            setError('Failed to load report data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-print when ready
    useEffect(() => {
        if (!loading && printPatient && labInfo && !error) {
            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [loading, printPatient, labInfo, error]);

    // Add error display in render
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading report...</span>
            </div>
        );
    }

    if (!printPatient) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600">Patient not found</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }

          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          table.main-wrapper {
            width: 100%;
            border-collapse: collapse;
            min-height: 100vh;
            display: table;
          }

          thead.print-header {
            display: table-header-group;
          }

          tbody.print-content {
            display: table-row-group;
            height: 100%;
          }

          tbody.print-content tr {
            height: 100%;
          }

          tbody.print-content td {
            vertical-align: top;
            height: 100%;
          }

          tfoot.print-footer {
            display: table-footer-group;
            vertical-align: bottom;
          }

          .print-footer td {
            vertical-align: bottom;
          }

          .test-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .no-margin {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>

            <table className="main-wrapper w-full border-collapse no-margin">
                {/* HEADER */}
                <thead className="print-header">
                    <tr>
                        <td>
                            <div className="flex items-start justify-between border-b-2 border-gray-800 pb-2 mb-2">
                                {/* Left: Logo and Lab Info */}
                                <div className="flex items-start">
                                    {labInfo?.logoUrl && (
                                        <img
                                            src={labInfo.logoUrl}
                                            alt="Lab Logo"
                                            className="h-24 w-24 mr-4 object-contain"
                                            onError={(e) => (e.target.style.display = "none")}
                                        />
                                    )}
                                    <div className="text-left">
                                        <h1 className="text-3xl font-bold mb-1">
                                            <span style={{ letterSpacing: "0.3em" }}>DOCTOR</span>{" "}
                                            <span style={{ letterSpacing: "0.25em" }}>LAB</span>
                                        </h1>
                                        <p className="text-md font-semibold mb-2">
                                            <span style={{ letterSpacing: "0.02em" }}>&</span>{" "}
                                            <span style={{ letterSpacing: "0.08em" }}>
                                                Imaging Center Sahiwal
                                            </span>
                                        </p>
                                        <p className="text-xs italic" style={{ letterSpacing: "0.03em" }}>
                                            Better Diagnosis - Better Treatment
                                        </p>
                                    </div>
                                </div>

                                {/* Right: QR Code and Barcodes */}
                                <div className="flex items-center justify-center">
                                    <div className="mr-6 pt-3">
                                        <div className="flex flex-col items-center">
                                            {/* Patient No */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold">Patient #:</span>
                                                <div className="text-center">
                                                    <svg
                                                        ref={(el) => {
                                                            if (el && printPatient?.refNo) {
                                                                JsBarcode(el, printPatient.refNo, {
                                                                    format: "CODE128",
                                                                    width: 1,
                                                                    height: 20,
                                                                    displayValue: false,
                                                                    margin: 0,
                                                                });
                                                            }
                                                        }}
                                                    ></svg>
                                                    <p className="text-xs mt-0.5">{printPatient?.refNo}</p>
                                                </div>
                                            </div>

                                            {/* Case No */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold">Case #:</span>
                                                <div className="text-center">
                                                    <svg
                                                        ref={(el) => {
                                                            if (el && printPatient?.caseNo) {
                                                                JsBarcode(el, printPatient.caseNo, {
                                                                    format: "CODE128",
                                                                    width: 1,
                                                                    height: 20,
                                                                    displayValue: false,
                                                                    margin: 0,
                                                                });
                                                            }
                                                        }}
                                                    ></svg>
                                                    <p className="text-xs mt-0.5">{printPatient?.caseNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            labName:
                                                labInfo?.labName ||
                                                "DOCTOR LAB & Imaging Center Sahiwal",
                                            address:
                                                labInfo?.address ||
                                                "Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha",
                                            phone: labInfo?.phoneNumber || "0325-0020111",
                                        })}
                                        size={70}
                                        level="M"
                                    />
                                </div>
                            </div>

                            {/* Patient Info Box */}
                            <div className="border-b border-gray-800 pb-3 bg-white">
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold py-0.5 w-1/4">Patient's Name</td>
                                            <td className="py-0.5 w-1/4 font-semibold text-md uppercase">
                                                {printPatient?.name}
                                            </td>
                                            <td className="font-semibold py-0.5 w-1/4">Reg. Date</td>
                                            <td className="py-0.5 w-1/4">
                                                {new Date(printPatient?.createdAt).toLocaleDateString("en-GB")}{" "}
                                                {new Date(printPatient?.createdAt).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Age/Sex</td>
                                            <td className="py-0.5">
                                                {printPatient?.age} Years / {printPatient?.gender}
                                            </td>
                                            <td className="font-semibold py-0.5">Specimen</td>
                                            <td className="py-0.5">
                                                {printPatient?.specimen || "Taken in Lab"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Father/Husband</td>
                                            <td className="py-0.5">{printPatient?.fatherHusbandName || "-"}</td>
                                            <td className="font-semibold py-0.5">Reg. Centre</td>
                                            <td className="py-0.5">Main Lab</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Contact No</td>
                                            <td className="py-0.5">{printPatient?.phone}</td>
                                            <td className="font-semibold py-0.5">Consultant</td>
                                            <td className="py-0.5">{printPatient?.referencedBy || "SELF"}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold py-0.5">Hosp/ MR #</td>
                                            <td className="py-0.5">-</td>
                                            <td className="font-semibold py-0.5">NIC No</td>
                                            <td className="py-0.5">{printPatient?.nicNo || "-"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </thead>

                {/* MAIN CONTENT */}
                <tbody className="print-content">
                    <tr>
                        <td>
                            {/* Group tests by category */}
                            {(() => {
                                // ✅ FILTER: Extra safety - remove diagnostic tests before grouping
                                const nonDiagnosticTests = printPatient?.tests?.filter(test => test.testId?.isDiagnosticTest !== true) || [];

                                const testsByCategory = {};
                                nonDiagnosticTests.forEach(test => {
                                    const category = test.testId?.category || "OTHER TESTS";
                                    if (!testsByCategory[category]) {
                                        testsByCategory[category] = [];
                                    }
                                    testsByCategory[category].push(test);
                                });

                                return Object.entries(testsByCategory).map(([category, categoryTests], catIndex) => {
                                    const testsWithData = categoryTests.filter(test =>
                                        test.fields?.some(f =>
                                            f.defaultValue &&
                                            f.defaultValue.trim() !== "" &&
                                            f.defaultValue !== "—"
                                        )
                                    );

                                    if (testsWithData.length === 0) return null;

                                    return (
                                        <div key={catIndex} className="test-section mb-3 pt-8">
                                            <div className="my-2 -mb-5">
                                                <h3 className="text-md font-bold uppercase">{category} REPORT</h3>
                                            </div>

                                            <table className="text-xs border-collapse mb-2" style={{ width: "83%" }}>
                                                <thead>
                                                    <tr className="border-b border-gray-800">
                                                        <th className="text-left pl-2 font-semibold align-bottom">TEST</th>
                                                        <th className="text-center font-semibold align-bottom">
                                                            REFERENCE RANGE
                                                        </th>
                                                        <th className="text-center font-semibold align-bottom">UNIT</th>
                                                        <th className="text-center font-semibold align-top">
                                                            <div>RESULT</div>
                                                            <div className="text-[10px] font-semibold">
                                                                {printPatient?.refNo}
                                                            </div>
                                                            <div className="text-[10px] font-normal">
                                                                {new Date().toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                }).replace(/ /g, "-")} {" "}
                                                                {new Date().toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {testsWithData.map((test, testIndex) => {
                                                        const filledFields = test.fields?.filter(
                                                            f => f.defaultValue &&
                                                                f.defaultValue.trim() !== "" &&
                                                                f.defaultValue !== "—"
                                                        ) || [];

                                                        return (
                                                            <React.Fragment key={testIndex}>
                                                                {test.testName && test.testName.trim() && (
                                                                    <tr>
                                                                        <td colSpan="4" className="py-2 font-semibold uppercase text-sm">
                                                                            {test.testName}
                                                                        </td>
                                                                    </tr>
                                                                )}

                                                                {(() => {
                                                                    // Check if ANY field has a category
                                                                    const hasCategories = filledFields.some(f => f.category);

                                                                    if (!hasCategories) {
                                                                        // NO CATEGORIES: Render normally (existing behavior)
                                                                        return filledFields.map((f, fi) => (
                                                                            <tr key={fi} className="border-b border-gray-400" style={{ borderBottomStyle: "dashed" }}>
                                                                                <td className="py-0.5 pl-2">{f.fieldName}</td>
                                                                                <td className="text-center py-0.5">
                                                                                    {(() => {
                                                                                        const rangeStr = f.range || "-";
                                                                                        const patientGender = printPatient?.gender?.toUpperCase();
                                                                                        if (rangeStr.includes('M:') || rangeStr.includes('F:')) {
                                                                                            const parts = rangeStr.split(',');
                                                                                            for (let part of parts) {
                                                                                                part = part.trim();
                                                                                                if (patientGender === 'MALE' && part.startsWith('M:')) {
                                                                                                    return part.substring(2).trim();
                                                                                                }
                                                                                                if (patientGender === 'FEMALE' && part.startsWith('F:')) {
                                                                                                    return part.substring(2).trim();
                                                                                                }
                                                                                            }
                                                                                            return rangeStr;
                                                                                        }
                                                                                        return rangeStr;
                                                                                    })()}
                                                                                </td>
                                                                                <td className="text-center py-0.5">{f.unit || "."}</td>
                                                                                <td className="text-center font-semibold py-0.5">
                                                                                    {f.defaultValue}
                                                                                </td>
                                                                            </tr>
                                                                        ));
                                                                    } else {
                                                                        // HAS CATEGORIES: Group by category
                                                                        const fieldsByCategory = {};
                                                                        filledFields.forEach(f => {
                                                                            const cat = f.category || "Other";
                                                                            if (!fieldsByCategory[cat]) {
                                                                                fieldsByCategory[cat] = [];
                                                                            }
                                                                            fieldsByCategory[cat].push(f);
                                                                        });

                                                                        return Object.entries(fieldsByCategory).map(([category, fields], catIdx) => (
                                                                            <React.Fragment key={catIdx}>
                                                                                {/* Category Heading */}
                                                                                <tr>
                                                                                    <td colSpan="4" className="py-1.5 font-bold text-xs uppercase bg-gray-50">
                                                                                        {category}
                                                                                    </td>
                                                                                </tr>

                                                                                {/* Fields in this category */}
                                                                                {fields.map((f, fi) => (
                                                                                    <tr key={fi} className="border-b border-gray-400" style={{ borderBottomStyle: "dashed" }}>
                                                                                        <td className="py-0.5 pl-2">{f.fieldName}</td>
                                                                                        <td className="text-center py-0.5">
                                                                                            {(() => {
                                                                                                const rangeStr = f.range || "-";
                                                                                                const patientGender = printPatient?.gender?.toUpperCase();
                                                                                                if (rangeStr.includes('M:') || rangeStr.includes('F:')) {
                                                                                                    const parts = rangeStr.split(',');
                                                                                                    for (let part of parts) {
                                                                                                        part = part.trim();
                                                                                                        if (patientGender === 'MALE' && part.startsWith('M:')) {
                                                                                                            return part.substring(2).trim();
                                                                                                        }
                                                                                                        if (patientGender === 'FEMALE' && part.startsWith('F:')) {
                                                                                                            return part.substring(2).trim();
                                                                                                        }
                                                                                                    }
                                                                                                    return rangeStr;
                                                                                                }
                                                                                                return rangeStr;
                                                                                            })()}
                                                                                        </td>
                                                                                        <td className="text-center py-0.5">{f.unit || "."}</td>
                                                                                        <td className="text-center font-semibold py-0.5">
                                                                                            {f.defaultValue}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </React.Fragment>
                                                                        ));
                                                                    }
                                                                })()}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>

                                            {/* ✅ ADD REPORT EXTRAS - DYNAMIC NARRATIVE SECTIONS */}
                                            {testsWithData.map((test, testIndex) => {
                                                const testData = test.testId || test;
                                                const extras = testData.reportExtras;

                                                if (!extras || Object.keys(extras).length === 0) {
                                                    return null;
                                                }

                                                return (
                                                    <div key={`extras-${testIndex}`} className="mt-4 mb-4 w-full">
                                                        {Object.entries(extras).map(([key, value]) => {
                                                            if (!value ||
                                                                (typeof value === 'string' && value.trim() === '') ||
                                                                (Array.isArray(value) && value.length === 0)) {
                                                                return null;
                                                            }

                                                            const heading = key
                                                                .replace(/([A-Z])/g, ' $1')
                                                                .trim()
                                                                .split(' ')
                                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                                .join(' ');

                                                            return (
                                                                <div key={key} className="mb-3">
                                                                    <h4 className="font-bold text-sm uppercase mb-1 underline text-gray-800">
                                                                        {heading}:
                                                                    </h4>

                                                                    {typeof value === 'string' ? (
                                                                        <p className="text-xs leading-relaxed text-gray-800 whitespace-pre-line">
                                                                            {value}
                                                                        </p>
                                                                    ) : Array.isArray(value) ? (
                                                                        <ol className="list-decimal list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                                                                            {value.map((item, i) => (
                                                                                <li key={i} className="leading-relaxed">{item}</li>
                                                                            ))}
                                                                        </ol>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}


                                        </div>
                                    );
                                });
                            })()}
                        </td>
                    </tr>
                </tbody>

                {/* FOOTER */}
                <tfoot className="print-footer">
                    <tr>
                        <td>
                            <div className="text-center mb-1 mt-10">
                                <p className="text-xs font-semibold">
                                    Electronically Verified Report, No Signature(s) Required.
                                </p>
                            </div>

                            <div className="border-t border-gray-800 pt-1">
                                <div className="flex justify-start items-end text-xs mb-2">
                                    <div className="">
                                        <p className="font-semibold">Dr. Mudaser Hussain</p>
                                        <p className="text-left">Consultant Pathologist</p>
                                        <p>MBBS, MPhil. (Biochemistry)</p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-[10px] text-gray-600 mb-1">
                                        NOTE: All the tests are performed on the most advanced,
                                        highly sophisticated, appropriate, and state of the art
                                        instruments with highly sensitive chemicals under strict
                                        conditions and with all care and diligence. However, the
                                        above results are NOT the DIAGNOSIS and should be correlated
                                        with clinical findings, patient's history, signs and
                                        symptoms and other diagnostic tests. Lab to lab variation
                                        may occur. This document is NEVER challengeable at any
                                        PLACE/COURT and in any CONDITION.
                                    </p>
                                </div>

                                <div className="text-center text-xs">
                                    <p>
                                        Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District
                                        Sargodha - Contact # 0325-0020111
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}