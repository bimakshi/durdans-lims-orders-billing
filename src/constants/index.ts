// ==========================================
// API ENDPOINTS (Ordering & Billing Only)
// ==========================================
export const API_ENDPOINTS = {
    // Orders
    ORDERS: {
        BASE: '/orders',
        CREATE: '/orders/create',
        BY_ID: (id: string) => `/orders/${id}`,
        CANCEL: (id: string) => `/orders/${id}/cancel`,
        STATS: '/orders/stats',
        RECENT: '/orders/recent',
    },

    // Billing
    BILLS: {
        BASE: '/bills',
        BY_ID: (id: string) => `/bills/${id}`,
        PAYMENTS: '/bills/payments',
        RECORD_PAYMENT: (id: string) => `/bills/${id}/payments`,
        STATS: '/bills/stats',
    },

    // Tests (needed for order creation)
    TESTS: {
        BASE: '/tests',
        SEARCH: '/tests/search',
        BY_CATEGORY: (category: string) => `/tests/category/${category}`,
    },

    // Patients (needed for order creation)
    PATIENTS: {
        SEARCH: '/patients/search',
        BY_ID: (id: string) => `/patients/${id}`,
    },

    // Dashboard (for Orders & Billing stats)
    DASHBOARD: {
        STATS: '/dashboard/orders-billing/stats',
    },
};

// ==========================================
// STATUS COLORS & BADGES
// ==========================================
export const STATUS_COLORS = {
    // Order Status
    ORDER: {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    },

    // Payment Status
    PAYMENT: {
        PAID: 'bg-green-100 text-green-800 border-green-300',
        PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        OVERDUE: 'bg-red-100 text-red-800 border-red-300',
    },
};

// ==========================================
// CURRENCY & FORMATTING
// ==========================================
export const CURRENCY = {
    SYMBOL: 'LKR',
    CODE: 'LKR',
    LOCALE: 'en-LK',
};

export const formatCurrency = (amount: number): string => {
    return `${CURRENCY.SYMBOL} ${amount.toLocaleString(CURRENCY.LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ==========================================
// TEST CATEGORIES (Blood & Urine Only)
// ==========================================
export const TEST_CATEGORIES = [
    { value: 'Hematology', label: 'Hematology' },
    { value: 'Biochemistry', label: 'Biochemistry' },
    { value: 'Urinalysis', label: 'Urinalysis' },
];

// ==========================================
// PAYMENT METHODS
// ==========================================
export const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

// ==========================================
// SERVICE CHARGE (5%)
// ==========================================
export const SERVICE_CHARGE_PERCENTAGE = 5;

export const calculateServiceCharge = (subtotal: number): number => {
    return (subtotal * SERVICE_CHARGE_PERCENTAGE) / 100;
};

export const calculateTotal = (subtotal: number, discount: number = 0): number => {
    const serviceCharge = calculateServiceCharge(subtotal);
    return subtotal + serviceCharge - discount;
};

// ==========================================
// PAGINATION
// ==========================================
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50],
};