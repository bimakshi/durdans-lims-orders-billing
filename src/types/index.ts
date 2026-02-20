// ==========================================
// PATIENT TYPES (Basic - for search only)
// ==========================================
export interface Patient {
    id: string;
    patientId: string; // DH-88291
    fullName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    phone: string;
}

// ==========================================
// LAB TEST TYPES (Blood & Urine Only)
// ==========================================
export interface LabTest {
    id: string;
    testCode: string; // LBT-001
    testName: string;
    category: TestCategory;
    price: number;
}

export type TestCategory =
    | 'Hematology'      // Blood tests like CBC, Blood Count
    | 'Biochemistry'    // Blood Chemistry, Lipid Profile, Blood Sugar
    | 'Urinalysis';     // Urine tests

// ==========================================
// ORDER TYPES
// ==========================================
export interface TestOrder {
    id: string;
    orderId: string; // ORD-55210
    patientId: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    orderDate: string;
    tests: OrderTest[];
    status: OrderStatus;
    orderingPhysician?: string;
    subtotal: number;
    serviceCharge: number;
    discount: number;
    totalAmount: number;
}

export interface OrderTest {
    testId: string;
    testCode: string;
    testName: string;
    category: string;
    price: number;
}

export type OrderStatus =
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'COMPLETED';

// ==========================================
// BILLING TYPES
// ==========================================
export interface Bill {
    id: string;
    billId: string; // INV-2023-004521
    orderId: string;
    patientId: string;
    patientName: string;
    patientPhone: string;
    orderDate: string;
    billDate: string;
    tests: BillLineItem[];
    subtotal: number;
    serviceCharge: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    paymentStatus: PaymentStatus;
    payments: Payment[];
}

export interface BillLineItem {
    testCode: string;
    testName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export type PaymentStatus =
    | 'PAID'
    | 'PARTIAL'
    | 'OVERDUE';

export interface Payment {
    id: string;
    transactionId: string;
    billId: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    receivedBy: string;
    receiptNumber: string;
}

export type PaymentMethod =
    | 'CASH'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'INSURANCE'
    | 'BANK_TRANSFER';

// ==========================================
// DASHBOARD STATS (Orders & Billing Only)
// ==========================================
export interface DashboardStats {
    // Order Stats
    testOrdersToday: number;

    // Payment Stats
    overduePayments: number;
    partialPayments: number;

    // Revenue Stats
    totalRevenueToday: number;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}