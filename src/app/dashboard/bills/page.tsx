'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Receipt,
    AlertTriangle,
    CheckCircle2,
    Hourglass,
    Banknote,
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/constants';
import type { Bill } from '@/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockBills: Bill[] = [
    {
        id: '1',
        billId: 'INV-2023-004521',
        orderId: 'ORD-55429',
        patientId: 'DH-88291',
        patientName: 'Anura Kumara Jayantha',
        patientPhone: '+94 77 123 4567',
        orderDate: '2023-10-25',
        billDate: '2023-10-25',
        tests: [],
        subtotal: 4500,
        serviceCharge: 225,
        discount: 0,
        totalAmount: 4725,
        paidAmount: 2000,
        outstandingAmount: 2725,
        paymentStatus: 'PARTIAL',
        payments: [],
    },
    {
        id: '2',
        billId: 'INV-2023-004520',
        orderId: 'ORD-55428',
        patientId: 'DH-88302',
        patientName: 'Dilhani Perera',
        patientPhone: '+94 71 234 5678',
        orderDate: '2023-10-25',
        billDate: '2023-10-25',
        tests: [],
        subtotal: 12400,
        serviceCharge: 0,
        discount: 0,
        totalAmount: 12400,
        paidAmount: 12400,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        payments: [],
    },
    {
        id: '3',
        billId: 'INV-2023-004519',
        orderId: 'ORD-55425',
        patientId: 'DH-88411',
        patientName: 'Maithripala S.',
        patientPhone: '+94 76 345 6789',
        orderDate: '2023-10-24',
        billDate: '2023-10-24',
        tests: [],
        subtotal: 8500,
        serviceCharge: 0,
        discount: 0,
        totalAmount: 8500,
        paidAmount: 0,
        outstandingAmount: 8500,
        paymentStatus: 'OVERDUE',
        payments: [],
    },
    {
        id: '4',
        billId: 'INV-2023-004518',
        orderId: 'ORD-55421',
        patientId: 'DH-88450',
        patientName: 'Shirani K.',
        patientPhone: '+94 77 456 7890',
        orderDate: '2023-10-24',
        billDate: '2023-10-24',
        tests: [],
        subtotal: 3200,
        serviceCharge: 0,
        discount: 0,
        totalAmount: 3200,
        paidAmount: 3200,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        payments: [],
    },
    {
        id: '5',
        billId: 'INV-2023-004517',
        orderId: 'ORD-55420',
        patientId: 'DH-88399',
        patientName: 'Kamal Bandara',
        patientPhone: '+94 70 567 8901',
        orderDate: '2023-10-23',
        billDate: '2023-10-23',
        tests: [],
        subtotal: 6700,
        serviceCharge: 335,
        discount: 0,
        totalAmount: 7035,
        paidAmount: 3000,
        outstandingAmount: 4035,
        paymentStatus: 'PARTIAL',
        payments: [],
    },
    {
        id: '6',
        billId: 'INV-2023-004516',
        orderId: 'ORD-55418',
        patientId: 'DH-88310',
        patientName: 'Priyantha Rajapaksa',
        patientPhone: '+94 71 678 9012',
        orderDate: '2023-10-23',
        billDate: '2023-10-23',
        tests: [],
        subtotal: 5100,
        serviceCharge: 255,
        discount: 0,
        totalAmount: 5355,
        paidAmount: 0,
        outstandingAmount: 5355,
        paymentStatus: 'OVERDUE',
        payments: [],
    },
    {
        id: '7',
        billId: 'INV-2023-004515',
        orderId: 'ORD-55415',
        patientId: 'DH-88275',
        patientName: 'Sandya Fernando',
        patientPhone: '+94 76 789 0123',
        orderDate: '2023-10-22',
        billDate: '2023-10-22',
        tests: [],
        subtotal: 9800,
        serviceCharge: 490,
        discount: 0,
        totalAmount: 10290,
        paidAmount: 10290,
        outstandingAmount: 0,
        paymentStatus: 'PAID',
        payments: [],
    },
    {
        id: '8',
        billId: 'INV-2023-004514',
        orderId: 'ORD-55412',
        patientId: 'DH-88201',
        patientName: 'Nirosha Wickramasinghe',
        patientPhone: '+94 77 890 1234',
        orderDate: '2023-10-22',
        billDate: '2023-10-22',
        tests: [],
        subtotal: 2800,
        serviceCharge: 140,
        discount: 0,
        totalAmount: 2940,
        paidAmount: 1500,
        outstandingAmount: 1440,
        paymentStatus: 'PARTIAL',
        payments: [],
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentStatus = 'ALL' | 'PAID' | 'PARTIAL' | 'OVERDUE';

const PAGE_SIZE = 4;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BillsPaymentsPage() {
    const router = useRouter();

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>('ALL');
    const [startDate, setStartDate] = useState('2023-10-01');
    const [endDate, setEndDate] = useState('2023-10-25');

    // Applied filter state (only updates when Apply is clicked)
    const [appliedSearch, setAppliedSearch] = useState('');
    const [appliedStatus, setAppliedStatus] = useState<PaymentStatus>('ALL');
    const [appliedStart, setAppliedStart] = useState('2023-10-01');
    const [appliedEnd, setAppliedEnd] = useState('2023-10-25');

    const [currentPage, setCurrentPage] = useState(1);

    // ── Apply filters ────────────────────────────────────────────────────────
    const handleApply = () => {
        setAppliedSearch(searchQuery);
        setAppliedStatus(statusFilter);
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
        setCurrentPage(1);
    };

    // Also apply on Enter key in search
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleApply();
    };

    // ── Filtered data ────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return mockBills.filter((bill) => {
            const q = appliedSearch.toLowerCase();
            const matchesSearch =
                !q ||
                bill.billId.toLowerCase().includes(q) ||
                bill.orderId.toLowerCase().includes(q) ||
                bill.patientName.toLowerCase().includes(q) ||
                bill.patientId.toLowerCase().includes(q);

            const matchesStatus =
                appliedStatus === 'ALL' || bill.paymentStatus === appliedStatus;

            const billDate = new Date(bill.billDate);
            const start = new Date(appliedStart);
            const end = new Date(appliedEnd);
            const matchesDate = billDate >= start && billDate <= end;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [appliedSearch, appliedStatus, appliedStart, appliedEnd]);

    // ── Pagination ───────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = {
        totalBillsToday: 142,
        totalOutstanding: 284500,
        completedPayments: 98,
        partialPayments: 26,
        todaysCollections: 452300,
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bills & Payments</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and track patient invoices and outstanding collections.</p>
            </div>

            {/* ── Search and Filters ── */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by Bill ID, Order ID, or Patient Name..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">STATUS:</span>
                    <select
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
                    >
                        <option value="ALL">ALL STATUS</option>
                        <option value="PAID">PAID</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="OVERDUE">OVERDUE</option>
                    </select>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">DATE:</span>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-md px-3 py-1.5 bg-white">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            className="text-sm bg-transparent focus:outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-gray-400 mx-1">-</span>
                        <input
                            type="date"
                            className="text-sm bg-transparent focus:outline-none"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Apply button */}
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApply}>
                    <Filter className="w-4 h-4 mr-2" />
                    Apply
                </Button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <StatCard
                    title="Total Bills Today"
                    value={stats.totalBillsToday}
                    icon={Receipt}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <StatCard
                    title="Total Outstanding"
                    value={formatCurrency(stats.totalOutstanding)}
                    icon={AlertTriangle}
                    iconColor="text-orange-600"
                    iconBgColor="bg-orange-100"
                />
                <StatCard
                    title="Completed Payments"
                    value={stats.completedPayments}
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                />
                <StatCard
                    title="Partial Payments"
                    value={stats.partialPayments}
                    icon={Hourglass}
                    iconColor="text-yellow-600"
                    iconBgColor="bg-yellow-100"
                />
                <StatCard
                    title="Today's Collections"
                    value={formatCurrency(stats.todaysCollections)}
                    icon={Banknote}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                />
            </div>

            {/* ── Bills Table ── */}
            <div className="bg-white rounded-lg border">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Bill ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Patient Name</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total Amount</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Paid</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Outstanding</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-12 text-gray-400">
                                No bills found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        paginated.map((bill) => (
                            <tr key={bill.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 font-medium text-gray-900">{bill.billId}</td>
                                <td className="py-4 px-4 text-gray-600">{bill.orderId}</td>
                                <td className="py-4 px-4">
                                    <p className="font-medium text-gray-900">{bill.patientName}</p>
                                    <p className="text-sm text-gray-500">{bill.patientId}</p>
                                </td>
                                <td className="py-4 px-4 text-right font-medium text-gray-900">
                                    {bill.totalAmount.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right font-medium text-green-600">
                                    {bill.paidAmount.toLocaleString()}
                                </td>
                                <td className="py-4 px-4 text-right font-semibold">
                                        <span className={bill.outstandingAmount > 0 ? 'text-red-600' : 'text-gray-400'}>
                                            {bill.outstandingAmount.toLocaleString()}
                                        </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <Badge
                                        variant="outline"
                                        className={
                                            bill.paymentStatus === 'PAID'
                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                : bill.paymentStatus === 'PARTIAL'
                                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                    : 'bg-red-100 text-red-800 border-red-300'
                                        }
                                    >
                                        {bill.paymentStatus}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {/* ✅ VIEW BILL navigates to bill details page */}
                                    <Button
                                        variant="link"
                                        className="text-blue-600"
                                        onClick={() => router.push(`/dashboard/bills/${bill.id}`)}
                                    >
                                        VIEW BILL <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/* ── Pagination ── */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-gray-600">
                        Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{' '}
                        {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        {/* Previous */}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                size="sm"
                                variant={currentPage === page ? 'default' : 'outline'}
                                className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700 w-8' : 'w-8'}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}

                        {/* Next */}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
