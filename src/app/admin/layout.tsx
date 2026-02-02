"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Auth } from "@/lib/auth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Skip check for login page
        if (pathname === "/admin/login") {
            setAuthorized(true);
            return;
        }

        const user = Auth.getUser();
        if (!user) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    // Prevent flashing of protected content
    if (!authorized && pathname !== "/admin/login") {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
    }

    return (
        <>
            {children}
        </>
    );
}
