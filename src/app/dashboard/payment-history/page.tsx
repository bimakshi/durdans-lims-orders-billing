'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Banknote,
    CreditCard,
    Search,
    Calendar,
    Download,
    Filter,
    TrendingUp,
    Receipt,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'INSURANCE' | 'BANK_TRANSFER';
type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

interface PaymentRecord {
    id: string;
    transactionId: string;
    billId: string;
    orderId: string;
    patientName: string;
    patientId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    receivedBy: string;
    dateTime: string;
    receiptNo: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockPayments: PaymentRecord[] = [
    {
        id: '1',
        transactionId: 'TXN-2023-001245',
        billId: 'INV-2023-004521',
        orderId: 'ORD-55429',
        patientName: 'Anura Kumara Jayantha',
        patientId: 'DH-88291',
        amount: 2000,
        method: 'CASH',
        status: 'SUCCESS',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 11:30 AM',
        receiptNo: 'RCP-001245',
    },
    {
        id: '2',
        transactionId: 'TXN-2023-001246',
        billId: 'INV-2023-004522',
        orderId: 'ORD-55430',
        patientName: 'Kamala Perera',
        patientId: 'DH-77102',
        amount: 5750,
        method: 'CREDIT_CARD',
        status: 'SUCCESS',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 12:10 PM',
        receiptNo: 'RCP-001246',
    },
    {
        id: '3',
        transactionId: 'TXN-2023-001247',
        billId: 'INV-2023-004523',
        orderId: 'ORD-55431',
        patientName: 'Rohan Fernando',
        patientId: 'DH-65234',
        amount: 3200,
        method: 'INSURANCE',
        status: 'PENDING',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 01:45 PM',
        receiptNo: 'RCP-001247',
    },
    {
        id: '4',
        transactionId: 'TXN-2023-001248',
        billId: 'INV-2023-004524',
        orderId: 'ORD-55432',
        patientName: 'Nimal Silva',
        patientId: 'DH-54112',
        amount: 1850,
        method: 'DEBIT_CARD',
        status: 'SUCCESS',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 02:30 PM',
        receiptNo: 'RCP-001248',
    },
    {
        id: '5',
        transactionId: 'TXN-2023-001249',
        billId: 'INV-2023-004525',
        orderId: 'ORD-55433',
        patientName: 'Sunethra Jayawardena',
        patientId: 'DH-43201',
        amount: 4200,
        method: 'BANK_TRANSFER',
        status: 'SUCCESS',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 03:15 PM',
        receiptNo: 'RCP-001249',
    },
    {
        id: '6',
        transactionId: 'TXN-2023-001250',
        billId: 'INV-2023-004526',
        orderId: 'ORD-55434',
        patientName: 'Priya Rathnayake',
        patientId: 'DH-32109',
        amount: 6500,
        method: 'CREDIT_CARD',
        status: 'FAILED',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 04:00 PM',
        receiptNo: 'RCP-001250',
    },
    {
        id: '7',
        transactionId: 'TXN-2023-001251',
        billId: 'INV-2023-004527',
        orderId: 'ORD-55435',
        patientName: 'Lasith Malinga',
        patientId: 'DH-21008',
        amount: 2750,
        method: 'CASH',
        status: 'SUCCESS',
        receivedBy: 'Dr. Adrian S.',
        dateTime: 'Oct 24, 2023 • 04:45 PM',
        receiptNo: 'RCP-001251',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
    `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Cash',
    CREDIT_CARD: 'Credit Card',
    DEBIT_CARD: 'Debit Card',
    INSURANCE: 'Insurance',
    BANK_TRANSFER: 'Bank Transfer',
};

const METHOD_COLORS: Record<PaymentMethod, string> = {
    CASH: 'bg-green-100 text-green-800 border-green-300',
    CREDIT_CARD: 'bg-blue-100 text-blue-800 border-blue-300',
    DEBIT_CARD: 'bg-purple-100 text-purple-800 border-purple-300',
    INSURANCE: 'bg-orange-100 text-orange-800 border-orange-300',
    BANK_TRANSFER: 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
    SUCCESS: 'bg-green-100 text-green-800 border-green-300',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    FAILED: 'bg-red-100 text-red-800 border-red-300',
};

// ─── Page Component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export default function PaymentHistoryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Filtered & paginated data ────────────────────────────────────────────
    const filtered = useMemo(() => {
        return mockPayments.filter((p) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                p.transactionId.toLowerCase().includes(q) ||
                p.billId.toLowerCase().includes(q) ||
                p.patientName.toLowerCase().includes(q) ||
                p.patientId.toLowerCase().includes(q);

            const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

            return matchesSearch && matchesMethod && matchesStatus;
        });
    }, [searchQuery, methodFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset to page 1 when filters change
    const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
    const handleMethod = (v: PaymentMethod | 'ALL') => { setMethodFilter(v); setCurrentPage(1); };
    const handleStatus = (v: PaymentStatus | 'ALL') => { setStatusFilter(v); setCurrentPage(1); };

    // ── Stats (from full mock data) ──────────────────────────────────────────
    const stats = {
        totalTransactions: mockPayments.length,
        totalCollected: mockPayments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0),
        successCount: mockPayments.filter(p => p.status === 'SUCCESS').length,
        pendingCount: mockPayments.filter(p => p.status === 'PENDING').length,
        failedCount: mockPayments.filter(p => p.status === 'FAILED').length,
    };

    const handleExport = () => toast.success('Exporting payment history as CSV...');
    const handleViewReceipt = (receiptNo: string) => toast.info(`Opening receipt ${receiptNo}`);

    return (
        <div className="p-6 space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Payment History"
                    description="Complete transaction log for all payments received"
                />
                <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Transactions"
                    value={stats.totalTransactions}
                    icon={Receipt}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <StatCard
                    title="Total Collected"
                    value={formatCurrency(stats.totalCollected)}
                    icon={TrendingUp}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                />
                <StatCard
                    title="Successful"
                    value={stats.successCount}
                    icon={Banknote}
                    iconColor="text-emerald-600"
                    iconBgColor="bg-emerald-100"
                />
                <StatCard
                    title="Pending"
                    value={stats.pendingCount}
                    icon={CreditCard}
                    iconColor="text-yellow-600"
                    iconBgColor="bg-yellow-100"
                />
                <StatCard
                    title="Failed"
                    value={stats.failedCount}
                    icon={ArrowUpRight}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-100"
                />
            </div>

            {/* ── Filters ── */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by Transaction ID, Bill ID, Patient..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Method filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={methodFilter}
                                onChange={(e) => handleMethod(e.target.value as PaymentMethod | 'ALL')}
                            >
                                <option value="ALL">All Methods</option>
                                <option value="CASH">Cash</option>
                                <option value="CREDIT_CARD">Credit Card</option>
                                <option value="DEBIT_CARD">Debit Card</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                            </select>
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <select
                                className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => handleStatus(e.target.value as PaymentStatus | 'ALL')}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="SUCCESS">Success</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Table ── */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                                <TableHead className="font-semibold text-gray-700">Bill ID</TableHead>
                                <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                <TableHead className="font-semibold text-gray-700">Method</TableHead>
                                <TableHead className="font-semibold text-gray-700 text-right">Amount</TableHead>
                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                <TableHead className="font-semibold text-gray-700">Received By</TableHead>
                                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                                        No transactions found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-mono text-sm text-blue-700 font-medium">
                                            {payment.transactionId}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{payment.billId}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{payment.patientName}</p>
                                                <p className="text-xs text-gray-400">{payment.patientId}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{payment.dateTime}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={METHOD_COLORS[payment.method]}>
                                                {METHOD_LABELS[payment.method]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-gray-900">
                                            {formatCurrency(payment.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={STATUS_COLORS[payment.status]}>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{payment.receivedBy}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs"
                                                onClick={() => handleViewReceipt(payment.receiptNo)}
                                            >
                                                View Receipt
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <p>
                    Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{' '}
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            className="w-8"
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
