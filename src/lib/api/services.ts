import { apiService } from "@/lib/api_service";
import { Service } from "@/types";

export const ServiceAPI = {
    getAll: async (): Promise<Service[]> => {
        return apiService.get<Service[]>("/services/");
    },

    getById: async (id: number): Promise<Service> => {
        return apiService.get<Service>(`/services/${id}`);
    }
};
