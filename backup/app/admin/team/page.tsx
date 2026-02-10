"use client";

import { useState, useEffect } from "react";
import { TeamAPI } from "@/lib/api/team";
import { TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, User, Mail, Phone, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AddMemberModal } from "@/components/leads/add-member-modal"; // Wait, I put it in team/ but import path might be needed
// Actually I should correct the path in previous step or here. I put it in components/team/add-member-modal.tsx
// But I might have made a mistake in previous step's path. Let me check.
// I used `TargetFile: .../components/team/add-member-modal.tsx`.
// So import should be from "@/components/team/add-member-modal".

import { AddMemberModal as AddModal } from "@/components/team/add-member-modal";

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const data = await TeamAPI.getAll();
            setTeam(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h1>
                    <p className="text-slate-500 mt-1">Manage your team members and their roles.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-12 px-6 bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 rounded-xl font-bold flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Member
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading team...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map((member) => (
                        <Card key={member.id} className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-200">
                                    {(member.name || "U")[0]}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${member.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                    {member.role || 'Member'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {member.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {member.number ? member.number : <span className="text-slate-400 italic">No phone</span>}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {team.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">No team members yet</h3>
                            <p className="text-slate-500">Get started by adding your first team member.</p>
                        </div>
                    )}
                </div>
            )}

            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTeam}
            />
        </div>
    );
}
