import { apiService } from "@/lib/api_service";
import { BookingStatus } from "@/types"; // Using shared type if available, else define local

// Define interface if not present in global types
export interface Status {
    id: number;
    name: string;
    color?: string; // If API returns color
}

export const StatusAPI = {
    getAll: async () => {
        return apiService.get<Status[]>("/status");
    },

    create: async (data: { name: string }) => {
        return apiService.post<Status>("/status", data);
    }
};
