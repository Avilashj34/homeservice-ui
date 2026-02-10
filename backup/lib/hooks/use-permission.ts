import { Auth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { RBACAPI } from "@/lib/api/rbac";

export function usePermission() {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [role, setRole] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            const user = Auth.getUser();
            if (user) {
                setRole(user.role.toLowerCase());
                try {
                    // Try to get permissions from API if possible, or fallback
                    // For now, we might rely on the implementation where permissions are fetched
                    // Ideally, we cache this or fetch on mount.
                    const perms = await RBACAPI.getPermissions(user.role);
                    setPermissions(perms.map(p => p.feature));
                } catch (error) {
                    console.error("Failed to load permissions", error);
                }
            }
            setLoading(false);
        };
        loadPermissions();
    }, []);

    const can = (action: string) => {
        if (!role) return false;
        if (role === 'admin') return true; // Admin has all permissions
        return permissions.includes(action);
    };

    return { can, role, loading };
}
