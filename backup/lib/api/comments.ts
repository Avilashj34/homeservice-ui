import { apiService } from "@/lib/api_service";

export interface Comment {
    id: number;
    booking_id: number;
    text: string;
    author_name: string;
    created_at: string;
}

export interface CommentCreate {
    text: string;
    author_name?: string;
    notify_phones?: string[];
}

export const CommentsAPI = {
    getAll: async (bookingId: number): Promise<Comment[]> => {
        return apiService.get<Comment[]>(`/comments/${bookingId}`);
    },

    create: async (bookingId: number, data: CommentCreate): Promise<Comment> => {
        return apiService.post<Comment>(`/comments/${bookingId}`, data);
    }
};
