import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { TeamMemberCreate } from "@/types";
import { TeamAPI } from "@/lib/api/team";
import { RBACAPI, Role, Permission } from "@/lib/api/rbac";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [formData, setFormData] = useState<TeamMemberCreate>({
        name: "",
        email: "",
        role: "member",
        number: undefined
    });

    useEffect(() => {
        if (isOpen) {
            loadRoles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.role) {
            loadPermissions(formData.role);
        }
    }, [formData.role]);

    const loadRoles = async () => {
        try {
            const data = await RBACAPI.getRoles();
            setRoles(data);
            // Default to lead/member if available?
        } catch (error) {
            console.error("Failed to load roles", error);
        }
    };

    const loadPermissions = async (role: string) => {
        try {
            const data = await RBACAPI.getPermissions(role);
            setPermissions(data);
        } catch (error) {
            console.error("Failed to load permissions", error);
            setPermissions([]);
        }
    };

    const handleChange = (field: keyof TeamMemberCreate, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Phone Number must be 10 digits
        if (formData.number) {
            const phoneDigits = formData.number.toString().replace(/\D/g, "");
            if (phoneDigits.length !== 10) {
                // Ideally use a UI toast/error state, but since this modal uses alert/console in others or just fails silently based on current code, 
                // I'll assume we used console or basic alert in other places. 
                // Wait, the previous modal used error state. This one doesn't seem to have an explicit error state variable visible in the snippet I saw earlier (lines 17-79), 
                // but checking lines 1-161 of `add-member-modal.tsx`... 
                // It has `setLoading` but no `error` state. I should add `alert` for now or add error state. 
                // Given the instructions "alert/error", I will use `alert` to be safe and consistent with the quick fix unless I add state.
                alert("Phone number must be exactly 10 digits.");
                return;
            }
        }

        setLoading(true);
        try {
            await TeamAPI.create(formData);
            onSuccess();
            onClose();
            setFormData({ name: "", email: "", role: "member", number: undefined });
            setPermissions([]);
        } catch (error) {
            console.error("Failed to add member", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member" className="bg-white border-slate-200 text-slate-900 shadow-xl max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Full Name</Label>
                    <Input
                        required
                        value={formData.name}
                        onChange={e => handleChange("name", e.target.value)}
                        placeholder="e.g. John Doe"
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Email Address</Label>
                    <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Phone Number</Label>
                    <Input
                        required
                        type="tel"
                        value={formData.number || ""}
                        onChange={e => handleChange("number", e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g. 9876543210"
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Role</Label>
                    <select
                        className="flex h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
                        value={formData.role}
                        onChange={e => handleChange("role", e.target.value)}
                    >
                        {roles.length > 0 ? (
                            roles.map(role => (
                                <option key={role.id} value={role.name} className="bg-white text-slate-900">
                                    {role.name.toUpperCase()}
                                </option>
                            ))
                        ) : (
                            <option value="member" className="bg-white text-slate-900">Loading Roles...</option>
                        )}
                    </select>
                </div>

                {/* Permission Preview */}
                {permissions.length > 0 && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-100">
                        <Label className="text-slate-400 font-bold uppercase text-[10px]">Included Permissions</Label>
                        <div className="flex flex-wrap gap-1.5">
                            {permissions.map((perm, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-slate-200 text-slate-700 text-[10px] hover:bg-slate-300">
                                    {perm.feature.replace(/_/g, " ")}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900">Cancel</Button>
                    <Button type="submit" disabled={loading} className="bg-slate-900 text-white hover:bg-black font-bold shadow-md shadow-slate-200">
                        {loading ? "Adding..." : "Add Member"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
