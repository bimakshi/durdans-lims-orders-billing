'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
    FlaskConical,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    Plus,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { formatCurrency, STATUS_COLORS } from '@/constants';
import type { TestOrder } from '@/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockOrders: TestOrder[] = [
    {
        id: '1',
        orderId: 'ORD-55210',
        patientId: 'DH-88291',
        patientName: 'Anura Kumara J.',
        patientAge: 42,
        patientGender: 'Male',
        orderDate: '2023-10-24',
        tests: [
            { testId: '1', testCode: 'LBT-001', testName: 'CBC', category: 'Hematology', price: 1200 },
            { testId: '2', testCode: 'LBT-042', testName: 'Lipid Profile', category: 'Biochemistry', price: 2450 },
            { testId: '3', testCode: 'LBT-011', testName: 'FBS', category: 'Biochemistry', price: 850 },
        ],
        status: 'IN_PROGRESS',
        subtotal: 4500,
        serviceCharge: 225,
        discount: 0,
        totalAmount: 4725,
    },
    {
        id: '2',
        orderId: 'ORD-55211',
        patientId: 'DH-88302',
        patientName: 'Nilmini Perera',
        patientAge: 35,
        patientGender: 'Female',
        orderDate: '2023-10-24',
        tests: [
            { testId: '4', testCode: 'LBT-005', testName: 'HbA1c', category: 'Biochemistry', price: 1800 },
            { testId: '5', testCode: 'LBT-012', testName: 'Vitamin D', category: 'Biochemistry', price: 3500 },
        ],
        status: 'PENDING',
        subtotal: 5300,
        serviceCharge: 265,
        discount: 0,
        totalAmount: 5565,
    },
    {
        id: '3',
        orderId: 'ORD-55212',
        patientId: 'DH-77102',
        patientName: 'Kamala Perera',
        patientAge: 58,
        patientGender: 'Female',
        orderDate: '2023-10-23',
        tests: [
            { testId: '6', testCode: 'LBT-001', testName: 'CBC', category: 'Hematology', price: 1200 },
            { testId: '7', testCode: 'LBT-008', testName: 'Urine Full Report', category: 'Urinalysis', price: 950 },
        ],
        status: 'COMPLETED',
        subtotal: 2150,
        serviceCharge: 107.5,
        discount: 0,
        totalAmount: 2257.5,
    },
    {
        id: '4',
        orderId: 'ORD-55213',
        patientId: 'DH-65234',
        patientName: 'Rohan Fernando',
        patientAge: 45,
        patientGender: 'Male',
        orderDate: '2023-10-23',
        tests: [
            { testId: '8', testCode: 'LBT-042', testName: 'Lipid Profile', category: 'Biochemistry', price: 2450 },
        ],
        status: 'COMPLETED',
        subtotal: 2450,
        serviceCharge: 122.5,
        discount: 0,
        totalAmount: 2572.5,
    },
    {
        id: '5',
        orderId: 'ORD-55214',
        patientId: 'DH-54112',
        patientName: 'Nimal Silva',
        patientAge: 30,
        patientGender: 'Male',
        orderDate: '2023-10-22',
        tests: [
            { testId: '9', testCode: 'LBT-011', testName: 'FBS', category: 'Biochemistry', price: 850 },
            { testId: '10', testCode: 'LBT-005', testName: 'HbA1c', category: 'Biochemistry', price: 1800 },
        ],
        status: 'PENDING',
        subtotal: 2650,
        serviceCharge: 132.5,
        discount: 0,
        totalAmount: 2782.5,
    },
    {
        id: '6',
        orderId: 'ORD-55215',
        patientId: 'DH-43201',
        patientName: 'Sunethra Jayawardena',
        patientAge: 62,
        patientGender: 'Female',
        orderDate: '2023-10-22',
        tests: [
            { testId: '11', testCode: 'LBT-001', testName: 'CBC', category: 'Hematology', price: 1200 },
            { testId: '12', testCode: 'LBT-042', testName: 'Lipid Profile', category: 'Biochemistry', price: 2450 },
            { testId: '13', testCode: 'LBT-012', testName: 'Vitamin D', category: 'Biochemistry', price: 3500 },
        ],
        status: 'IN_PROGRESS',
        subtotal: 7150,
        serviceCharge: 357.5,
        discount: 0,
        totalAmount: 7507.5,
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

const PAGE_SIZE = 5;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AllOrdersPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = {
        total: mockOrders.length,
        pending: mockOrders.filter(o => o.status === 'PENDING').length,
        inProgress: mockOrders.filter(o => o.status === 'IN_PROGRESS').length,
        completed: mockOrders.filter(o => o.status === 'COMPLETED').length,
    };

    // ── Filter ───────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return mockOrders.filter((o) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                o.orderId.toLowerCase().includes(q) ||
                o.patientName.toLowerCase().includes(q) ||
                o.patientId.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1); };
    const handleStatus = (v: OrderStatus) => { setStatusFilter(v); setCurrentPage(1); };

    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Test Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage all laboratory test orders</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push('/dashboard/create-order')}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Order
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Orders"
                    value={stats.total}
                    icon={FlaskConical}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    iconColor="text-yellow-600"
                    iconBgColor="bg-yellow-100"
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={AlertCircle}
                    iconColor="text-orange-600"
                    iconBgColor="bg-orange-100"
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
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
                                placeholder="Search by Order ID, Patient Name, Patient ID..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select
                                className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={(e) => handleStatus(e.target.value as OrderStatus)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
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
                                <TableHead className="font-semibold text-gray-700">ORDER ID</TableHead>
                                <TableHead className="font-semibold text-gray-700">PATIENT NAME</TableHead>
                                <TableHead className="font-semibold text-gray-700">PATIENT ID</TableHead>
                                <TableHead className="font-semibold text-gray-700">ORDER DATE</TableHead>
                                <TableHead className="font-semibold text-gray-700">TESTS SUMMARY</TableHead>
                                <TableHead className="font-semibold text-gray-700">TOTAL AMOUNT</TableHead>
                                <TableHead className="font-semibold text-gray-700">STATUS</TableHead>
                                <TableHead className="font-semibold text-gray-700">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                        No orders found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium text-blue-700">
                                            {order.orderId}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{order.patientName}</p>
                                                <p className="text-xs text-gray-400">{order.patientAge}Y • {order.patientGender}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {order.patientId}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {order.orderDate}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 max-w-[200px]">
                                            {order.tests.map(t => t.testName).join(', ')}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900">
                                            {formatCurrency(order.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={STATUS_COLORS.ORDER[order.status]}
                                            >
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
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
