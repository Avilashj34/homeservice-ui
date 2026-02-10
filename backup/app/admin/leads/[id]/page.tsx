"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LeadsAPI, Lead, ActivityLog, LeadComment } from "@/lib/api/leads";
import { RepairmenAPI, Repairman } from "@/lib/api/repairmen";
import { TeamAPI } from "@/lib/api/team";
import { TeamMember } from "@/types";

import { Button } from "@/components/ui/button";
import { Phone, User, Send, MapPin, Calendar, ArrowLeft, PenBox, Tag, Sparkles, Smartphone, X, Plus, Wrench, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MentionInput } from "@/components/ui/mention-input";
import { CallLogModal } from "@/components/leads/call-log-modal";
import { CallConfirmationModal } from "@/components/leads/call-confirmation-modal";
import { EditLeadModal } from "@/components/leads/edit-lead-modal";
import { ServiceQuoteModal } from "@/components/leads/service-quote-modal";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { Auth } from "@/lib/auth";
import { usePermission } from "@/lib/hooks/use-permission";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LeadDetailPage() {
    const params = useParams();
    const leadId = parseInt(params.id as string);

    const [lead, setLead] = useState<Lead | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [comments, setComments] = useState<LeadComment[]>([]);
    const [comment, setComment] = useState("");
    const [mentionedIds, setMentionedIds] = useState<number[]>([]);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isCallConfirmationOpen, setIsCallConfirmationOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [script, setScript] = useState<string | null>(null);
    const [generatingScript, setGeneratingScript] = useState(false);

    // Repairman State
    const [repairmen, setRepairmen] = useState<Repairman[]>([]);
    const [assigningRepairman, setAssigningRepairman] = useState(false);

    // Team Members
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [assigningAgent, setAssigningAgent] = useState(false);



    // RBAC
    const { role: userRole, can } = usePermission();

    const handleGenerateScript = async () => {
        if (!lead) return;
        setGeneratingScript(true);
        try {
            const response = await LeadsAPI.generateScript(lead.id);
            setScript(response.script);
        } catch (error) {
            console.error("Failed to generate script", error);
        } finally {
            setGeneratingScript(false);
        }
    };

    const fetchData = async () => {
        try {
            const [leadData, logsData, repairmenData, teamData] = await Promise.all([
                LeadsAPI.getById(leadId),
                LeadsAPI.getLogs(leadId),
                RepairmenAPI.getAll(),
                TeamAPI.getAll()
            ]);
            setLead(leadData);
            setActivityLogs(logsData.logs);
            setComments(logsData.comments);
            setRepairmen(repairmenData);
            setTeamMembers(teamData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssuesUpdate = async (issues: any[]) => {
        if (!lead) return;
        const newDetails = { ...lead.details, selected_issues: issues };
        // Optimistic update
        setLead({ ...lead, details: newDetails });

        try {
            await LeadsAPI.update(lead.id, { details: newDetails });
        } catch (error) {
            console.error("Failed to update issues", error);
            fetchData(); // Revert on error
        }
    };

    const handleSaveQuote = async (issues: any[], estimatedCost: number) => {
        if (!lead) return;

        // Transform ServiceIssue[] to LeadServiceIssue format for API and State
        const transformedIssues = issues.map(i => ({
            service_issue_id: i.is_custom ? null : i.id,
            issue_name: i.name,
            price: i.price || 0
        }));

        // Optimistic update
        const newDetails = { ...lead.details, selected_issues: transformedIssues };
        setLead({ ...lead, details: newDetails, service_issues: transformedIssues as any, estimated_cost: estimatedCost });

        try {
            await LeadsAPI.update(lead.id, {
                details: newDetails,
                estimated_cost: estimatedCost,
                service_issues: transformedIssues as any
            });
        } catch (error) {
            console.error("Failed to update quote", error);
            fetchData(); // Revert on error
        }
    };

    const handleAssignRepairman = async (repairmanId: string) => {
        if (!lead) return;
        setAssigningRepairman(true);
        try {
            const id = parseInt(repairmanId);
            // Optimistic Update
            const selected = repairmen.find(r => r.id === id);
            setLead({ ...lead, repairman_id: id, repairman: selected as any });

            await LeadsAPI.update(lead.id, { repairman_id: id });
            fetchData(); // Refresh to get updated logs/notifications confirm
        } catch (error) {
            console.error("Failed to assign repairman", error);
            fetchData(); // Revert
        } finally {
            setAssigningRepairman(false);
        }
    };

    const handleAssignAgent = async (agentId: string) => {
        if (!lead) return;
        setAssigningAgent(true);
        try {
            const id = parseInt(agentId);
            // Optimistic Update
            setLead({ ...lead, assigned_to_id: id, assigned_to: teamMembers.find(m => m.id === id)?.name });

            await LeadsAPI.update(lead.id, { assigned_to_id: id });
            fetchData();
        } catch (error) {
            console.error("Failed to assign agent", error);
            fetchData(); // Revert
        } finally {
            setAssigningAgent(false);
        }
    };



    useEffect(() => {
        if (leadId) fetchData();
    }, [leadId]);

    const handleCall = () => {
        if (lead) {
            // Trigger API immediately as requested
            LeadsAPI.initiateCall(lead.id).catch(console.error);
            setIsCallConfirmationOpen(true);
        }
    };

    const handleCopyRepairLink = () => {
        if (!lead) return;
        const link = `${window.location.origin}/repair/leads/${lead.id}`;
        navigator.clipboard.writeText(link);
        alert("Repairman Link Copied!");
    };

    const handleCallLogSubmit = async (data: any) => {
        try {
            await LeadsAPI.logCall(leadId, data);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await LeadsAPI.addComment(leadId, comment, mentionedIds);
            setComment("");
            setMentionedIds([]);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateLead = async (id: number, data: Partial<Lead>) => {
        try {
            await LeadsAPI.update(id, data);
            fetchData();
        } catch (error) {
            console.error("Failed to update lead", error);
        }
    };

    if (loading || !lead) return <div className="p-8 text-center text-slate-500">Loading details...</div>;

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'interested': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'follow up': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] p-3 md:p-6 bg-slate-50 lg:overflow-hidden">
                {/* Left Col: Customer Profile & Service Details */}
                <div className="lg:col-span-2 space-y-6 h-auto lg:h-full lg:overflow-y-auto lg:pr-2">

                    {/* Unified Customer Profile Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Header Section */}
                        <div className="p-4 md:p-6 border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-3 md:mb-4">
                                <Link href="/admin/leads" className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Lead #{lead.id}</span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{lead.customer_name}</h1>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3">
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border", getStatusColor(lead.status || "New"))}>
                                            {lead.status || "New"}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                            <Phone className="w-3.5 h-3.5" />
                                            {lead.customer_phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 h-10 md:h-9"
                                        onClick={handleGenerateScript}
                                        disabled={generatingScript}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {generatingScript ? "..." : "Generate Script"}
                                    </Button>
                                    {can("edit_leads") && (
                                        <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="h-10 md:h-12 px-4 md:px-6 text-sm md:text-base font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm rounded-xl gap-2">
                                            <PenBox className="w-4 h-4 md:w-5 md:h-5" />
                                            Edit
                                        </Button>
                                    )}
                                    <Button onClick={handleCall} className="h-10 md:h-12 px-4 md:px-6 text-sm md:text-base font-bold bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200 flex items-center gap-2 rounded-xl">
                                        <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                        Call
                                    </Button>
                                    <Button onClick={handleCopyRepairLink} variant="outline" className="h-10 md:h-12 w-10 md:w-12 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50" title="Copy Repairman Link">
                                        <Copy className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details Grid */}
                        <div className="p-4 md:p-6 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Source</label>
                                <div className="font-semibold text-slate-900 capitalize">{lead.source}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Services Interest</label>
                                <div className="flex flex-wrap gap-2">
                                    {lead.services.map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-sm font-medium">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Specific Service Level for Home Services */}
                            {!lead.is_mobile_repair && lead.service_level && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Specific Service</label>
                                    <div className="font-semibold text-slate-900">{lead.service_level}</div>
                                </div>
                            )}
                            {lead.address && (
                                <div className="col-span-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                                    <div className="font-medium text-slate-900 flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                        {lead.address}
                                    </div>
                                </div>
                            )}
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {new Date(lead.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Next Follow-up</label>
                            <div className="font-medium text-slate-900">
                                {can("edit_leads") || can("update_lead_status") ? (
                                    <input
                                        type="datetime-local"
                                        className="text-sm bg-white border border-slate-300 rounded px-2 py-1 w-full max-w-[200px]"
                                        value={lead?.next_follow_up ? new Date(lead.next_follow_up).toISOString().slice(0, 16) : ""}
                                        onChange={async (e) => {
                                            if (!lead) return;
                                            const newVal = e.target.value ? new Date(e.target.value).toISOString() : null;
                                            setLead({ ...lead, next_follow_up: newVal }); // Optimistic
                                            try {
                                                await LeadsAPI.update(lead.id, { next_follow_up: newVal });
                                                fetchData();
                                            } catch (err) {
                                                console.error(err);
                                                fetchData(); // Revert
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-slate-600">
                                        {lead?.next_follow_up ? new Date(lead.next_follow_up).toLocaleString() : "Not scheduled"}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Agent</label>
                            <div className="font-medium text-slate-900">
                                {can("edit_leads") || can("update_lead_status") ? (
                                    <Select onValueChange={handleAssignAgent} value={lead.assigned_to_id?.toString() || "0"} disabled={assigningAgent}>
                                        <SelectTrigger className="w-full h-9 text-sm bg-white border border-slate-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-slate-300 rounded-md text-black">
                                            <SelectItem value="0" className="text-slate-500">Unassigned</SelectItem>
                                            {teamMembers.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                                                            {m.name[0]}
                                                        </div>
                                                        <span className="font-medium text-black">{m.name}</span>
                                                        <span className="text-xs text-slate-400">({m.role})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    lead.assigned_to ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                                                {lead.assigned_to[0]}
                                            </div>
                                            {lead.assigned_to}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 italic">Unassigned</span>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Assigned Technician / Repairman */}
                        {(userRole === 'admin' || userRole === 'sales') && (
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Technician</label>
                                <div className="font-medium text-slate-900">
                                    <Select onValueChange={handleAssignRepairman} value={lead.repairman_id?.toString()} disabled={assigningRepairman}>
                                        <SelectTrigger
                                            className="w-full h-9 text-sm bg-white border border-slate-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                                            style={{ backgroundColor: 'white', color: 'black' }}
                                        >
                                            <SelectValue placeholder="Select Technician" className="text-black" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-slate-300 rounded-md text-black">
                                            <SelectItem value="0" disabled={true} className="text-slate-400">Select Technician</SelectItem>
                                            {repairmen.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>
                                                    <div className="flex items-center gap-2 text-black">
                                                        <span className="font-medium">{r.name}</span>
                                                        <span className="text-xs text-slate-400">({r.service_type})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {assigningRepairman && <span className="text-xs text-slate-500 animate-pulse mt-1 block">Updating...</span>}
                                </div>
                            </div>

                        )}
                    </div>
                </div>

                <EditLeadModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    lead={lead}
                    onSave={handleUpdateLead}
                    userRole={userRole}
                />

                {/* Script Display */}
                {script && (
                    <Card className="p-4 bg-slate-50 border-slate-200 shadow-sm relative group">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Suggested Script
                            </h3>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setScript(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap font-medium">
                            {script}
                        </div>
                    </Card>
                )}

                {/* Mobile Repair Specifics */}
                {lead.is_mobile_repair && (
                    <Card className="p-4 border-slate-200 shadow-sm bg-white">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-slate-500" />
                            Device Details
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">Brand</span>
                                <span className="font-medium text-slate-900">{lead.mobile_brand || "-"}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">Model</span>
                                <span className="font-medium text-slate-900">{lead.mobile_model || "-"}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">Issue</span>
                                <span className="font-medium text-slate-900">{lead.mobile_issue || "-"}</span>
                            </div>
                        </div>
                    </Card>
                )}

                <Card className="p-0 border-slate-200 shadow-sm overflow-hidden bg-white">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-500" />
                            Service Issues & Quote
                        </h3>
                    </div>
                    <div className="p-4 md:p-6">
                        {(!lead.service_issues || lead.service_issues.length === 0) ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Tag className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 mb-4">No service issues added yet</p>
                                <Button
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Home Service
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lead.service_issues.map((issue) => (
                                    <div key={issue.id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                                        <div>
                                            <div className="font-semibold text-sm text-slate-900">{issue.issue_name}</div>
                                        </div>
                                        <div className="font-bold text-slate-900">₹{issue.price}</div>
                                    </div>
                                ))}

                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Total Estimated Cost</span>
                                    <span className="text-xl font-bold text-slate-900">
                                        ₹{lead.estimated_cost || lead.service_issues?.reduce((sum, i) => sum + i.price, 0) || 0}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        onClick={() => setIsQuoteModalOpen(true)}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        Modify Services
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Right Col: Discussion & Activity */}
            <div className="lg:col-span-1 space-y-6 flex flex-col h-auto lg:h-full lg:overflow-hidden">

                {/* Unified Discussion Card (Note + Comments) */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[500px] lg:h-auto lg:max-h-[60%]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Send className="w-4 h-4 text-slate-500" />
                            Discussion
                        </h3>
                        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{comments.length} comments</span>
                    </div>

                    {/* Input Section */}
                    <div className="p-4 bg-slate-50/30 border-b border-slate-100">
                        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                            <MentionInput
                                placeholder="Type a note... (@ to mention team)"
                                value={comment}
                                onChange={setComment}
                                onMentionsChange={(ids) => setMentionedIds(prev => [...prev, ...ids])}
                                className="bg-white border-slate-200 focus:border-slate-900 min-h-[60px] text-slate-900 placeholder:text-slate-400 shadow-sm"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!comment.trim()}
                                    className="bg-slate-900 text-white hover:bg-black font-bold shadow-md shadow-slate-200 h-8 text-xs"
                                >
                                    Post
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-0 bg-white">
                        {comments.map((item) => (
                            <div key={item.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-800 text-xs">{item.author}</span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                    {item.text}
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-xs">No comments yet.</div>
                        )}
                    </div>
                </div>

                {/* Activity Log / Timeline */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-[400px] lg:h-auto lg:max-h-[50%]">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <span className="font-bold text-slate-700 text-sm">Lead Journey</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{activityLogs.length} events</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-white">
                        <LeadTimeline logs={activityLogs} />
                    </div>
                </div>
            </div>

            <ServiceQuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                lead={lead}
                onSave={handleSaveQuote}
            />

            <CallConfirmationModal
                isOpen={isCallConfirmationOpen}
                onClose={() => setIsCallConfirmationOpen(false)}
                customerName={lead.customer_name}
                customerPhone={lead.customer_phone}
                leadId={lead.id}
                onConfirmCall={() => {
                    setIsCallConfirmationOpen(false);
                    // Open log modal after a short delay to allow phone app to open
                    setTimeout(() => setIsCallModalOpen(true), 500);
                }}
            />

            <CallLogModal
                isOpen={isCallModalOpen}
                onClose={() => setIsCallModalOpen(false)}
                onSubmit={handleCallLogSubmit}
                customerName={lead.customer_name}
                customerPhone={lead.customer_phone}
                leadId={lead.id}
            />
        </div >
    );
}
