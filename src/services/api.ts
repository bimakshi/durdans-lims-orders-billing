import { API_ENDPOINTS } from '@/constants';
import type {
    ApiResponse,
    PaginatedResponse,
    TestOrder,
    Bill,
    Payment,
    LabTest,
    Patient,
    DashboardStats
} from '@/types';

// ==========================================
// API CLIENT CONFIGURATION
// ==========================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

const apiClient = new ApiClient(API_BASE_URL);

// ==========================================
// ORDER SERVICES
// ==========================================
export const orderService = {
    getRecentOrders: async (): Promise<TestOrder[]> => {
        const response = await apiClient.get<TestOrder[]>(API_ENDPOINTS.ORDERS.RECENT);
        return response.data || [];
    },

    createOrder: async (orderData: Partial<TestOrder>): Promise<TestOrder> => {
        const response = await apiClient.post<TestOrder>(API_ENDPOINTS.ORDERS.CREATE, orderData);
        if (!response.data) throw new Error('Failed to create order');
        return response.data;
    },

    getOrderById: async (orderId: string): Promise<TestOrder> => {
        const response = await apiClient.get<TestOrder>(API_ENDPOINTS.ORDERS.BY_ID(orderId));
        if (!response.data) throw new Error('Order not found');
        return response.data;
    },

    cancelOrder: async (orderId: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(orderId), {});
    },

    getOrderStats: async (): Promise<{ testOrdersToday: number }> => {
        const response = await apiClient.get<{ testOrdersToday: number }>(API_ENDPOINTS.ORDERS.STATS);
        return response.data || { testOrdersToday: 0 };
    },
};

// ==========================================
// BILLING SERVICES
// ==========================================
export const billingService = {
    getBills: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Bill>> => {
        const response = await apiClient.get<PaginatedResponse<Bill>>(
            `${API_ENDPOINTS.BILLS.BASE}?page=${page}&pageSize=${pageSize}`
        );
        return response.data || { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    },

    getBillById: async (billId: string): Promise<Bill> => {
        const response = await apiClient.get<Bill>(API_ENDPOINTS.BILLS.BY_ID(billId));
        if (!response.data) throw new Error('Bill not found');
        return response.data;
    },

    recordPayment: async (billId: string, paymentData: Partial<Payment>): Promise<Payment> => {
        const response = await apiClient.post<Payment>(
            API_ENDPOINTS.BILLS.RECORD_PAYMENT(billId),
            paymentData
        );
        if (!response.data) throw new Error('Failed to record payment');
        return response.data;
    },

    getBillingStats: async () => {
        const response = await apiClient.get<{
            overduePayments: number;
            partialPayments: number;
            totalRevenueToday: number;
        }>(API_ENDPOINTS.BILLS.STATS);

        return response.data ?? {
            overduePayments: 0,
            partialPayments: 0,
            totalRevenueToday: 0,
        };
    },
};

// ==========================================
// TEST SERVICES
// ==========================================
export const testService = {
    searchTests: async (query: string = ''): Promise<LabTest[]> => {
        const response = await apiClient.get<LabTest[]>(
            `${API_ENDPOINTS.TESTS.SEARCH}?q=${encodeURIComponent(query)}`
        );
        return response.data || [];
    },

    getTestsByCategory: async (category: string): Promise<LabTest[]> => {
        const response = await apiClient.get<LabTest[]>(
            API_ENDPOINTS.TESTS.BY_CATEGORY(category)
        );
        return response.data || [];
    },

    getAllTests: async (): Promise<LabTest[]> => {
        const response = await apiClient.get<LabTest[]>(API_ENDPOINTS.TESTS.BASE);
        return response.data || [];
    },
};

// ==========================================
// PATIENT SERVICES
// ==========================================
export const patientService = {
    searchPatients: async (query: string): Promise<Patient[]> => {
        const response = await apiClient.get<Patient[]>(
            `${API_ENDPOINTS.PATIENTS.SEARCH}?q=${encodeURIComponent(query)}`
        );
        return response.data || [];
    },

    getPatientById: async (patientId: string): Promise<Patient> => {
        const response = await apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.BY_ID(patientId));
        if (!response.data) throw new Error('Patient not found');
        return response.data;
    },
};

// ==========================================
// DASHBOARD SERVICES
// ==========================================
export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
        return response.data || {
            testOrdersToday: 0,
            overduePayments: 0,
            partialPayments: 0,
            totalRevenueToday: 0,
        };
    },
};