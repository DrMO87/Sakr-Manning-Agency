// components/dashboard/Components/Modal/ViewModal/ContractViewModal.jsx
/**
 * ContractViewModal - Contract/Document Detail View Modal
 * 
 * Displays comprehensive contract information including:
 * - Contract details
 * - User information
 * - Principal information
 * - Vessel information
 * - Financial details
 */

import React, { useState } from "react";
import {
    FileText, User, Building, Ship, Calendar, Briefcase, Award,
    DollarSign, Clock, MapPin, Anchor, ShieldCheck, Download, ExternalLink,
    Hash, Globe, CheckCircle2, Waves, Mail, AlertCircle, BookOpen
} from "lucide-react";
import { generateContractPdf } from "../../../../../utils/contractPdfGenerator";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, fallback = "—") =>
    (val !== undefined && val !== null && val !== "" ? val : fallback);

const fmtDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return val; }
};

// Helper to determine highlight level based on expiry date
const getHighlightLevel = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "expired";
    if (diff <= 14) return "critical";
    if (diff <= 30) return "warning";
    if (diff <= 90) return "notice";
    return null;
};

const fmtDateTime = (val) => {
    if (!val) return "—";
    try {
        return new Date(val).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return val; }
};
import Button from "../../Common/Button";
import { BaseInput } from "../../inputs/BaseInput";
import api from "../../../../../services/Auth/api";
import documentsApi from "../../../../../services/Dashboard/documentsApi";
import { downloadsApi } from "../../../../../services/Dashboard/downloadsApi.js";
import {
    ViewDetailModal,
    Section,
    FieldItem,
    AvatarHeader,
    StatusBadge,
} from "./ViewDetailModal";
import { AdminAttachmentsSection } from "../../AdminAttachmentsSection";
import { ToastProvider } from "../../../../../context/ToastContext";

