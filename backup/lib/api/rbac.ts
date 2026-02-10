import { apiService } from "@/lib/api_service";

export interface Role {
    id: number;
    name: string;
    description: string;
}

export interface Permission {
    role: string;
    feature: string;
}

export const RBACAPI = {
    getRoles: async (): Promise<Role[]> => {
        return apiService.get<Role[]>("/seed-rbac/roles");
    },

    getPermissions: async (role?: string): Promise<Permission[]> => {
        const params = role ? { role } : {};
        return apiService.get<Permission[]>("/seed-rbac/permissions", { params });
    }
};
