import { apiService } from '@/lib/api_service';

export interface RepairLead {
    id: number;
    customer_name: string;
    customer_phone: string; // "XXXX..." or real
    address: string;
    service_issues: { issue_name: string; price: number }[];
    mobile_repair: boolean;
    mobile_brand?: string;
    mobile_model?: string;
    mobile_issue?: string;
    status: string;
    is_masked: boolean;
}

export const RepairAPI = {
    sendOtp: async (phone_number: string, type: 'login' | 'job_close', lead_id?: number) => {
        return apiService.post('/repair/send-otp', { phone_number, type, lead_id });
    },

    verifyOtp: async (phone_number: string, code: string, type: 'login' | 'job_close', lead_id?: number) => {
        return apiService.post<{ success: boolean; token?: string; repairman_id?: number; message: string }>
            ('/repair/verify-otp', { phone_number, code, type, lead_id });
    },

    getLead: async (id: number, token?: string) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['X-Repair-Token'] = token;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/repair/leads/${id}`, {
            headers
        });
        if (!res.ok) throw new Error('Failed to fetch lead');
        return res.json() as Promise<RepairLead>;
    },

    startJob: async (id: number, token: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/repair/leads/${id}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Repair-Token': token
            }
        });
        if (!res.ok) throw new Error('Failed to start job');
        return res.json();
    },

    closeJob: async (id: number, customer_otp: string, token: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/repair/leads/${id}/close`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Repair-Token': token
            },
            body: JSON.stringify({ customer_otp })
        });
        if (!res.ok) throw new Error('Failed to close job');
        return res.json();
    }
};
