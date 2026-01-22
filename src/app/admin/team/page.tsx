"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TeamAPI } from "@/lib/api/team";
import { TeamMember, TeamMemberCreate } from "@/types";
import { ArrowLeft, UserPlus, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState<TeamMemberCreate>({ name: "", email: "", role: "member" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await TeamAPI.getAll();
            setMembers(data);
        } catch (e) {
            console.error("Failed to fetch team members", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.email) {
            alert("Name and Email are required");
            return;
        }
        try {
            setIsSubmitting(true);
            await TeamAPI.create(newMember);
            setIsAddModalOpen(false);
            setNewMember({ name: "", email: "", role: "member" });
            fetchMembers();
        } catch (e) {
            console.error("Failed to add member", e);
            alert("Failed to add member. Email might be duplicate.");
        } finally {
            setIsSubmitting(false);
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
                    <h1 className="text-3xl font-bold">Team Management</h1>
                </div>
                <div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-black text-white hover:bg-gray-800 flex gap-2 items-center">
                        <UserPlus className="w-4 h-4" />
                        Add Member
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading team...</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No team members found.</td></tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{member.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-3.5 h-3.5" />
                                            {member.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            <Shield className="w-3 h-3" />
                                            {member.role || "Member"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">#{member.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Member Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Team Member">
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <Input
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            placeholder="e.g. Alice Smith"
                            className="h-11 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Email Address</label>
                        <Input
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            placeholder="alice@company.com"
                            type="email"
                            className="h-11 bg-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Role</label>
                        <select
                            className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-black outline-none"
                            value={newMember.role}
                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                    <Button
                        onClick={handleAddMember}
                        disabled={isSubmitting}
                        className="w-full h-11 bg-black text-white hover:bg-gray-900 mt-2"
                    >
                        {isSubmitting ? "Adding..." : "Add Member"}
                    </Button>
                </div>
            </Modal>
        </main>
    );
}
