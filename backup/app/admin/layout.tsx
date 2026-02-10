"use client"
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Auth } from "@/lib/auth";
import { AdminNavigation } from "@/components/layout/admin-navigation";

// ... (imports)

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!Auth.isAuthenticated() && pathname !== "/admin/login") {
            router.push("/admin/login");
        }
    }, [pathname]);

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminNavigation />
            <main className="flex-1 w-full pt-16 pb-20 lg:pb-0">
                {children}
            </main>
        </div>
    );
}
