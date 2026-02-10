"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, CheckSquare, ShieldCheck, MessageSquareMore, Menu, X, LogOut, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Auth } from "@/lib/auth";
import { usePermission } from "@/lib/hooks/use-permission";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Manage Leads",
        href: "/admin/leads",
        icon: Users
    },
    {
        title: "Bookings",
        href: "/admin/bookings",
        icon: Calendar
    },
    {
        title: "Repairmen",
        href: "/admin/repairmen",
        icon: Wrench
    },
    {
        title: "Team",
        href: "/admin/team",
        icon: ShieldCheck
    },
    {
        title: "Ask Agent",
        href: "/askagent",
        icon: MessageSquareMore
    }
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const user = Auth.getUser();
        if (user) {
            setUserRole(user.role.toLowerCase());
        }
    }, []);

    const { role, loading } = usePermission();

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Filter items based on role
    // specific permission check can be done via 'role' from usePermission, 
    // but for sidebar visibility, 'userRole' from Auth is faster and sufficient for UI.
    const effectiveRole = role || userRole;

    const filteredItems = mounted ? menuItems.filter(item => {
        if (!effectiveRole) return false;

        if (item.title === "Team") return effectiveRole === "admin";
        if (item.title === "Repairmen") return effectiveRole === "admin" || effectiveRole === "sales";
        return true;
    }) : [];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        CanyFix Admin
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-slate-900" : "text-gray-400")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
                        onClick={() => {
                            Auth.logout();
                            window.location.href = "/admin/login";
                        }}
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Button>
                </div>
            </aside>
        </>
    );
}
