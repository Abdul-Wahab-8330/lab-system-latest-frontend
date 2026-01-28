import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2 } from 'lucide-react';
import TestScaleVisualization from './TestScaleVisualization';
import VisualScaleVisualization from './VisualScaleVisualization';
import { useSearchParams } from "react-router-dom";
import SmallTestScaleVisualization from './SmallTestScale';


export default function PrintReport() {
    const { id } = useParams();

    const [printPatient, setPrintPatient] = useState(null);
    const [labInfo, setLabInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const spacer = Number(searchParams.get("spacer")) || 0;

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

    const formatAge = (patient) => {
        if (!patient?.age) return "-";

        const unit =
            patient.ageUnit === "months"
                ? "Months"
                : patient.ageUnit === "days"
                    ? "Days"
                    : "Years"; // default for old records

        return `${patient.age} ${unit}`;
    };


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

          tbody.test-block {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .special-field-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .special-field-container h4,
  .special-field-container p,
  .special-field-container > div {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  tr.print-spacer td {
    border: none;
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
                                    {/*text - scan to see online */}
                                    <div className="flex flex-col">
                                        <div className="text-[11px]">
                                            <div>Scan to View</div>
                                        </div>
                                        <QRCodeSVG
                                            value={`${window.location.origin}/public-report`}
                                            size={70}
                                            level="M"
                                        />
                                        <div className="text-[11px]">
                                            <div>Online Report</div>
                                        </div>
                                    </div>
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
                                                {formatAge(printPatient)} / {printPatient?.gender}
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
                                const testsToRender = printPatient?.tests || [];
                                const nonDiagnosticTests = testsToRender.filter(test => !test.testId?.isDiagnosticTest);

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
                                            {/* Category Header */}
                                            <div className="my-2 -mb-5">
                                                <h3 className="text-md font-bold uppercase">{category} REPORT</h3>
                                            </div>

                                            {/* Mixed Rendering: Special + Narrative + Table */}
                                            {(() => {
                                                // Merge result fields with template specialRender config
                                                const testsWithConfig = testsWithData.map(test => {
                                                    const templateFields = test.testId?.fields || [];
                                                    const mergedFields = test.fields?.map(resultField => {
                                                        const templateField = templateFields.find(
                                                            tf => tf.fieldName === resultField.fieldName
                                                        );
                                                        return {
                                                            ...resultField,
                                                            specialRender: templateField?.specialRender || { enabled: false }
                                                        };
                                                    }) || [];

                                                    return {
                                                        ...test,
                                                        fields: mergedFields
                                                    };
                                                });

                                                // Separate tests by render mode
                                                const specialTests = testsWithConfig.filter(test =>
                                                    test.fields?.some(f => f.specialRender?.enabled)
                                                );

                                                const narrativeTests = testsWithConfig.filter(test =>
                                                    test.testId?.isNarrativeFormat &&
                                                    !test.fields?.some(f => f.specialRender?.enabled)
                                                );

                                                const normalTests = testsWithConfig.filter(test =>
                                                    !test.fields?.some(f => f.specialRender?.enabled) &&
                                                    !test.testId?.isNarrativeFormat
                                                );

                                                return (
                                                    <>
                                                        {/* ========================================
                                            SPECIAL RENDER TESTS (No Table)
                                        ======================================== */}
                                                        {specialTests.map((test, testIndex) => {
                                                            const specialFields = test.fields.filter(
                                                                f => f.specialRender?.enabled &&
                                                                    f.defaultValue &&
                                                                    f.defaultValue.trim() !== "" &&
                                                                    f.defaultValue !== "—"
                                                            );

                                                            if (specialFields.length === 0) return null;

                                                            return (
                                                                <div
                                                                    key={`special-${testIndex}`}
                                                                    style={{
                                                                        pageBreakInside: "avoid",
                                                                        breakInside: "avoid",
                                                                        marginBottom: "16px",
                                                                        marginTop: "16px"
                                                                    }}
                                                                >
                                                                    {/* Test Name Header */}
                                                                    <div className="mt-6">
                                                                        <h3 className="text-sm font-semibold uppercase">{test.testName}</h3>
                                                                    </div>
                                                                    <div className="h-[1px] w-full bg-gray-400 mb-1"></div>

                                                                    {specialFields.map((field, fieldIndex) => (
                                                                        <div
                                                                            key={fieldIndex}
                                                                            className="special-field-container"
                                                                            style={{
                                                                                pageBreakInside: "avoid",
                                                                                breakInside: "avoid",
                                                                                marginBottom: "8px"
                                                                            }}
                                                                        >
                                                                            {/* Field Name */}
                                                                            <h4 className="font-semibold text-gray-900 text-[13px] mb-1">
                                                                                {field.fieldName}
                                                                            </h4>

                                                                            {/* Description and Scale in same row */}
                                                                            <div className="flex items-start justify-between gap-4">
                                                                                {/* Description */}
                                                                                {field.specialRender?.description && (
                                                                                    <p className="text-[11px] text-gray-900 leading-tight flex-1">
                                                                                        {field.specialRender.description}
                                                                                    </p>
                                                                                )}

                                                                                {/* Scale */}
                                                                                {field.specialRender?.scaleConfig && (
                                                                                    <div style={{ width: '180px', flexShrink: 0 }}>
                                                                                        <SmallTestScaleVisualization
                                                                                            scaleConfig={field.specialRender.scaleConfig}
                                                                                            resultValue={field.defaultValue}
                                                                                            unit={field.unit}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="h-[1px] w-full bg-gray-400 mt-2 mb-0"></div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}

                                                        {/* ========================================
                                            NARRATIVE/DESCRIPTIVE TESTS (No Table)
                                        ======================================== */}
                                                        {narrativeTests.map((test, testIndex) => {
                                                            const filledFields = test.fields.filter(
                                                                f => f.defaultValue &&
                                                                    f.defaultValue.trim() !== "" &&
                                                                    f.defaultValue !== "—"
                                                            );

                                                            if (filledFields.length === 0) return null;

                                                            return (
                                                                <div
                                                                    key={`narrative-${testIndex}`}
                                                                    style={{
                                                                        pageBreakInside: "avoid",
                                                                        breakInside: "avoid",
                                                                        marginBottom: "16px",
                                                                        marginTop: "16px"
                                                                    }}
                                                                >
                                                                    {/* Test Name Header */}
                                                                    <div className="mt-6">
                                                                        <h3 className="text-sm font-semibold uppercase">{test.testName}</h3>
                                                                    </div>
                                                                    <div className="h-[1px] w-full bg-gray-400 mb-4"></div>

                                                                    {/* Narrative Fields */}
                                                                    {filledFields.map((field, fieldIndex) => (
                                                                        <div
                                                                            key={fieldIndex}
                                                                            style={{
                                                                                pageBreakInside: "avoid",
                                                                                breakInside: "avoid",
                                                                                marginBottom: "12px"
                                                                            }}
                                                                        >
                                                                            {/* Field Name as Heading */}
                                                                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                                                                {field.fieldName}
                                                                            </h4>

                                                                            {/* Field Value as Description */}
                                                                            <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line">
                                                                                {field.defaultValue}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}

                                                        {/* ========================================
                                            NORMAL TABLE TESTS
                                        ======================================== */}
                                                        {normalTests.length > 0 && (
                                                            <table className="text-xs border-collapse mb-2" style={{ width: "83%" }}>
                                                                <thead>
                                                                    <tr className="border-b border-gray-800">
                                                                        <th className="text-left pl-2 font-semibold align-bottom">TEST</th>
                                                                        <th className="text-center font-semibold align-bottom">REFERENCE RANGE</th>
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
                                                                {normalTests.map((test, testIndex) => {
                                                                    const filledFields = test.fields?.filter(
                                                                        f => f.defaultValue &&
                                                                            f.defaultValue.trim() !== "" &&
                                                                            f.defaultValue !== "—"
                                                                    ) || [];

                                                                    return (
                                                                        <tbody
                                                                            key={testIndex}
                                                                            className="test-block"
                                                                            style={{
                                                                                pageBreakInside: "avoid",
                                                                                breakInside: "avoid"
                                                                            }}
                                                                        >
                                                                            {/* TEST NAME */}
                                                                            {test.testName && (
                                                                                <tr>
                                                                                    <td colSpan="4" className="py-2 font-semibold uppercase text-sm">
                                                                                        {test.testName}
                                                                                    </td>
                                                                                </tr>
                                                                            )}

                                                                            {/* FIELDS */}
                                                                            {(() => {
                                                                                const hasCategories = filledFields.some(f => f.category);

                                                                                if (!hasCategories) {
                                                                                    // NO CATEGORIES: Render normally
                                                                                    return filledFields.map((f, fi) => (
                                                                                        <tr key={fi} className="border-b border-gray-400" style={{ borderBottomStyle: "dashed" }}>
                                                                                            <td className="py-0.5 pl-2">{f.fieldName}</td>
                                                                                            <td className="text-center py-0.5">
                                                                                                <div className='whitespace-pre-line'>
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
                                                                                                </div>
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
                                                                                                        <div className='whitespace-pre-line'>
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
                                                                                                        </div>
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

                                                                            {/* TEST SCALE */}
                                                                            {(() => {
                                                                                const testData = test.testId || test;
                                                                                const scaleConfig = testData.scaleConfig;
                                                                                const firstField = test.fields?.[0];
                                                                                const resultValue = firstField?.defaultValue;
                                                                                const unit = firstField?.unit || '';

                                                                                if (!scaleConfig?.thresholds || !scaleConfig?.labels || !resultValue) return null;

                                                                                return (
                                                                                    <tr>
                                                                                        <td colSpan="4">
                                                                                            <TestScaleVisualization
                                                                                                scaleConfig={scaleConfig}
                                                                                                resultValue={resultValue}
                                                                                                unit={unit}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })()}

                                                                            {/* VISUAL SCALE */}
                                                                            {(() => {
                                                                                const testData = test.testId || test;
                                                                                const visualScale = testData.visualScale;
                                                                                const firstField = test.fields?.[0];
                                                                                const resultValue = firstField?.defaultValue;
                                                                                const unit = firstField?.unit || '';

                                                                                if (!visualScale?.thresholds || !visualScale?.labels || !resultValue) return null;

                                                                                return (
                                                                                    <tr>
                                                                                        <td colSpan="4">
                                                                                            <VisualScaleVisualization
                                                                                                visualScale={visualScale}
                                                                                                resultValue={resultValue}
                                                                                                unit={unit}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })()}

                                                                            {/* REPORT EXTRAS */}
                                                                            {(() => {
                                                                                const extras = (test.testId || test)?.reportExtras;
                                                                                if (!extras || Object.keys(extras).length === 0) return null;

                                                                                return (
                                                                                    <tr>
                                                                                        <td colSpan="4">
                                                                                            {Object.entries(extras).map(([key, value]) => {
                                                                                                if (!value || (typeof value === 'string' && !value.trim())) return null;

                                                                                                const heading = key.replace(/([A-Z])/g, ' $1').toUpperCase();

                                                                                                return (
                                                                                                    <div key={key} className="mb-3 mt-2">
                                                                                                        <h4 className="font-bold text-sm underline mb-1">
                                                                                                            {heading}
                                                                                                        </h4>

                                                                                                        {typeof value === 'string' ? (
                                                                                                            <p className="text-xs whitespace-pre-line">{value}</p>
                                                                                                        ) : (
                                                                                                            <ol className="list-decimal ml-4 text-xs">
                                                                                                                {value.map((v, i) => <li key={i}>{v}</li>)}
                                                                                                            </ol>
                                                                                                        )}
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })()}
                                                                        </tbody>
                                                                    );
                                                                })}
                                                            </table>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    );
                                });
                            })()}
                        </td>
                    </tr>

                    {/* SPACER ROW */}
                    {spacer > 0 && (
                        <tr className="print-spacer" style={{ height: `${spacer}vh` }}>
                            <td>&nbsp;</td>
                        </tr>
                    )}
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
                                <div className="flex justify-start items-end text-xs mb-1">
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
                                        Opposite THQ Hospital Near Punjab Pharmacy Sahiwal, District Sargodha
                                    </p>
                                    <p>
                                        Contact # 0325-0020111 | Email: doctorlab91@gmail.com
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