export function ContractViewModal({
    isOpen,
    onClose,
    contract,
    onDelete,
    scale = 1,
    canDelete = true,
}) {
    if (!contract) return null;

    // Get display names
    const userName = contract.user_name ||
        (contract.user?.first_name ? `${contract.user.first_name} ${contract.user.middle_name || ''}`.trim() : `User #${contract.user}`);
    const companyName = contract.company_name || contract.company?.name || `Principal #${contract.company}`;
    const shipName = contract.ship_name || contract.ship?.ship_name || (contract.ship ? `Vessel #${contract.ship}` : "Not Assigned");
    const rankName = contract.rank_name || contract.rank?.name || (contract.rank ? `Rank #${contract.rank}` : "Not Specified");

    // Calculate days remaining/expired
    const getDaysLabel = () => {
        const days = contract.daysToExpiry;
        if (days === null || days === undefined) return "—";
        if (days < 0) return `Expired ${Math.abs(days)} days ago`;
        if (days === 0) return "Expires today";
        return `${days} days remaining`;
    };

    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadingDoc, setIsDownloadingDoc] = useState(null);

    const [isEditingContract, setIsEditingContract] = useState(false);
    const [isSavingContract, setIsSavingContract] = useState(false);
    const [contractForm, setContractForm] = useState({
        status: contract.status || "",
        sign_on_date: contract.sign_on_date || "",
        sign_off_date: contract.sign_off_date || "",
        duration: contract.duration || "",
        repatriation_terms: contract.repatriation_terms || "",
        leave_pay_terms: contract.leave_pay_terms || "",
        salary: contract.salary || "",
        currency: contract.currency || "USD",
    });

    const handleSaveContract = async () => {
        try {
            setIsSavingContract(true);
            await api.patch(`/contracts/contracts/${contract.id}/`, contractForm);
            Object.assign(contract, contractForm);
            setIsEditingContract(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingContract(false);
        }
    };

    const [isEditingContact, setIsEditingContact] = useState(false);
    const [isSavingContact, setIsSavingContact] = useState(false);
    const [contactForm, setContactForm] = useState({
        date_of_birth: contract?.user_details?.date_of_birth || contract?.user?.date_of_birth || "",
        Place_Of_Birth: contract?.user_details?.Place_Of_Birth || contract?.user?.Place_Of_Birth || "",
        address: contract?.user_details?.address || contract?.user?.address || "",
        seaman_book_no: contract?.user_details?.seaman_book_no || contract?.user?.seaman_book_no || "",
        e_reg_no: contract?.user_details?.e_reg_no || contract?.user?.e_reg_no || "",
        license_no: contract?.user_details?.license_no || contract?.user?.license_no || ""
    });

    const handleSaveContact = async () => {
        try {
            setIsSavingContact(true);
            const userId = contract.user_details?.id || contract.user;
            await api.patch(`/users/${userId}/`, contactForm);
            
            if (contract.user_details) {
                Object.assign(contract.user_details, contactForm);
            } else if (contract.user && typeof contract.user === 'object') {
                Object.assign(contract.user, contactForm);
            }
            setIsEditingContact(false);
            alert("Contact details updated successfully!");
        } catch (err) {
            console.error("Failed to update contact details:", err);
            alert("Failed to save contact details.");
        } finally {
            setIsSavingContact(false);
        }
    };

    const handleDocDownload = async (type, filename) => {
        try {
            setIsDownloadingDoc(type);
            const response = await downloadsApi.downloadDocument(contract.user, type);
            downloadsApi.triggerDownload(response, filename);
        } catch (error) {
            console.error(`Failed to download ${type}:`, error);
            alert(`Failed to download file. It might not be uploaded yet or you don't have permission.`);
        } finally {
            setIsDownloadingDoc(null);
        }
    };

    const handleLicenseDownload = async (licenseId, filename) => {
        try {
            setIsDownloadingDoc(`lic_${licenseId}`);
            const response = await downloadsApi.downloadLicense(contract.user, licenseId);
            downloadsApi.triggerDownload(response, filename);
        } catch (error) {
            console.error(`Failed to download license ${licenseId}:`, error);
            alert(`Failed to download license file.`);
        } finally {
            setIsDownloadingDoc(null);
        }
    };

    const renderDownloadLink = (type, hasFile, defaultFilename) => {
        if (!hasFile) return "No Attachments";
        const isCurrent = isDownloadingDoc === type;
        return (
            <span
                onClick={() => handleDocDownload(type, defaultFilename)}
                style={{
                    color: "#3B82F6",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: isCurrent ? "wait" : "pointer",
                    textDecoration: "none",
                    fontWeight: 500,
                    opacity: isCurrent ? 0.7 : 1,
                }}
            >
                {isCurrent ? "Downloading..." : "View / Download"} <ExternalLink size={14} />
            </span>
        );
    };

    const actions = [];

    // Generate PDF client-side from seafarer_application data
    actions.push({
        label: isDownloading ? "Generating PDF..." : "Export Contract PDF",
        onClick: async () => {
            try {
                setIsDownloading(true);
                generateContractPdf(contract);
            } catch (err) {
                console.error("Failed to generate PDF:", err);
                alert("Failed to generate PDF. Please try again.");
            } finally {
                setIsDownloading(false);
            }
        },
        variant: "primary",
    });

    if (canDelete && onDelete) {
        actions.push({
            label: "Delete",
            onClick: () => onDelete(contract.id),
            variant: "danger",
        });
    }
    actions.push({
        label: "Close",
        onClick: onClose,
        variant: "outline",
    });

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] flex bg-slate-50 dark:bg-slate-900">
            <div className="relative w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm z-10 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-500" />
                            Contract Details
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-9">
                            Contract ID: {contract.id}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {actions.map((action, index) => (
                            <Button 
                                key={index} 
                                variant={action.variant} 
                                onClick={action.onClick} 
                                scale={scale}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
                
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header with Status */}
            <AvatarHeader
                name={userName}
                subtitle={`${rankName} at ${companyName}`}
                status={contract.status}
                scale={scale}
            />

            {/* Contract Information */}
            <Section 
                title="Contract Information" 
                icon={FileText} 
                scale={scale} 
                columns={isEditingContract ? 1 : 2}
                headerAction={
                    !isEditingContract ? (
                        <Button variant="outline" size="sm" scale={scale} onClick={() => setIsEditingContract(true)}>
                            Edit Details
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="ghost" size="sm" scale={scale} onClick={() => setIsEditingContract(false)}>Cancel</Button>
                            <Button variant="primary" size="sm" scale={scale} onClick={handleSaveContract}>
                                {isSavingContract ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    )
                }
            >
                {isEditingContract ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: `${Math.round(16 * scale)}px` }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <BaseInput label="Status" name="status" type="select" options={[{value: 'Active', label: 'Active'}, {value: 'Completed', label: 'Completed'}, {value: 'Pending', label: 'Pending'}, {value: 'Signed', label: 'Signed'}, {value: 'Pending Signature', label: 'Pending Signature'}, {value: 'Draft', label: 'Draft'}, {value: 'Cancelled', label: 'Cancelled'}]} value={contractForm.status} onChange={(val) => setContractForm(prev => ({...prev, status: val}))} variant="dashboard" />
                        </div>
                        <BaseInput label="Sign On Date" name="sign_on_date" type="date" value={contractForm.sign_on_date} onChange={(val) => setContractForm(prev => ({...prev, sign_on_date: val}))} variant="dashboard" />
                        <BaseInput label="Sign Off Date" name="sign_off_date" type="date" value={contractForm.sign_off_date} onChange={(val) => setContractForm(prev => ({...prev, sign_off_date: val}))} variant="dashboard" />
                        <BaseInput label="Duration (Months)" name="duration" type="number" value={contractForm.duration} onChange={(val) => setContractForm(prev => ({...prev, duration: val}))} variant="dashboard" />
                        <div style={{ gridColumn: 'span 2' }}>
                            <BaseInput label="Repatriation Terms" name="repatriation_terms" type="textarea" value={contractForm.repatriation_terms} onChange={(val) => setContractForm(prev => ({...prev, repatriation_terms: val}))} variant="dashboard" />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <BaseInput label="Leave Pay Terms" name="leave_pay_terms" type="textarea" value={contractForm.leave_pay_terms} onChange={(val) => setContractForm(prev => ({...prev, leave_pay_terms: val}))} variant="dashboard" />
                        </div>
                    </div>
                ) : (
                    <>
                        <FieldItem label="Contract ID" value={contract.id} scale={scale} />
                        <FieldItem label="Status" value={contract.status} scale={scale} />
                        <FieldItem label="Expiry Progress" value={getDaysLabel()} scale={scale} highlightLevel={contract.expiryCategory} />
                        <FieldItem label="Sign On Date" value={contract.sign_on_date} format="date" iconType="date" scale={scale} />
                        <FieldItem label="Sign Off Date" value={contract.sign_off_date} format="date" iconType="date" scale={scale} highlightLevel={contract.expiryCategory} />
                        <FieldItem label="Duration" value={contract.duration ? `${contract.duration} months` : null} icon={Clock} scale={scale} />
                        <FieldItem label="Expiry Status" value={contract.expiryCategory} scale={scale} highlightLevel={contract.expiryCategory} />
                        {contract.repatriation_terms && <FieldItem label="Repatriation Terms" value={contract.repatriation_terms} scale={scale} />}
                        {contract.leave_pay_terms && <FieldItem label="Leave Pay Terms" value={contract.leave_pay_terms} scale={scale} />}
                    </>
                )}
            </Section>

            {/* Employee Information */}
            <Section 
                title="Employee Information" 
                icon={User} 
                scale={scale} 
                columns={isEditingContact ? 1 : 2}
                headerAction={
                    !isEditingContact ? (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            scale={scale} 
                            onClick={() => setIsEditingContact(true)}
                        >
                            Edit Details
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                scale={scale} 
                                onClick={() => setIsEditingContact(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                scale={scale} 
                                onClick={handleSaveContact}
                            >
                                {isSavingContact ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    )
                }
            >
                {isEditingContact ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: `${Math.round(16 * scale)}px` }}>
                        <BaseInput
                            name="date_of_birth"
                            label="Date of Birth"
                            type="date"
                            value={contactForm.date_of_birth}
                            onChange={(val) => setContactForm(prev => ({...prev, date_of_birth: val}))}
                            variant="dashboard"
                        />
                        <BaseInput
                            name="Place_Of_Birth"
                            label="Place of Birth"
                            type="text"
                            value={contactForm.Place_Of_Birth}
                            onChange={(val) => setContactForm(prev => ({...prev, Place_Of_Birth: val}))}
                            variant="dashboard"
                        />
                        <div style={{ gridColumn: 'span 2' }}>
                            <BaseInput
                                name="address"
                                label="Address"
                                type="text"
                                value={contactForm.address}
                                onChange={(val) => setContactForm(prev => ({...prev, address: val}))}
                                variant="dashboard"
                            />
                        </div>
                        <BaseInput
                            name="seaman_book_no"
                            label="SIRB No."
                            type="text"
                            value={contactForm.seaman_book_no}
                            onChange={(val) => setContactForm(prev => ({...prev, seaman_book_no: val}))}
                            variant="dashboard"
                        />
                        <BaseInput
                            name="e_reg_no"
                            label="E-Reg. No."
                            type="text"
                            value={contactForm.e_reg_no}
                            onChange={(val) => setContactForm(prev => ({...prev, e_reg_no: val}))}
                            variant="dashboard"
                        />
                        <BaseInput
                            name="license_no"
                            label="License No."
                            type="text"
                            value={contactForm.license_no}
                            onChange={(val) => setContactForm(prev => ({...prev, license_no: val}))}
                            variant="dashboard"
                        />
                    </div>
                ) : (
                    <>
                        <FieldItem label="Employee Name" value={userName} scale={scale} />
                        <FieldItem label="Rank" value={rankName} icon={Anchor} scale={scale} />
                        <FieldItem label="Date of Birth" value={contract?.user_details?.date_of_birth || contract?.user?.date_of_birth || "—"} scale={scale} />
                        <FieldItem label="Place of Birth" value={contract?.user_details?.Place_Of_Birth || contract?.user?.Place_Of_Birth || "—"} scale={scale} />
                        <FieldItem label="Address" value={contract?.user_details?.address || contract?.user?.address || "—"} scale={scale} />
                        <FieldItem label="SIRB No." value={contract?.user_details?.seaman_book_no || contract?.user?.seaman_book_no || "—"} scale={scale} />
                        <FieldItem label="E-Reg. No." value={contract?.user_details?.e_reg_no || contract?.user?.e_reg_no || "—"} scale={scale} />
                        <FieldItem label="License No." value={contract?.user_details?.license_no || contract?.user?.license_no || "—"} scale={scale} />
                    </>
                )}
            </Section>

            {/* Assigned Ranks & Certificates */}
            {(contract.coded_rank?.length > 0 || contract.certificates?.length > 0) && (
                <Section title="Qualifications & Rank Details" icon={ShieldCheck} scale={scale} columns={1}>
                    {contract.coded_rank?.length > 0 && (
                        <div style={{ marginBottom: `${Math.round(12 * scale)}px` }}>
                            <span style={{ fontSize: `${Math.round(13 * scale)}px`, color: "#6B7280", display: "block", marginBottom: "4px" }}>Coded Ranks</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {contract.coded_rank.map((cr, idx) => (
                                    <span key={idx} style={{ padding: "4px 8px", background: "#EEF2FF", color: "#4F46E5", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", fontWeight: 500 }}>
                                        {cr.assigned_code || cr.rank_code} - {cr.rank_name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {contract.certificates?.length > 0 && (
                        <div>
                            <span style={{ fontSize: `${Math.round(13 * scale)}px`, color: "#6B7280", display: "block", marginBottom: "4px" }}>Certificates</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {contract.certificates.map((cert, idx) => (
                                    <span key={idx} style={{ padding: "4px 8px", background: "#F3F4F6", color: "#374151", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                                        {cert.code ? `${cert.code} : ` : ""}{cert.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
            )}

            {/* ── Principal Details ────────────────────────────────────────── */}
            <Section title="Principal Details" icon={Building} scale={scale} columns={2}>
                <FieldItem label="Principal Name" value={fmt(contract.company_details?.company_name ?? companyName)} icon={Building} scale={scale} />
                <FieldItem label="Principal Type" value={fmt(contract.company_details?.company_type || contract.company_details?.company_type_name)} icon={Briefcase} scale={scale} />
                <FieldItem label="Country" value={fmt(contract.company_details?.company_flag || contract.company_details?.company_flag_name)} icon={Globe} scale={scale} />
                <FieldItem label="Contact Person" value={fmt(contract.company_details?.contact_person)} icon={User} scale={scale} />
                <FieldItem label="Contact Email" value={fmt(contract.company_details?.contact_email)} icon={Mail} scale={scale} />
                <FieldItem label="Status" value={fmt(contract.company_details?.status)} icon={CheckCircle2} scale={scale} />
            </Section>

            {/* ── Vessel Details ──────────────────────────────────────────────── */}
            <Section title="Vessel Details" icon={Ship} scale={scale} columns={2}>
                <FieldItem label="Vessel Name" value={fmt(contract.ship_details?.ship_name ?? shipName)} icon={Ship} scale={scale} />
                <FieldItem label="IMO Number" value={fmt(contract.ship_details?.imo_number)} icon={Hash} scale={scale} />
                <FieldItem label="Vessel Type" value={fmt(contract.ship_details?.ship_type)} icon={Waves} scale={scale} />
                <FieldItem label="Flag" value={fmt(contract.ship_details?.flag)} icon={Globe} scale={scale} />
                <FieldItem label="Status" value={fmt(contract.ship_details?.status)} icon={CheckCircle2} scale={scale} />
            </Section>

            {/* Job Position Requirements */}
            {contract.job_position_details && (
                <Section title="Job Position Details" icon={FileText} scale={scale} columns={2}>
                    <FieldItem label="Vacancy" value={`${contract.job_position_details.job_position_name}`} scale={scale} />
                    <FieldItem label="Expected Duration" value={`${contract.job_position_details.contract_duration_months} months`} scale={scale} />
                    <FieldItem
                        label="Salary Budget"
                        value={`${Number(contract.job_position_details.salary_min).toLocaleString()} - ${Number(contract.job_position_details.salary_max).toLocaleString()} ${contract.job_position_details.currency}`}
                        scale={scale}
                    />
                    <FieldItem label="Position Remarks" value={contract.job_position_details.remarks || "—"} scale={scale} />
                </Section>
            )}

            {/* Financial Information */}
            <Section title="Financial Information" icon={DollarSign} scale={scale} columns={2}>
                <FieldItem label="Salary" value={contract.salary} format="currency" scale={scale} />
                <FieldItem label="Currency" value={contract.currency || "USD"} scale={scale} />
            </Section>

            {/* User Documents Breakdown */}
            {contract.user_documents && (
                <>
                    {/* Passport Section */}
                    <Section title="Passport" icon={User} scale={scale} columns={2}>
                        <FieldItem label="Passport No." value={fmt(contract.user_documents.passport?.passport_no)} icon={Hash} scale={scale} />
                        <FieldItem label="Issue Date" value={fmtDate(contract.user_documents.passport?.issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Expiry Date" value={fmtDate(contract.user_documents.passport?.expiry_date)} icon={AlertCircle} scale={scale} highlightLevel={getHighlightLevel(contract.user_documents.passport?.expiry_date)} />
                        <FieldItem label="Issued By" value={fmt(contract.user_documents.passport?.issued_by)} icon={Building} scale={scale} />
                        <FieldItem label="Place of Issue" value={fmt(contract.user_documents.passport?.place_of_issue)} icon={MapPin} scale={scale} />
                        {contract.user_documents.passport?.file_url && (
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="outline" size="sm" onClick={() => handleDocDownload('passport', `passport_${contract.user_name}`)} disabled={isDownloadingDoc === 'passport'} scale={scale} title="Download Passport">
                                    <Download size={14} /> Download
                                </Button>
                            </div>
                        )}
                    </Section>

                    {/* Seaman Book Section */}
                    <Section title="Seaman Book" icon={Anchor} scale={scale} columns={2}>
                        <FieldItem label="SB No." value={fmt(contract.user_documents.seaman_book?.seaman_book_no)} icon={Hash} scale={scale} />
                        <FieldItem label="Issue Date" value={fmtDate(contract.user_documents.seaman_book?.issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Expiry Date" value={fmtDate(contract.user_documents.seaman_book?.expiry_date)} icon={AlertCircle} scale={scale} highlightLevel={getHighlightLevel(contract.user_documents.seaman_book?.expiry_date)} />
                        <FieldItem label="Issued By" value={fmt(contract.user_documents.seaman_book?.issued_by)} icon={Building} scale={scale} />
                        <FieldItem label="Place of Issue" value={fmt(contract.user_documents.seaman_book?.place_of_issue)} icon={MapPin} scale={scale} />
                        {contract.user_documents.seaman_book?.file_url && (
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="outline" size="sm" onClick={() => handleDocDownload('seaman_book', `seaman_book_${contract.user_name}`)} disabled={isDownloadingDoc === 'seaman_book'} scale={scale} title="Download Seaman Book">
                                    <Download size={14} /> Download
                                </Button>
                            </div>
                        )}
                        <div style={{ gridColumn: "span 2", height: "1px", background: "#E5E7EB", margin: "8px 0" }} />
                        <FieldItem label="Other SB No." value={fmt(contract.user_documents.other_seaman_book?.seaman_book_no)} icon={Hash} scale={scale} />
                        <FieldItem label="Issue Date" value={fmtDate(contract.user_documents.other_seaman_book?.issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Expiry Date" value={fmtDate(contract.user_documents.other_seaman_book?.expiry_date)} icon={AlertCircle} scale={scale} highlightLevel={getHighlightLevel(contract.user_documents.other_seaman_book?.expiry_date)} />
                        <FieldItem label="Issued By" value={fmt(contract.user_documents.other_seaman_book?.issued_by)} icon={Building} scale={scale} />
                        <FieldItem label="Place of Issue" value={fmt(contract.user_documents.other_seaman_book?.place_of_issue)} icon={MapPin} scale={scale} />
                        {contract.user_documents.other_seaman_book?.file_url && (
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="outline" size="sm" onClick={() => handleDocDownload('other_seaman_book', `other_sb_${contract.user_name}`)} disabled={isDownloadingDoc === 'other_seaman_book'} scale={scale} title="Download Other SB">
                                    <Download size={14} /> Download
                                </Button>
                            </div>
                        )}
                    </Section>

                    {/* COC Section */}
                    <Section title="Certificate of Competency (COC)" icon={Award} scale={scale} columns={2}>
                        <FieldItem label="Certificate Name" value={fmt(contract.user_documents.coc?.certificate_name)} icon={Award} scale={scale} />
                        <FieldItem label="Certificate Number" value={fmt(contract.user_documents.coc?.certificate_number)} icon={Hash} scale={scale} />
                        <FieldItem label="Issue Date" value={fmtDate(contract.user_documents.coc?.issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Expiry Date" value={fmtDate(contract.user_documents.coc?.expiry_date)} icon={AlertCircle} scale={scale} highlightLevel={getHighlightLevel(contract.user_documents.coc?.expiry_date)} />
                        <FieldItem label="Issued By" value={fmt(contract.user_documents.coc?.issued_by)} icon={Building} scale={scale} />
                        <FieldItem label="Issued At" value={fmt(contract.user_documents.coc?.issued_at)} icon={MapPin} scale={scale} />
                        {contract.user_documents.coc?.file_url && (
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="outline" size="sm" onClick={() => handleDocDownload('coc', `coc_${contract.user_name}`)} disabled={isDownloadingDoc === 'coc'} scale={scale} title="Download COC">
                                    <Download size={14} /> Download
                                </Button>
                            </div>
                        )}
                    </Section>

                    {/* GOC Section */}
                    <Section title="General Operator Certificate (GOC)" icon={ShieldCheck} scale={scale} columns={2}>
                        <FieldItem label="Certificate Number" value={fmt(contract.user_documents.goc?.certificate_number)} icon={Hash} scale={scale} />
                        <FieldItem label="Issue Date" value={fmtDate(contract.user_documents.goc?.issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Expiry Date" value={fmtDate(contract.user_documents.goc?.expiry_date)} icon={AlertCircle} scale={scale} highlightLevel={getHighlightLevel(contract.user_documents.goc?.expiry_date)} />
                        <FieldItem label="Issued By" value={fmt(contract.user_documents.goc?.issued_by)} icon={Building} scale={scale} />
                        <FieldItem label="Issued At" value={fmt(contract.user_documents.goc?.issued_at)} icon={MapPin} scale={scale} />
                        {contract.user_documents.goc?.file_url && (
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="outline" size="sm" onClick={() => handleDocDownload('goc', `goc_${contract.user_name}`)} disabled={isDownloadingDoc === 'goc'} scale={scale} title="Download GOC">
                                    <Download size={14} /> Download
                                </Button>
                            </div>
                        )}
                    </Section>

                    {/* Health / Medical Section */}
                    <Section title="Medical & Health Certificates" icon={ShieldCheck} scale={scale} columns={2}>
                        <FieldItem label="Flag State" value={fmt(contract.user_documents.health_certificate?.flag_state)} icon={Globe} scale={scale} />
                        <FieldItem label="Health Cert No." value={fmt(contract.user_documents.health_certificate?.number)} icon={Hash} scale={scale} />
                        <FieldItem label="Issue Date" value={fmtDate(contract.user_documents.health_certificate?.issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Expiry Date" value={fmtDate(contract.user_documents.health_certificate?.expiry_date)} icon={AlertCircle} scale={scale} />
                        <FieldItem label="Issued By" value={fmt(contract.user_documents.health_certificate?.issued_by)} icon={Building} scale={scale} />
                        <FieldItem label="Issued At" value={fmt(contract.user_documents.health_certificate?.issued_at)} icon={MapPin} scale={scale} />
                        <div style={{ gridColumn: "span 2", height: "1px", background: "#E5E7EB", margin: "8px 0" }} />
                        <FieldItem label="Int'l Medical No." value={fmt(contract.user_documents.health_certificate?.international_medical_number)} icon={Hash} scale={scale} />
                        <FieldItem label="Int'l Issue Date" value={fmtDate(contract.user_documents.health_certificate?.international_medical_issue_date)} icon={Calendar} scale={scale} />
                        <FieldItem label="Int'l Expiry Date" value={fmtDate(contract.user_documents.health_certificate?.international_medical_expiry_date)} icon={AlertCircle} scale={scale} />
                        {contract.user_documents.health_certificate?.file_url && (
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="outline" size="sm" onClick={() => handleDocDownload('health_certificate', `medical_${contract.user_name}`)} disabled={isDownloadingDoc === 'health_certificate'} scale={scale} title="Download Medical">
                                    <Download size={14} /> Download
                                </Button>
                            </div>
                        )}
                    </Section>

                    {/* Licenses Section */}
                    {contract.user_documents.licenses?.length > 0 && (
                        <Section title="Professional Licenses" icon={Briefcase} scale={scale} columns={1}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {contract.user_documents.licenses.map((lic, idx) => {
                                    const isCurrentLic = isDownloadingDoc === `lic_${lic.id}`;
                                    return (
                                        <div key={idx} style={{ padding: "16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>{lic.document_name}</div>
                                                    <div style={{ fontSize: "13px", color: "#6B7280" }}>No: {lic.document_number} • {lic.country_of_issue}</div>
                                                </div>
                                                {lic.file_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleLicenseDownload(lic.id, `${lic.document_name}_${contract.user_name}`)}
                                                        disabled={isCurrentLic}
                                                        scale={scale}
                                                        title="Download License"
                                                    >
                                                        <Download size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                <FieldItem label="Issue Date" value={lic.issue_date} format="date" scale={scale} />
                                                <FieldItem label="Expiration Date" value={lic.expiration_date} format="date" scale={scale} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}
                </>
            )}

            {/* Marine Courses */}
            {contract.user_documents?.marine_courses?.length > 0 && (
                <Section title="Marine Courses" icon={BookOpen} scale={scale} columns={1}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {/* Header row */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "3fr 1fr 1fr",
                            gap: "12px",
                            padding: "6px 12px",
                            background: "#EEF2FF",
                            borderRadius: "8px",
                            fontSize: `${Math.round(11 * scale)}px`,
                            fontWeight: 700,
                            color: "#4F46E5",
                        }}>
                            <span>Course Name</span>
                            <span>Issue Date</span>
                            <span>Expiry Date</span>
                        </div>
                        {contract.user_documents.marine_courses.map((course, idx) => (
                            <div
                                key={course.id ?? idx}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "3fr 1fr 1fr",
                                    gap: "12px",
                                    padding: "10px 12px",
                                    background: idx % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ fontSize: `${Math.round(12.5 * scale)}px`, fontWeight: 600, color: "#111827" }}>
                                    {course.course_name}
                                </span>
                                <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: "#374151" }}>
                                    {fmtDate(course.issue_date)}
                                </span>
                                <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: course.expiry_date ? "#374151" : "#9CA3AF" }}>
                                    {fmtDate(course.expiry_date) !== "—" ? fmtDate(course.expiry_date) : "No Expiry"}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Sea Service Records */}
            {contract.user_documents.sea_service?.length > 0 && (
                <Section title="Sea Service Records" icon={Anchor} scale={scale} columns={1}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {/* Header row */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "3fr 1fr 1fr 1fr",
                            gap: "12px",
                            padding: "6px 12px",
                            background: "#E0F2FE",
                            borderRadius: "8px",
                            fontSize: `${Math.round(11 * scale)}px`,
                            fontWeight: 700,
                            color: "#0369A1",
                        }}>
                            <span>Vessel Name</span>
                            <span>Rank</span>
                            <span>Signed On</span>
                            <span>Signed Off</span>
                        </div>
                        {contract.user_documents.sea_service.map((service, idx) => (
                            <div
                                key={service.id ?? idx}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "3fr 1fr 1fr 1fr",
                                    gap: "12px",
                                    padding: "10px 12px",
                                    background: idx % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ fontSize: `${Math.round(12.5 * scale)}px`, fontWeight: 600, color: "#111827" }}>
                                    {service.vessel_name}
                                </span>
                                <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: "#374151" }}>
                                    {fmt(service.rank_name ?? service.rank)}
                                </span>
                                <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: "#374151" }}>
                                    {fmtDate(service.signed_on)}
                                </span>
                                <span style={{ fontSize: `${Math.round(12 * scale)}px`, color: "#374151" }}>
                                    {fmtDate(service.signed_off)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Signed File (If available) */}
            {contract.signed_file && (
                <Section title="Signed Documents" icon={FileText} scale={scale} columns={1}>
                    <div style={{ padding: "12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <FileText size={20} color="#15803D" />
                            <div>
                                <div style={{ fontWeight: 600, color: "#166534", fontSize: "14px" }}>Signed Contract Available</div>
                                <div style={{ fontSize: "12px", color: "#15803D" }}>Signed on: {new Date(contract.signed_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <a
                            href={contract.signed_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: "#166534", color: "white", padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            View Signed Contract <ExternalLink size={14} />
                        </a>
                    </div>
                </Section>
            )}

            {/* Metadata */}
            <Section title="Record Information" icon={Clock} scale={scale} columns={2}>
                <FieldItem label="Generated ID" value={contract.generated_id || "—"} scale={scale} />
                <FieldItem label="Contract Created" value={contract.created_at} format="datetime" scale={scale} />
                <FieldItem label="Last Updated" value={contract.updated_at} format="datetime" scale={scale} />
            </Section>
                {/* Admin Related Attachments */}
                <Section title="Admin Related Attachments" icon={ShieldCheck} scale={scale} columns={1}>
                    <ToastProvider>
                        <AdminAttachmentsSection userId={contract.user?.id || contract.user_details?.id || contract.user} />
                    </ToastProvider>
                </Section>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContractViewModal;
