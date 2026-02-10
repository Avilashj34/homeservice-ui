import { apiService } from "@/lib/api_service";

export interface LeadServiceIssue {
    id?: number; // Optional because it might not be created yet on frontend
    service_issue_id?: number;
    issue_name: string;
    price: number;
}

export interface Lead {
    id: number;
    customer_name: string;
    customer_phone: number;
    source: string;
    services: string[];
    details: any;
    address?: string;
    status?: string;
    status_id?: number;
    assigned_to?: string;
    assigned_to_id?: number;
    created_at: string;
    last_called_at?: string;
    next_follow_up?: string | null;
    reassignment_count?: number;
    last_assigned_at?: string;

    // New Fields
    estimated_cost?: number;
    notes?: string;
    service_level?: string;
    is_mobile_repair?: boolean;
    mobile_brand?: string;
    mobile_model?: string;
    mobile_issue?: string;
    service_issues?: LeadServiceIssue[];

    // Repairman
    repairman_id?: number | null;
    repairman?: { id: number; name: string; phone_number: string; service_type: string };
}

export interface LeadCreate {
    customer_name: string;
    customer_phone: number;
    source: string;
    services: string[];
    details: any;
    address?: string;
    assigned_to_id?: number;

    // New Fields
    estimated_cost?: number;
    notes?: string;
    service_level?: string;
    is_mobile_repair?: boolean;
    mobile_brand?: string;
    mobile_model?: string;
    mobile_issue?: string;
    service_issues?: LeadServiceIssue[];
    repairman_id?: number;
}

export interface CallLogCreate {
    call_status: string;
    lead_status_id?: number;
    note?: string;
}

export interface LeadComment {
    id: number;
    text: string;
    created_at: string;
    author: string;
}

export interface ActivityLog {
    id: number;
    action: string;
    details: any;
    created_at: string;
    by: string;
}

export const LeadsAPI = {
    getAll: async (params?: {
        skip?: number;
        limit?: number;
        status_id?: number | string; // Support string "all" or number
        search?: string;
        assigned_to?: number | string;
        start_date?: string; // YYYY-MM-DD
        end_date?: string;   // YYYY-MM-DD
    }) => {
        const queryParams: any = { ...params };

        // Remove empty values
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === "" || queryParams[key] === undefined || queryParams[key] === "all") {
                delete queryParams[key];
            }
        });

        return apiService.get<Lead[]>("/leads", { params: queryParams });
    },

    getById: async (id: number) => {
        return apiService.get<Lead>(`/leads/${id}`);
    },

    create: async (data: LeadCreate) => {
        return apiService.post<{ id: number, message: string }>("/leads", data);
    },

    update: async (id: number, data: Partial<Lead>) => {
        return apiService.patch<Lead>(`/leads/${id}`, data);
    },

    logCall: async (id: number, data: CallLogCreate) => {
        return apiService.post<{ message: string, lead: Lead }>(`/leads/${id}/call-log`, data);
    },

    initiateCall: async (id: number) => {
        return apiService.post<{ message: string }>(`/leads/${id}/call-initiated`);
    },

    addComment: async (id: number, text: string, mentioned_ids?: number[]) => {
        return apiService.post<{ message: string }>(`/leads/${id}/comments`, { text, mentioned_ids });
    },

    getLogs: async (id: number) => {
        return apiService.get<{ logs: ActivityLog[], comments: LeadComment[] }>(`/leads/${id}/logs`);
    },

    getStats: async () => {
        return apiService.get<{ today_leads: number, today_calls: number, active_leads: number, all_leads: number }>("/leads/d/stats");
    },

    generateScript: async (id: number) => {
        return apiService.post<{ script: string, prompt_used: string }>(`/leads/${id}/script`, {});
    }
};
