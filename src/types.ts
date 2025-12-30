export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'FARMER' | 'STAFF' | 'VIEWER';
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface FarmerProfile {
    user: string;
    business_name?: string;
    location?: string;
    experience_years: number;
    verification_status: string;
    avatar?: string;
}

export interface Farm {
    id: string;
    farmer?: string;
    farmer_id?: string;
    name: string;
    location: string;
    size_hectares?: number;
    latitude?: number;
    longitude?: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Batch {
    id: string;
    farm: string;
    batch_number: string;
    breed: string;
    breed_config?: string;
    quantity: number;
    start_date: string;
    expected_end_date?: string;
    status: string;
    mortality_count: number;
    current_age_days: number;
    created_at: string;
    updated_at: string;
}

export interface Device {
    id: string;
    device_name: string;
    serial_number: string;
    device_type: string;
    status: string;
    farm: string;
    batch?: string;
    firmware_version?: string;
    installation_date: string;
    last_online?: string;
}

export interface Alert {
    id: string;
    farmer: string;
    farm?: string;
    batch?: string;
    device?: string;
    alert_type: 'HEALTH' | 'ENVIRONMENT' | 'DEVICE' | 'SYSTEM';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface Activity {
    id: string;
    farm?: string;
    batch?: string;
    farmer: string;
    activity_type: 'FEEDING' | 'VACCINATION' | 'CLEANING' | 'INSPECTION' | 'OTHER';
    description?: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    scheduled_date: string;
    completed_at?: string;
    created_at: string;
}

export interface InventoryItem {
    id: string;
    farmer: string;
    farm?: string;
    name: string;
    category: string;
    subcategory?: string;
    quantity: number;
    unit: string;
    cost_per_unit: number;
    reorder_level: number;
    supplier?: string;
    expiry_date?: string;
    purchase_date?: string;
    feed_type?: string;
    consumption_rate_per_day?: number;
    course_days?: number;
    requires_refrigeration: boolean;
    is_iot_device: boolean;
    is_emergency_stock: boolean;
    batch?: string;
    age_days?: number;
    average_weight?: number;
    barcode?: string;
    batch_number?: string;
    location?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    farmer: string;
    plan: string;
    status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAYMENT_PENDING';
    start_date: string;
    end_date: string;
    amount: number;
    is_active: boolean;
    auto_renew: boolean;
}
