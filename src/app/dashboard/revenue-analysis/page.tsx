'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, DollarSign, CreditCard,
    AlertTriangle, Download, Shield, Lock,
    ArrowUpRight, ArrowDownRight, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/constants';
import { toast } from 'sonner';

// ─── Role-Based Access Control ────────────────────────────────────────────────

const CURRENT_USER = {
    name: 'Dr. Adrian S.',
    role: 'Chief Registrar',
    permissions: ['view_revenue', 'export_reports', 'view_tax'],
};

function hasPermission(permission: string) {
    return CURRENT_USER.permissions.includes(permission);
}

// ─── Data Per Period ──────────────────────────────────────────────────────────

type Period = '7' | '30' | '90' | '365';

const DATA_BY_PERIOD: Record<Period, {
    chartData: { label: string; revenue: number; collections: number; outstanding: number }[];
    stats: { totalRevenue: number; totalCollections: number; outstanding: number; growth: string; collectionRate: number; transactions: number; transactionGrowth: string };
    paymentMethods: { name: string; value: number; color: string }[];
    categoryRevenue: { category: string; revenue: number; orders: number }[];
    topTests: { name: string; orders: number; revenue: number; trend: string; up: boolean }[];
}> = {
    '7': {
        chartData: [
            { label: 'Mon', revenue: 180000, collections: 160000, outstanding: 20000 },
            { label: 'Tue', revenue: 210000, collections: 195000, outstanding: 15000 },
            { label: 'Wed', revenue: 195000, collections: 180000, outstanding: 15000 },
            { label: 'Thu', revenue: 240000, collections: 220000, outstanding: 20000 },
            { label: 'Fri', revenue: 260000, collections: 235000, outstanding: 25000 },
            { label: 'Sat', revenue: 190000, collections: 175000, outstanding: 15000 },
            { label: 'Sun', revenue: 177300, collections: 115000, outstanding: 62300 },
        ],
        stats: { totalRevenue: 1452300, totalCollections: 1280000, outstanding: 172300, growth: '+14.2%', collectionRate: 88.1, transactions: 248, transactionGrowth: '+6%' },
        paymentMethods: [
            { name: 'Cash', value: 45, color: '#3b82f6' },
            { name: 'Credit Card', value: 25, color: '#10b981' },
            { name: 'Insurance', value: 20, color: '#f59e0b' },
            { name: 'Debit Card', value: 7, color: '#8b5cf6' },
            { name: 'Bank Transfer', value: 3, color: '#ec4899' },
        ],
        categoryRevenue: [
            { category: 'Biochemistry', revenue: 620000, orders: 312 },
            { category: 'Hematology', revenue: 480000, orders: 240 },
            { category: 'Urinalysis', revenue: 180000, orders: 210 },
        ],
        topTests: [
            { name: 'Complete Blood Count (CBC)', orders: 68, revenue: 81600, trend: '+12%', up: true },
            { name: 'Lipid Profile', orders: 45, revenue: 110250, trend: '+8%', up: true },
            { name: 'Fasting Blood Sugar (FBS)', orders: 58, revenue: 49300, trend: '+5%', up: true },
            { name: 'HbA1c', orders: 38, revenue: 68400, trend: '-2%', up: false },
            { name: 'Liver Function Test', orders: 29, revenue: 63800, trend: '+15%', up: true },
        ],
    },
    '30': {
        chartData: [
            { label: 'Wk 1', revenue: 820000, collections: 750000, outstanding: 70000 },
            { label: 'Wk 2', revenue: 932000, collections: 880000, outstanding: 52000 },
            { label: 'Wk 3', revenue: 901000, collections: 860000, outstanding: 41000 },
            { label: 'Wk 4', revenue: 1100000, collections: 1020000, outstanding: 80000 },
        ],
        stats: { totalRevenue: 3753000, totalCollections: 3510000, outstanding: 243000, growth: '+10.5%', collectionRate: 93.5, transactions: 856, transactionGrowth: '+10%' },
        paymentMethods: [
            { name: 'Cash', value: 42, color: '#3b82f6' },
            { name: 'Credit Card', value: 28, color: '#10b981' },
            { name: 'Insurance', value: 18, color: '#f59e0b' },
            { name: 'Debit Card', value: 8, color: '#8b5cf6' },
            { name: 'Bank Transfer', value: 4, color: '#ec4899' },
        ],
        categoryRevenue: [
            { category: 'Biochemistry', revenue: 1620000, orders: 810 },
            { category: 'Hematology', revenue: 1280000, orders: 640 },
            { category: 'Urinalysis', revenue: 480000, orders: 560 },
        ],
        topTests: [
            { name: 'Complete Blood Count (CBC)', orders: 312, revenue: 374400, trend: '+12%', up: true },
            { name: 'Lipid Profile', orders: 198, revenue: 485100, trend: '+8%', up: true },
            { name: 'Fasting Blood Sugar (FBS)', orders: 245, revenue: 208250, trend: '+5%', up: true },
            { name: 'HbA1c', orders: 167, revenue: 300600, trend: '-2%', up: false },
            { name: 'Liver Function Test', orders: 134, revenue: 294800, trend: '+15%', up: true },
        ],
    },
    '90': {
        chartData: [
            { label: 'Aug', revenue: 975000, collections: 900000, outstanding: 75000 },
            { label: 'Sep', revenue: 1230000, collections: 1150000, outstanding: 80000 },
            { label: 'Oct', revenue: 1452300, collections: 1280000, outstanding: 172300 },
        ],
        stats: { totalRevenue: 3657300, totalCollections: 3330000, outstanding: 327300, growth: '+18.2%', collectionRate: 91.1, transactions: 1056, transactionGrowth: '+8%' },
        paymentMethods: [
            { name: 'Cash', value: 38, color: '#3b82f6' },
            { name: 'Credit Card', value: 30, color: '#10b981' },
            { name: 'Insurance', value: 22, color: '#f59e0b' },
            { name: 'Debit Card', value: 6, color: '#8b5cf6' },
            { name: 'Bank Transfer', value: 4, color: '#ec4899' },
        ],
        categoryRevenue: [
            { category: 'Biochemistry', revenue: 1860000, orders: 930 },
            { category: 'Hematology', revenue: 1440000, orders: 720 },
            { category: 'Urinalysis', revenue: 540000, orders: 630 },
        ],
        topTests: [
            { name: 'Complete Blood Count (CBC)', orders: 520, revenue: 624000, trend: '+18%', up: true },
            { name: 'Lipid Profile', orders: 390, revenue: 955500, trend: '+12%', up: true },
            { name: 'Fasting Blood Sugar (FBS)', orders: 410, revenue: 348500, trend: '+9%', up: true },
            { name: 'HbA1c', orders: 280, revenue: 504000, trend: '+3%', up: true },
            { name: 'Liver Function Test', orders: 220, revenue: 484000, trend: '+20%', up: true },
        ],
    },
    '365': {
        chartData: [
            { label: 'Jan', revenue: 7200000, collections: 6500000, outstanding: 700000 },
            { label: 'Feb', revenue: 6800000, collections: 6200000, outstanding: 600000 },
            { label: 'Mar', revenue: 7500000, collections: 6900000, outstanding: 600000 },
            { label: 'Apr', revenue: 8200000, collections: 7500000, outstanding: 700000 },
            { label: 'May', revenue: 9320000, collections: 8800000, outstanding: 520000 },
            { label: 'Jun', revenue: 9010000, collections: 8600000, outstanding: 410000 },
            { label: 'Jul', revenue: 11000000, collections: 10200000, outstanding: 800000 },
            { label: 'Aug', revenue: 9750000, collections: 9000000, outstanding: 750000 },
            { label: 'Sep', revenue: 12300000, collections: 11500000, outstanding: 800000 },
            { label: 'Oct', revenue: 14523000, collections: 12800000, outstanding: 1723000 },
            { label: 'Nov', revenue: 11200000, collections: 10400000, outstanding: 800000 },
            { label: 'Dec', revenue: 13100000, collections: 12100000, outstanding: 1000000 },
        ],
        stats: { totalRevenue: 119903000, totalCollections: 110500000, outstanding: 9403000, growth: '+22.4%', collectionRate: 92.2, transactions: 12480, transactionGrowth: '+22%' },
        paymentMethods: [
            { name: 'Cash', value: 40, color: '#3b82f6' },
            { name: 'Credit Card', value: 29, color: '#10b981' },
            { name: 'Insurance', value: 20, color: '#f59e0b' },
            { name: 'Debit Card', value: 7, color: '#8b5cf6' },
            { name: 'Bank Transfer', value: 4, color: '#ec4899' },
        ],
        categoryRevenue: [
            { category: 'Biochemistry', revenue: 48000000, orders: 9800 },
            { category: 'Hematology', revenue: 38000000, orders: 7600 },
            { category: 'Urinalysis', revenue: 14000000, orders: 8200 },
        ],
        topTests: [
            { name: 'Complete Blood Count (CBC)', orders: 3840, revenue: 4608000, trend: '+22%', up: true },
            { name: 'Lipid Profile', orders: 2900, revenue: 7105000, trend: '+19%', up: true },
            { name: 'Fasting Blood Sugar (FBS)', orders: 3200, revenue: 2720000, trend: '+14%', up: true },
            { name: 'HbA1c', orders: 2100, revenue: 3780000, trend: '+11%', up: true },
            { name: 'Liver Function Test', orders: 1680, revenue: 3696000, trend: '+25%', up: true },
        ],
    },
};

