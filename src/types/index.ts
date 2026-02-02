export interface ServiceIssue {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    price_description: string | null;
    is_inspection_required: boolean;
    image_url: string | null;
    is_top_issue: boolean;
}

export interface ServiceCategory {
    id: number;
    name: string;
    order: number;
    issues: ServiceIssue[];
}

export interface Service {
    id: number;
    name: string;
    description: string;
    base_price: number;
    image_url?: string;
    icon?: string;
    color_theme?: string;
    categories: ServiceCategory[];
}

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
    assigned_to?: TeamMember;
    assigned_to_id?: number;
}

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    role?: string;
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
    assigned_to_id?: number;
    notify_phones?: string[];
}

export interface BookingUpdate {
    status_id?: number;
    quote_price?: number;
    final_price?: number;
    comments?: string;
    user_comment?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    customer_name?: string;
    customer_phone?: number;
    service_id?: number;
    media_ids?: number[];
    assigned_to_id?: number;
    notify_phones?: string[];
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

export interface TeamMemberCreate {
    name: string;
    email: string;
    role?: string;
}