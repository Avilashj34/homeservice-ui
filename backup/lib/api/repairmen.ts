import { apiService } from "@/lib/api_service";

export interface Repairman {
    id: number;
    name: string;
    phone_number: string;
    service_type: string;
    employee_type: string;
    created_at?: string;
}

export interface RepairmanCreate {
    name: string;
    phone_number: string;
    service_type: string;
    employee_type: string;
}

export const RepairmenAPI = {
    getAll: async () => {
        return apiService.get<Repairman[]>("/repairmen/");
    },

    create: async (data: RepairmanCreate) => {
        return apiService.post<Repairman>("/repairmen/", data);
    },

    delete: async (id: number) => {
        return apiService.delete(`/repairmen/${id}`);
    }
};
