'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText, Download, Shield, Lock, Search,
    Filter, Calendar, CheckCircle2, Clock,
    AlertTriangle, Eye, Printer, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from '@/constants';
import { toast } from 'sonner';

// ─── Role-Based Access Control ────────────────────────────────────────────────

const CURRENT_USER = {
    name: 'Dr. Adrian S.',
    role: 'Chief Registrar',
    permissions: ['view_tax', 'export_reports', 'print_invoices'],
};

function hasPermission(permission: string) {
    return CURRENT_USER.permissions.includes(permission);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = 'ISSUED' | 'PENDING' | 'VOID';
type FilterStatus = 'ALL' | InvoiceStatus;

interface TaxInvoice {
    id: string;
    invoiceNo: string;
    billId: string;
    patientName: string;
    patientId: string;
    issuedDate: string;
    dueDate: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalWithTax: number;
    status: InvoiceStatus;
    issuedBy: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockInvoices: TaxInvoice[] = [
    {
        id: '1', invoiceNo: 'TAX-2023-00421', billId: 'INV-2023-004521',
        patientName: 'Anura Kumara Jayantha', patientId: 'DH-88291',
        issuedDate: '2023-10-25', dueDate: '2023-11-25',
        subtotal: 4500, taxRate: 18, taxAmount: 810, totalWithTax: 5310,
        status: 'ISSUED', issuedBy: 'Dr. Adrian S.',
    },
    {
        id: '2', invoiceNo: 'TAX-2023-00420', billId: 'INV-2023-004520',
        patientName: 'Dilhani Perera', patientId: 'DH-88302',
        issuedDate: '2023-10-25', dueDate: '2023-11-25',
        subtotal: 12400, taxRate: 18, taxAmount: 2232, totalWithTax: 14632,
        status: 'ISSUED', issuedBy: 'Dr. Adrian S.',
    },
    {
        id: '3', invoiceNo: 'TAX-2023-00419', billId: 'INV-2023-004519',
        patientName: 'Maithripala S.', patientId: 'DH-88411',
        issuedDate: '2023-10-24', dueDate: '2023-11-24',
        subtotal: 8500, taxRate: 18, taxAmount: 1530, totalWithTax: 10030,
        status: 'PENDING', issuedBy: 'Dr. Adrian S.',
    },
    {
        id: '4', invoiceNo: 'TAX-2023-00418', billId: 'INV-2023-004518',
        patientName: 'Shirani K.', patientId: 'DH-88450',
        issuedDate: '2023-10-24', dueDate: '2023-11-24',
        subtotal: 3200, taxRate: 18, taxAmount: 576, totalWithTax: 3776,
        status: 'ISSUED', issuedBy: 'Dr. Adrian S.',
    },
    {
        id: '5', invoiceNo: 'TAX-2023-00417', billId: 'INV-2023-004517',
        patientName: 'Kamal Bandara', patientId: 'DH-88399',
        issuedDate: '2023-10-23', dueDate: '2023-11-23',
        subtotal: 7035, taxRate: 18, taxAmount: 1266.3, totalWithTax: 8301.3,
        status: 'VOID', issuedBy: 'Admin User',
    },
    {
        id: '6', invoiceNo: 'TAX-2023-00416', billId: 'INV-2023-004516',
        patientName: 'Priyantha Rajapaksa', patientId: 'DH-88310',
        issuedDate: '2023-10-23', dueDate: '2023-11-23',
        subtotal: 5355, taxRate: 18, taxAmount: 963.9, totalWithTax: 6318.9,
        status: 'PENDING', issuedBy: 'Dr. Adrian S.',
    },
    {
        id: '7', invoiceNo: 'TAX-2023-00415', billId: 'INV-2023-004515',
        patientName: 'Sandya Fernando', patientId: 'DH-88275',
        issuedDate: '2023-10-22', dueDate: '2023-11-22',
        subtotal: 10290, taxRate: 18, taxAmount: 1852.2, totalWithTax: 12142.2,
        status: 'ISSUED', issuedBy: 'Dr. Adrian S.',
    },
    {
        id: '8', invoiceNo: 'TAX-2023-00414', billId: 'INV-2023-004514',
        patientName: 'Nirosha Wickramasinghe', patientId: 'DH-88201',
        issuedDate: '2023-10-22', dueDate: '2023-11-22',
        subtotal: 2940, taxRate: 18, taxAmount: 529.2, totalWithTax: 3469.2,
        status: 'ISSUED', issuedBy: 'Admin User',
    },
];

const PAGE_SIZE = 5;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TaxInvoicesPage() {
    const router = useRouter();

    // Access check
    if (!hasPermission('view_tax')) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
                <p className="text-gray-500 text-sm">You don't have permission to view tax invoices.</p>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    // ── Filter state ─────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
    const [startDate, setStartDate] = useState('2023-10-01');
    const [endDate, setEndDate] = useState('2023-10-25');

    const [appliedSearch, setAppliedSearch] = useState('');
    const [appliedStatus, setAppliedStatus] = useState<FilterStatus>('ALL');
    const [appliedStart, setAppliedStart] = useState('2023-10-01');
    const [appliedEnd, setAppliedEnd] = useState('2023-10-25');
    const [currentPage, setCurrentPage] = useState(1);

    const handleApply = () => {
        setAppliedSearch(searchQuery);
        setAppliedStatus(statusFilter);
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
        setCurrentPage(1);
        toast.success('Filters applied');
    };

    // ── Filtered & paginated ─────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return mockInvoices.filter((inv) => {
            const q = appliedSearch.toLowerCase();
            const matchesSearch =
                !q ||
                inv.invoiceNo.toLowerCase().includes(q) ||
                inv.billId.toLowerCase().includes(q) ||
                inv.patientName.toLowerCase().includes(q) ||
                inv.patientId.toLowerCase().includes(q);
            const matchesStatus = appliedStatus === 'ALL' || inv.status === appliedStatus;
            const date = new Date(inv.issuedDate);
            const matchesDate = date >= new Date(appliedStart) && date <= new Date(appliedEnd);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [appliedSearch, appliedStatus, appliedStart, appliedEnd]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = {
        totalIssued: mockInvoices.filter(i => i.status === 'ISSUED').length,
        totalTaxCollected: mockInvoices
            .filter(i => i.status === 'ISSUED')
            .reduce((s, i) => s + i.taxAmount, 0),
        pending: mockInvoices.filter(i => i.status === 'PENDING').length,
        voided: mockInvoices.filter(i => i.status === 'VOID').length,
    };

    const STATUS_STYLES: Record<InvoiceStatus, string> = {
        ISSUED: 'bg-green-100 text-green-800 border-green-300',
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        VOID: 'bg-gray-100 text-gray-500 border-gray-300',
    };

    const handlePrint = (invoiceNo: string) => {
        if (!hasPermission('print_invoices')) {
            toast.error('You do not have permission to print invoices.');
            return;
        }
        toast.success(`Printing ${invoiceNo}...`);
    };

    const handleExportAll = () => {
        if (!hasPermission('export_reports')) {
            toast.error('You do not have permission to export reports.');
            return;
        }
        toast.success('Tax invoice report exported successfully!');
    };

    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Tax Invoices</h1>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <Shield className="w-3 h-3 mr-1" /> Secured
                        </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Official tax invoice records • Accessed by {CURRENT_USER.name} ({CURRENT_USER.role})
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={handleExportAll}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Issued Invoices"
                    value={stats.totalIssued}
                    icon={FileText}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <StatCard
                    title="Tax Collected"
                    value={formatCurrency(stats.totalTaxCollected)}
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    iconColor="text-yellow-600"
                    iconBgColor="bg-yellow-100"
                />
                <StatCard
                    title="Voided"
                    value={stats.voided}
                    icon={AlertTriangle}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-100"
                />
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by Invoice No, Bill ID, or Patient..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">STATUS:</span>
                    <select
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                    >
                        <option value="ALL">ALL</option>
                        <option value="ISSUED">ISSUED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="VOID">VOID</option>
                    </select>
                </div>
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
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApply}>
                    <Filter className="w-4 h-4 mr-2" />
                    Apply
                </Button>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-lg border">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Bill ID</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Patient</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Issued Date</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Tax (18%)</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="text-center py-12 text-gray-400">
                                No invoices found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        paginated.map((inv) => (
                            <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 font-mono text-sm font-medium text-blue-700">{inv.invoiceNo}</td>
                                <td className="py-4 px-4 text-sm text-gray-600">{inv.billId}</td>
                                <td className="py-4 px-4">
                                    <p className="font-medium text-sm text-gray-900">{inv.patientName}</p>
                                    <p className="text-xs text-gray-400">{inv.patientId}</p>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">{inv.issuedDate}</td>
                                <td className="py-4 px-4 text-right text-sm text-gray-900">{formatCurrency(inv.subtotal)}</td>
                                <td className="py-4 px-4 text-right text-sm font-medium text-orange-600">{formatCurrency(inv.taxAmount)}</td>
                                <td className="py-4 px-4 text-right text-sm font-bold text-gray-900">{formatCurrency(inv.totalWithTax)}</td>
                                <td className="py-4 px-4 text-center">
                                    <Badge variant="outline" className={STATUS_STYLES[inv.status]}>
                                        {inv.status}
                                    </Badge>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => toast.info(`Viewing ${inv.invoiceNo}`)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-600 hover:text-gray-800"
                                            onClick={() => handlePrint(inv.invoiceNo)}
                                        >
                                            <Printer className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-600 hover:text-gray-800"
                                            onClick={() => {
                                                if (!hasPermission('export_reports')) {
                                                    toast.error('No export permission.');
                                                    return;
                                                }
                                                toast.success(`Exporting ${inv.invoiceNo}`);
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
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
                        <Button
                            variant="outline" size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
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
                        <Button
                            variant="outline" size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Security Notice ── */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Security Notice</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                                All tax invoice access is logged and monitored. Unauthorized access or modification of tax records
                                is a violation of company policy and may be subject to legal action. This session is recorded for
                                audit purposes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