const auditLog = [
    { action: 'Report Exported', user: 'Dr. Adrian S.', time: 'Oct 24, 2023 • 10:45 AM', ip: '192.168.1.45' },
    { action: 'Revenue Report Viewed', user: 'Dr. Adrian S.', time: 'Oct 24, 2023 • 09:30 AM', ip: '192.168.1.45' },
    { action: 'Date Filter Applied', user: 'Dr. Adrian S.', time: 'Oct 23, 2023 • 04:15 PM', ip: '192.168.1.45' },
    { action: 'Report Exported', user: 'Admin User', time: 'Oct 22, 2023 • 11:00 AM', ip: '192.168.1.10' },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-gray-700 mb-2">{label}</p>
                {payload.map((entry: any, i: number) => (
                    <p key={i} style={{ color: entry.color }} className="font-medium">
                        {entry.name}: {entry.value > 1000 ? `LKR ${entry.value.toLocaleString()}` : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function RevenueAnalysisPage() {
    const router = useRouter();
    const [period, setPeriod] = useState<Period>('30');
    const [showAuditLog, setShowAuditLog] = useState(false);

    // ✅ All data updates when period changes
    const { chartData, stats, paymentMethods, categoryRevenue, topTests } = DATA_BY_PERIOD[period];

    const periodLabels: Record<Period, string> = {
        '7': 'Last 7 Days',
        '30': 'Last 30 Days',
        '90': 'Last 90 Days',
        '365': 'Last 1 Year',
    };

    const yAxisFormatter = (v: number) => {
        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
        return `${v}`;
    };

    const formatStat = (v: number) =>
        v >= 1000000 ? `LKR ${(v / 1000000).toFixed(2)}M` : formatCurrency(v);

    if (!hasPermission('view_revenue')) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
                <p className="text-gray-500 text-sm">You don't have permission to view revenue reports.</p>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <Shield className="w-3 h-3 mr-1" /> Secured
                        </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">
                        {periodLabels[period]} • Accessed by {CURRENT_USER.name} ({CURRENT_USER.role})
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* ✅ Period selector */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                        {(['7', '30', '90', '365'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                    period === p
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {p === '365' ? '1Y' : `${p}D`}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Data refreshed!')}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => {
                        if (!hasPermission('export_reports')) { toast.error('No export permission.'); return; }
                        toast.success(`Revenue report (${periodLabels[period]}) exported!`);
                    }}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatStat(stats.totalRevenue)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                                    <span className="text-xs text-green-600 font-medium">{stats.growth} vs prev period</span>
                                </div>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collections</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatStat(stats.totalCollections)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-500">Rate:</span>
                                    <span className="text-xs text-green-600 font-medium">{stats.collectionRate}%</span>
                                </div>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{formatStat(stats.outstanding)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                                    <span className="text-xs text-red-500 font-medium">
                                        {((stats.outstanding / stats.totalRevenue) * 100).toFixed(1)}% of revenue
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transactions</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.transactions.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                                    <span className="text-xs text-green-600 font-medium">{stats.transactionGrowth} vs prev period</span>
                                </div>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg"><CreditCard className="w-5 h-5 text-purple-600" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Charts Row 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Revenue vs Collections</h3>
                            <span className="text-xs text-gray-400">{periodLabels[period]}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={yAxisFormatter} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
                                <Area type="monotone" dataKey="collections" name="Collections" stroke="#10b981" strokeWidth={2} fill="url(#colGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {paymentMethods.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-2">
                            {paymentMethods.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Charts Row 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Revenue by Test Category</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={categoryRevenue} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={yAxisFormatter} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                                    {categoryRevenue.map((_, index) => (
                                        <Cell key={index} fill={['#3b82f6', '#10b981', '#f59e0b'][index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Top Performing Tests</h3>
                        <div className="space-y-3">
                            {topTests.map((test, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 leading-tight">{test.name}</p>
                                            <p className="text-xs text-gray-400">{test.orders.toLocaleString()} orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(test.revenue)}</p>
                                        <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${test.up ? 'text-green-600' : 'text-red-500'}`}>
                                            {test.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {test.trend}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Audit Log ── */}
            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-600" />
                            <h3 className="font-semibold text-amber-900">Security Audit Log</h3>
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Restricted</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => setShowAuditLog(!showAuditLog)}>
                            {showAuditLog ? 'Hide' : 'View'} Log
                        </Button>
                    </div>
                    {showAuditLog ? (
                        <div className="space-y-2">
                            {auditLog.map((log, i) => (
                                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-100 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span className="font-medium text-gray-800">{log.action}</span>
                                        <span className="text-gray-400">by</span>
                                        <span className="text-gray-700">{log.user}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                                        <span>IP: {log.ip}</span>
                                        <span>{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-amber-700">{auditLog.length} events logged. Click "View Log" to see access history.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
