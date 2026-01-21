import { apiService } from "@/lib/api_service";
import { Booking, BookingCreate } from "@/types";

export const MultiBookingAPI = {
    getAll: async (params?: { search?: string; status_id?: number; date?: string; service_id?: number }): Promise<Booking[]> => {
        const query = new URLSearchParams();
        if (params?.search) query.append("search", params.search);
        if (params?.status_id) query.append("status_id", params.status_id.toString());
        if (params?.date) query.append("date", params.date);
        if (params?.service_id) query.append("service_id", params.service_id.toString());

        return apiService.get<Booking[]>(`/bookings/?${query.toString()}`);
    },

    getById: async (id: number): Promise<Booking> => {
        return apiService.get<Booking>(`/bookings/${id}`);
    },

    create: async (data: BookingCreate): Promise<Booking> => {
        return apiService.post<Booking>("/bookings/", data);
    },

    update: async (id: number, data: Partial<Booking>): Promise<Booking> => {
        return apiService.patch<Booking>(`/bookings/${id}`, data);
    },

    upload: async (file: File, booking_id?: number): Promise<{ id: number, url: string, type: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        if (booking_id) formData.append("booking_id", booking_id.toString());

        return apiService.post<{ id: number, url: string, type: string }>(`/bookings/upload?booking_id=${booking_id || ''}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    track: async (tracking_id: string): Promise<Booking> => {
        return apiService.get<Booking>(`/bookings/track/${tracking_id}`);
    }
};
