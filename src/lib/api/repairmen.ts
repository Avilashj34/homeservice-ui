import { apiService } from "@/lib/api_service";
import { Repairman, RepairmanCreate } from "@/types";

export const RepairmenAPI = {
    getAll: async (): Promise<Repairman[]> => {
        return apiService.get<Repairman[]>("/repairmen/");
    },

    create: async (data: RepairmanCreate): Promise<Repairman> => {
        return apiService.post<Repairman>("/repairmen/", data);
    },

    delete: async (id: number): Promise<void> => {
        return apiService.delete(`/repairmen/${id}`);
    }
};
