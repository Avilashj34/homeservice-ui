import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

export interface Offer {
    id: number;
    title: string;
    description: string;
    code: string | null;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    is_new_user_exclusive: boolean;
    discount_percentage: number;
}

export const OfferAPI = {
    getAll: async (): Promise<Offer[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/offers/`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch offers", error);
            // Fallback mock data if backend not running
            return [
                {
                    id: 1,
                    title: "Online Booking Bonanza",
                    description: "FLAT 50% OFF on all service charges when you book online!",
                    code: "BOOK50",
                    bg_color: "bg-gradient-to-r from-red-600 to-rose-600",
                    text_color: "text-white",
                    is_active: true,
                    is_new_user_exclusive: true,
                    discount_percentage: 50
                },
                {
                    id: 2,
                    title: "Go Cashless",
                    description: "Extra 10% OFF on UPI Payments.",
                    code: "UPI10",
                    bg_color: "bg-gradient-to-r from-green-600 to-emerald-600",
                    text_color: "text-white",
                    is_active: true,
                    is_new_user_exclusive: false,
                    discount_percentage: 10
                }
            ];
        }
    }
};
