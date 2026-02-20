'use client';

import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
    { label: 'Orders & Billing Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Create Test Order', href: '/dashboard/create-order', icon: '🛒' },
    { label: 'Bills & Payments', href: '/dashboard/bills', icon: '💳' },
    { label: 'Payment History', href: '/dashboard/payment-history', icon: '🕐' },
];

const reportItems = [
    { label: 'Revenue Analysis', href: '/dashboard/revenue-analysis', icon: '📈' },
    { label: 'Tax Invoices', href: '/dashboard/tax-invoices', icon: '📄' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Top Navigation ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">DURDANS ERP</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                        <Link href="/patient-management" className="text-gray-600 hover:text-gray-900">Patient Management</Link>
                        <Link href="/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Orders & Billing</Link>
                        <Link href="/report-dispatch" className="text-gray-600 hover:text-gray-900">Report Dispatch</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Quick search..." className="pl-10 w-64" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900">Dr. Adrian S.</p>
                                <p className="text-xs text-gray-500">Chief Registrar</p>
                            </div>
                            <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-600">AS</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* ── Sidebar ── */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">

                    {/* Billing Module */}
                    <div className="mb-3">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            BILLING MODULE
                        </h3>
                        <nav className="space-y-1">
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Reports */}
                    <div className="mt-8">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            REPORTS
                        </h3>
                        <nav className="space-y-1">
                            {reportItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 bg-gray-50">{children}</main>
            </div>
        </div>
    );
}
