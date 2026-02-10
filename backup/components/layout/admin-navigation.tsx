"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, CheckSquare, ShieldCheck, MessageSquareMore, LogOut, Menu, X, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Auth } from "@/lib/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Leads",
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

export function AdminNavigation() {
    const pathname = usePathname();
    const user = Auth.getUser();
    const userRole = user?.role?.toLowerCase();

    return (
        <>
            {/* Desktop Top Navigation */}
            <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 px-6 items-center justify-between shadow-sm">
                <div className="flex items-center gap-8">
                    <Link href="/admin" className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        CanyFix Admin
                    </Link>

                    <nav className="flex items-center gap-1">
                        {menuItems.map((item) => {
                            // RBAC Filtering
                            if (item.title === "Team" && userRole !== "admin") return null;
                            if (item.title === "Repairmen" && !["admin", "sales"].includes(userRole || "")) return null;

                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-slate-900" : "text-gray-400")} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-gray-100 p-0 text-gray-600 font-bold border border-gray-200">
                                {user?.name?.[0] || "A"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white shadow-xl border border-slate-100" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@canyfix.com"}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => {
                                    Auth.logout();
                                    window.location.href = "/admin/login";
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-around h-16 px-2">
                    {menuItems.slice(0, 5).map((item) => { // Limit to 5 items for mobile spacing, or manage overflow
                        // RBAC Filtering (Access userRole from closure or use hook if moved inside component)
                        // Ideally we should move filtering logic out of map or use userRole from component scope if available.
                        // I will use `Auth.getUser()` here again or pass it down?
                        // `user` is available in scope (Line 49).
                        const userRole = user?.role?.toLowerCase();
                        if (item.title === "Team" && userRole !== "admin") return null;
                        if (item.title === "Repairmen" && !["admin", "sales"].includes(userRole || "")) return null;

                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full gap-1 pt-1 pb-1",
                                    isActive ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Icon className={cn("w-6 h-6", isActive && "fill-current text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium truncate w-full text-center px-1">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => {
                            Auth.logout();
                            window.location.href = "/admin/login";
                        }}
                        className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1 pb-1 text-gray-400 hover:text-red-600"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
