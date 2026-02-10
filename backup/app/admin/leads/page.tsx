"use client";

import { useEffect, useState } from "react";
import { LeadsAPI, Lead } from "@/lib/api/leads";
import { StatusAPI } from "@/lib/api/status";
import { TeamAPI } from "@/lib/api/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, Phone, MessageCircle, ArrowRight, Calendar, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

import { Auth } from "@/lib/auth";
import { Modal } from "@/components/ui/modal";

export default function LeadsPage() {
    const [statusId, setStatusId] = useState<string>("all");
    const [assignedTo, setAssignedTo] = useState<string>("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [leads, setLeads] = useState<Lead[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Metadata
    const [statuses, setStatuses] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string>("");

    // Modals
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isViewStatusModalOpen, setIsViewStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");

    useEffect(() => {
        const user = Auth.getUser();
        if (user) setUserRole(user.role.toLowerCase());
    }, []);

    const handleCreateStatus = async () => {
        try {
            await StatusAPI.create({ name: newStatus });
            setNewStatus("");
            setIsStatusModalOpen(false);
            // Refresh statuses
            const statusData = await StatusAPI.getAll();
            setStatuses(statusData);
        } catch (e) {
            alert("Failed to create status");
        }
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [statusData, teamData] = await Promise.all([
                    StatusAPI.getAll(),
                    TeamAPI.getAll()
                ]);
                setStatuses(statusData);
                setTeam(teamData);
            } catch (e) {
                console.error("Failed to load metadata", e);
            }
        };
        fetchMetadata();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await LeadsAPI.getAll({
                search,
                status_id: statusId === "all" ? undefined : statusId,
                assigned_to: assignedTo === "all" ? undefined : assignedTo,
                start_date: startDate || undefined,
                end_date: endDate || undefined
            });
            setLeads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusId, assignedTo, startDate, endDate]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'interested': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'follow up': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'closed': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lead Management</h1>
                        <p className="text-slate-500 mt-1">Track and manage service enquiries.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => setIsViewStatusModalOpen(true)} variant="outline" className="h-10 bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all">
                            View Statuses
                        </Button>
                        <Button onClick={() => setIsStatusModalOpen(true)} variant="outline" className="h-10 bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all">
                            + New Status
                        </Button>
                        <Link href="/admin">
                            <Button variant="outline" className="h-10 bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all">Back to Dashboard</Button>
                        </Link>
                        {userRole !== "operation" && (
                            <Link href="/admin/leads/new">
                                <Button className="h-10 bg-blue-900 text-white hover:bg-blue-800 shadow-md transition-all">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Lead
                                </Button>
                            </Link>
                        )}

                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    {/* Top Row: Search */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search leads by name or phone..."
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-slate-900 placeholder:text-slate-400"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Bottom Row: Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-500"
                                value={statusId}
                                onChange={(e) => setStatusId(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                {statuses.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Team Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Assigned To</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-500"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                            >
                                <option value="all">All Team Members</option>
                                {team.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Start */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                            <input
                                type="date"
                                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        {/* Date End */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                            <input
                                type="date"
                                className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-slate-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Lead Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-slate-500">Loading leads...</div>
                    ) : leads.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
                            <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-slate-100">
                                <Search className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-slate-900">No leads found</p>
                            <p className="text-sm">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        leads.map(lead => (
                            <div
                                key={lead.id}
                                className={cn(
                                    "group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden",
                                    // SLA Logic: If status is 'New' and (created_at > 5mins ago AND last_called_at is null), highlight red
                                    (lead.status === "New" && !lead.last_called_at && (new Date().getTime() - new Date(lead.created_at).getTime() > 5 * 60 * 1000))
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200"
                                )}
                            >
                                {/* Card Header */}
                                <div className={cn(
                                    "p-5 border-b flex justify-between items-start",
                                    (lead.status === "New" && !lead.last_called_at && (new Date().getTime() - new Date(lead.created_at).getTime() > 5 * 60 * 1000))
                                        ? "bg-red-50 border-red-100"
                                        : "bg-slate-50/50 border-slate-100"
                                )}>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                                            {lead.customer_name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                            <Phone className="w-3.5 h-3.5" />
                                            {lead.customer_phone}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                        getStatusColor(lead.status || "New")
                                    )}>
                                        {lead.status || "New"}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {lead.services.map(s => (
                                            <span key={s} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                                {s}
                                            </span>
                                        ))}
                                        {lead.service_level && !lead.is_mobile_repair && (
                                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                                {lead.service_level}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {lead.assigned_to && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span>Assigned to <span className="font-medium text-slate-900">{lead.assigned_to}</span></span>
                                                {(lead.reassignment_count && lead.reassignment_count > 0) && (
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 font-medium" title="Reassignment Count">
                                                        {lead.reassignment_count}x
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="capitalize">{lead.source} Lead</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <a
                                            href={`tel:${lead.customer_phone}`}
                                            onClick={() => LeadsAPI.initiateCall(lead.id).catch(console.error)}
                                            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                            title="Call Customer"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                        <a
                                            href={`https://wa.me/${lead.customer_phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-9 w-9 rounded-full border border-green-200 bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </a>
                                    </div>
                                    <Link href={`/admin/leads/${lead.id}`}>
                                        <Button size="sm" className="bg-blue-900 text-white hover:bg-blue-800 gap-2 shadow-sm rounded-lg px-4">
                                            View Details
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Status Modal */}
            <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Create New Status">
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Status Name</label>
                        <Input value={newStatus} onChange={(e) => setNewStatus(e.target.value)} placeholder="e.g. In Progress" className="h-11" />
                    </div>
                    <Button onClick={handleCreateStatus} className="w-full h-11 bg-black text-white hover:bg-gray-900">Create Status</Button>
                </div>
            </Modal>

            {/* View Statuses Modal */}
            <Modal isOpen={isViewStatusModalOpen} onClose={() => setIsViewStatusModalOpen(false)} title="All Statuses">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statuses.map(s => (
                                <tr key={s.id} className="border-b border-gray-50">
                                    <td className="px-4 py-3">{s.id}</td>
                                    <td className="px-4 py-3 font-medium text-black">{s.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.description || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {statuses.length === 0 && <p className="text-center text-gray-500 py-4">No statuses found.</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button onClick={() => { setIsViewStatusModalOpen(false); setIsStatusModalOpen(true); }} className="w-full h-11 border border-black bg-white text-black hover:bg-gray-50">
                        + Add New Status
                    </Button>
                </div>
            </Modal>
        </main>
    );
}
