export interface Booking {
    id: number;
    customer_name: string;
    customer_phone: number;
    service_id: number;
    status_id: number;
    time_slot: string;
    address: string;
    latitude?: number;
    longitude?: number;
    quote_price?: number;
    final_price?: number;
    comments?: string;
    created_at?: string;
    tracking_id?: string;
    media?: { id: number; url: string; media_type: string }[];
    status?: { name: string };
    service_name?: string;
    user_comment?: string;
}

export interface BookingCreate {
    customer_name?: string;
    customer_phone: number;
    service_id: number;
    status_id?: number;
    time_slot?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    quote_price?: number;
    comments?: string;
    media_ids?: number[];
    user_comment?: string;
}

export interface Status {
    id: number;
    name: string;
    description?: string;
}

export interface StatusCreate {
    name: string;
    description?: string;
}

export interface Service {
    id: number;
    name: string;
    description?: string;
    base_price?: number;
}
