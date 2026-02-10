"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RBACAPI, Permission } from "@/lib/api/rbac";
import { User, Mail, Shield, Phone } from "lucide-react";

// Mock User hook - In real app use useAuth()
// Assuming user info is stored in localStorage or similar for now
const useUser = () => {
    const [user, setUser] = useState<{ name: string; email: string; role: string; id: number } | null>(null);

    useEffect(() => {
        // Hydrate from localStorage if available, or fetch from /auth/me
        // For this demo, we'll try to read from localStorage 'user' key which might be set during login
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    return user;
};

export default function ProfilePage() {
    const user = useUser();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role) {
            loadPermissions(user.role);
        }
    }, [user]);

    const loadPermissions = async (role: string) => {
        setLoading(true);
        try {
            const data = await RBACAPI.getPermissions(role);
            setPermissions(data);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
                <p className="text-slate-500 mt-1">Manage your account and view your permissions.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Details Card */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border border-slate-200">
                                    <User className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Full Name</p>
                                    <p className="font-medium text-slate-900">{user.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border border-slate-200">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                                    <p className="font-medium text-slate-900">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border border-slate-200">
                                    <Shield className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Assigned Role</p>
                                    <Badge variant="outline" className="mt-1 border-blue-200 bg-blue-50 text-blue-700">
                                        {user.role.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Card */}
                <Card className="border-slate-200 shadow-sm md:row-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            My Permissions
                        </CardTitle>
                        <CardDescription>
                            Features accessible to the <strong>{user.role}</strong> role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-slate-500">Loading permissions...</p>
                        ) : permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {permissions.map((perm, idx) => (
                                    <Badge
                                        key={idx}
                                        className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
                                        variant="outline"
                                    >
                                        {perm.feature.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No specific permissions assigned.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
