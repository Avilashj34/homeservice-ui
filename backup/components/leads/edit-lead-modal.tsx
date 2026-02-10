import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Lead, LeadServiceIssue } from "@/lib/api/leads";
import { StatusAPI } from "@/lib/api/status";
import { ServiceAPI, Service } from "@/lib/api/services"; // Import ServiceAPI
import { ServiceIssueManager } from "@/components/leads/service-issue-manager";
import { Checkbox } from "@/components/ui/checkbox";

interface EditLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
    onSave: (id: number, data: Partial<Lead>) => Promise<void>;
    userRole?: string; // New prop
}

export function EditLeadModal({ isOpen, onClose, lead, onSave, userRole }: EditLeadModalProps) {
    const [name, setName] = useState(lead.customer_name);
    const [source, setSource] = useState(lead.source);
    const [address, setAddress] = useState(lead.address || "");
    const [loading, setLoading] = useState(false);

    // Service Logic
    const [serviceInterest, setServiceInterest] = useState<string>(lead.is_mobile_repair ? "Mobile Repair Service" : "Home Service");
    const [serviceLevel, setServiceLevel] = useState<string>(lead.service_level || "");
    const [availableServices, setAvailableServices] = useState<Service[]>([]);

    // New Fields
    const [notes, setNotes] = useState(lead.notes || "");
    const [estimatedCost, setEstimatedCost] = useState(lead.estimated_cost?.toString() || "");

    // Mobile Fields
    const [mobileBrand, setMobileBrand] = useState(lead.mobile_brand || "");
    const [mobileModel, setMobileModel] = useState(lead.mobile_model || "");
    const [mobileIssue, setMobileIssue] = useState(lead.mobile_issue || "");
    const [serviceIssues, setServiceIssues] = useState<LeadServiceIssue[]>(lead.service_issues || []);

    // Status Field
    const [statusId, setStatusId] = useState<string>(lead.status_id?.toString() || "");
    const [statuses, setStatuses] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            setName(lead.customer_name);
            setSource(lead.source);
            setAddress(lead.address || "");
            setNotes(lead.notes || "");
            setEstimatedCost(lead.estimated_cost?.toString() || "");

            setMobileBrand(lead.mobile_brand || "");
            setMobileModel(lead.mobile_model || "");
            setMobileIssue(lead.mobile_issue || "");
            setServiceIssues(lead.service_issues || []);
            setStatusId(lead.status_id?.toString() || "");

            // Init Service State
            const isMobile = lead.is_mobile_repair;
            setServiceInterest(isMobile ? "Mobile Repair Service" : "Home Service");
            setServiceLevel(lead.service_level || "");

            // Fetch Data
            StatusAPI.getAll().then(setStatuses).catch(console.error);
            ServiceAPI.getAll().then(setAvailableServices).catch(console.error);
        }
    }, [isOpen, lead]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const isMobile = serviceInterest === "Mobile Repair Service";
            const servicesList = [serviceInterest]; // "Mobile Repair Service" or "Home Service"

            const payload: any = {};

            // Operation Role: Only Status Check
            if (userRole === "operation") {
                if (statusId) payload.status_id = parseInt(statusId);
            } else {
                // Full Update
                Object.assign(payload, {
                    customer_name: name,
                    source,
                    address,
                    services: servicesList,
                    service_level: isMobile ? "Mobile Repair" : serviceLevel,
                    notes,
                    estimated_cost: parseFloat(estimatedCost) || 0,
                    is_mobile_repair: isMobile,
                    mobile_brand: isMobile ? mobileBrand : null,
                    mobile_model: isMobile ? mobileModel : null,
                    mobile_issue: isMobile ? mobileIssue : null,
                    service_issues: serviceIssues,
                    status_id: statusId ? parseInt(statusId) : undefined
                });
            }

            await onSave(lead.id, payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check disabled state
    const isDisabled = userRole === "operation";

    // Filter statuses for Operation
    const filteredStatuses = userRole === "operation"
        ? statuses.filter(s => ["Job Started", "Job Completed", "Job Cancelled"].includes(s.name))
        : statuses;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={userRole === 'operation' ? "Update Status" : "Edit Lead Details"} className="bg-white border-slate-200 text-slate-900 max-w-2xl">
            <div>
                <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto px-1">

                    {/* Status Selection (Always Visible, but restricted options for Operation) */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Label className="text-slate-700 font-bold uppercase text-[10px]">Lead Status</Label>
                        <select
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            value={statusId}
                            onChange={e => setStatusId(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            {filteredStatuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-slate-500 font-bold uppercase text-[10px]">Customer Name</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-slate-50 border-slate-200 h-9"
                                disabled={isDisabled}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-500 font-bold uppercase text-[10px]">Phone Number</Label>
                            <Input
                                value={lead.customer_phone}
                                disabled
                                className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed h-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-500 font-bold uppercase text-xs">Source</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50"
                                value={source}
                                onChange={e => setSource(e.target.value)}
                                disabled={isDisabled}
                            >
                                <option value="whatsapp">WhatsApp</option>
                                <option value="call">Call</option>
                                <option value="instagram">Instagram</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-bold uppercase text-xs">Services Interest</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50"
                            value={serviceInterest}
                            onChange={e => setServiceInterest(e.target.value)}
                            disabled={isDisabled}
                        >
                            <option value="Mobile Repair Service">Mobile Repair Service</option>
                            <option value="Home Service">Home Service</option>
                        </select>
                    </div>

                    {serviceInterest === "Home Service" && (
                        <div className="space-y-1">
                            <Label className="text-slate-500 font-bold uppercase text-[10px]">Select Service</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50"
                                value={serviceLevel}
                                onChange={e => setServiceLevel(e.target.value)}
                                disabled={isDisabled}
                            >
                                <option value="">Select a Home Service</option>
                                {availableServices.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label className="text-slate-500 font-bold uppercase text-[10px]">Address</Label>
                        <Textarea
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="bg-slate-50 border-slate-200 min-h-[40px] py-1"
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Mobile Repair Section */}
                    {serviceInterest === "Mobile Repair Service" && (
                        <div className="border rounded-lg p-3 border-slate-200 bg-slate-50/50 space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="font-bold text-slate-700 text-xs">Mobile Repair Details</Label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Brand</Label>
                                    <Input value={mobileBrand} onChange={e => setMobileBrand(e.target.value)} className="bg-white h-8 text-xs" disabled={isDisabled} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Model</Label>
                                    <Input value={mobileModel} onChange={e => setMobileModel(e.target.value)} className="bg-white h-8 text-xs" disabled={isDisabled} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-500">Issue</Label>
                                    <Input value={mobileIssue} onChange={e => setMobileIssue(e.target.value)} className="bg-white h-8 text-xs" disabled={isDisabled} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service Issues Manager */}
                    {!isDisabled && (
                        <div className="space-y-1">
                            <Label className="text-slate-500 font-bold uppercase text-[10px]">Service Issues & Pricing</Label>
                            <div className="border border-slate-200 rounded-lg p-3 bg-white">
                                <ServiceIssueManager
                                    initialIssues={serviceIssues}
                                    onIssuesChange={setServiceIssues}
                                />
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-600">Total Calculated Cost</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        ₹{serviceIssues.reduce((sum, i) => sum + i.price, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-slate-500 font-bold uppercase text-[10px]">Estimated Cost Override</Label>
                            <Input
                                type="number"
                                value={estimatedCost}
                                onChange={e => setEstimatedCost(e.target.value)}
                                placeholder="Override..."
                                className="bg-slate-50 border-slate-200 h-9"
                                disabled={isDisabled}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-500 font-bold uppercase text-[10px]">Internal Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="bg-slate-50 border-slate-200 min-h-[36px] py-1"
                                placeholder="Details..."
                                disabled={isDisabled}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                        <Button variant="outline" onClick={onClose} disabled={loading} className="bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 h-9">Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-slate-900 text-white hover:bg-black font-bold h-9">
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal >
    );
}
