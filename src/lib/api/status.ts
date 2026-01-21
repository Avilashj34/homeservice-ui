import { apiService } from "@/lib/api_service";
import { Status, StatusCreate } from "@/types";

export const StatusAPI = {
    getAll: async (): Promise<Status[]> => {
        return apiService.get<Status[]>("/status/");
    },

    create: async (data: StatusCreate): Promise<Status> => {
        return apiService.post<Status>("/status/", data);
    }
};
