export interface ServiceIssue {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    price_description: string | null;
    is_inspection_required: boolean;
    image_url: string | null;
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
    categories: ServiceCategory[];
}
