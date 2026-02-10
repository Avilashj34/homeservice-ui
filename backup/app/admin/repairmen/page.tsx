"use client";

import { useState, useEffect } from "react";
import { RepairmenAPI, Repairman } from "@/lib/api/repairmen";
import { Button } from "@/components/ui/button";
import { Plus, User, Phone, Wrench, Briefcase, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AddRepairmanModal } from "@/components/repairmen/add-repairman-modal";
import { Auth } from "@/lib/auth";

export default function RepairmenPage() {
    const [repairmen, setRepairmen] = useState<Repairman[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        const user = Auth.getUser();
        if (user) {
            setUserRole(user.role.toLowerCase());
        }
    }, []);

    const fetchRepairmen = async () => {
        try {
            setLoading(true);
            const data = await RepairmenAPI.getAll();
            setRepairmen(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this repairman?")) return;
        try {
            await RepairmenAPI.delete(id);
            fetchRepairmen();
        } catch (error) {
            console.error("Failed to delete repairman", error);
            alert("Failed to delete repairman");
        }
    };

    useEffect(() => {
        fetchRepairmen();
    }, []);

    // Access Control (Frontend guard - API also protects)
    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    // Allow Admin and Sales to view
    if (userRole && !['admin', 'sales'].includes(userRole)) {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized. Access required.</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Repairmen Management</h1>
                    <p className="text-slate-500 mt-1">Manage field technicians and their assignments.</p>
                </div>
                {userRole === 'admin' && (
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-12 px-6 bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Repairman
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading repairmen...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {repairmen.map((repairman) => (
                        <Card key={repairman.id} className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl relative group">
                            {/* Delete Button (Hover) - Admin Only */}
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => handleDelete(repairman.id)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Repairman"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-200">
                                    {(repairman.name || "U")[0]}
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-slate-100 text-slate-700 border-slate-200">
                                    {repairman.service_type}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{repairman.name}</h3>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {repairman.phone_number}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    {repairman.employee_type}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {repairmen.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">No repairmen found</h3>
                            <p className="text-slate-500">Get started by adding your first repairman.</p>
                        </div>
                    )}
                </div>
            )}

            <AddRepairmanModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchRepairmen}
            />
        </div>
    );
}
