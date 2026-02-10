import { apiService } from "@/lib/api_service";
import { Service, ServiceIssue } from "@/types";

export type { Service, ServiceIssue };

export const ServiceAPI = {
    getAll: async (): Promise<Service[]> => {
        return apiService.get<Service[]>("/services/");
    },

    getById: async (id: number): Promise<Service> => {
        return apiService.get<Service>(`/services/${id}`);
    },

    searchIssues: async (query: string): Promise<ServiceIssue[]> => {
        return apiService.get<ServiceIssue[]>("/services/issues/search", { params: { q: query } });
    }
};
