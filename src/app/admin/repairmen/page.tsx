"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { RepairmenAPI } from "@/lib/api/repairmen";
import { Repairman, RepairmanCreate } from "@/types";
import { ArrowLeft, UserPlus, Phone, Briefcase, Trash, User } from "lucide-react";
import Link from "next/link";

export default function RepairmenPage() {
    const [repairmen, setRepairmen] = useState<Repairman[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRepairman, setNewRepairman] = useState<RepairmanCreate>({
        name: "",
        phone_number: "",
        service_type: "",
        employee_type: "fulltime"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRepairmen();
    }, []);

    const fetchRepairmen = async () => {
        try {
            setLoading(true);
            const data = await RepairmenAPI.getAll();
            setRepairmen(data);
        } catch (e) {
            console.error("Failed to fetch repairmen", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRepairman = async () => {
        if (!newRepairman.name || !newRepairman.phone_number || !newRepairman.service_type) {
            alert("Please fill all fields");
            return;
        }
        try {
            setIsSubmitting(true);
            await RepairmenAPI.create(newRepairman);
            setIsAddModalOpen(false);
            setNewRepairman({ name: "", phone_number: "", service_type: "", employee_type: "fulltime" });
            fetchRepairmen();
        } catch (e) {
            console.error("Failed to add repairman", e);
            alert("Failed to add repairman. Phone number might be duplicate.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this repairman?")) return;
        try {
            await RepairmenAPI.delete(id);
            fetchRepairmen();
        } catch (e) {
            console.error("Failed to delete", e);
            alert("Failed to delete repairman");
        }
    };

    return (
        <main className="flex min-h-screen flex-col p-4 md:p-8 bg-white text-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="outline" className="h-10 w-10 p-0 rounded-full border-gray-200 hover:bg-gray-100">
                            <ArrowLeft className="w-5 h-5 text-black" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Repairmen Management</h1>
                </div>
                <div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-black text-white hover:bg-gray-800 flex gap-2 items-center">
                        <UserPlus className="w-4 h-4" />
                        Add Repairman
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500 italic">Loading repairmen...</div>
                ) : repairmen.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        No repairmen found. Add one to get started.
                    </div>
                ) : (
                    repairmen.map((r) => (
                        <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 relative hover:shadow-lg transition-all group">
                            <button
                                onClick={() => handleDelete(r.id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                            >
                                <Trash className="w-4 h-4" />
                            </button>

                            <div className="flex items-start gap-4 mb-5">
                                <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                                    {r.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="pr-6">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 truncate">{r.name}</h3>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        <span className="font-medium">{r.service_type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700 text-sm bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono tracking-wide">{r.phone_number}</span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${r.employee_type === 'fulltime' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            r.employee_type === 'parttime' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-violet-50 text-violet-700 border-violet-100'
                                        }`}>
                                        <User className="w-3 h-3" />
                                        {r.employee_type}
                                    </span>
                                    <span className="text-[10px] text-gray-300 font-mono">#{r.id}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Repairman Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Repairman">
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <Input
                            value={newRepairman.name}
                            onChange={(e) => setNewRepairman({ ...newRepairman, name: e.target.value })}
                            placeholder="e.g. John Doe"
                            className="h-11 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Phone Number</label>
                        <Input
                            value={newRepairman.phone_number}
                            onChange={(e) => setNewRepairman({ ...newRepairman, phone_number: e.target.value })}
                            placeholder="e.g. 9876543210"
                            className="h-11 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Service Type</label>
                        <Input
                            value={newRepairman.service_type}
                            onChange={(e) => setNewRepairman({ ...newRepairman, service_type: e.target.value })}
                            placeholder="e.g. AC Repair"
                            className="h-11 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Employee Type</label>
                        <div className="flex gap-4">
                            {['fulltime', 'parttime', 'freelancer'].map((type) => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="employee_type"
                                        value={type}
                                        checked={newRepairman.employee_type === type}
                                        onChange={(e) => setNewRepairman({ ...newRepairman, employee_type: e.target.value })}
                                        className="text-black focus:ring-black"
                                    />
                                    <span className="capitalize text-sm">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleAddRepairman}
                        disabled={isSubmitting}
                        className="w-full h-11 bg-black text-white hover:bg-gray-900 mt-2"
                    >
                        {isSubmitting ? "Adding..." : "Add Repairman"}
                    </Button>
                </div>
            </Modal>
        </main>
    );
}
