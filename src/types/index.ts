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
    repairman?: Repairman;
    repairman_id?: number;
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
    repairman_id?: number;
}

export interface BookingUpdate {
    status_id?: number;
    quote_price?: number;
    final_price?: number;
    time_slot?: string;
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
    repairman_id?: number;
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

export interface TeamMemberCreate {
    name: string;
    email: string;
    role?: string;
}

export interface Repairman {
    id: number;
    name: string;
    phone_number: string;
    service_type: string;
    employee_type: string;
}

export interface RepairmanCreate {
    name: string;
    phone_number: string;
    service_type: string;
    employee_type: string;
}
