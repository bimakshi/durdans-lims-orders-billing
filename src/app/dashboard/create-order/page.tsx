'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, SlidersHorizontal } from 'lucide-react';
import { formatCurrency, calculateServiceCharge, calculateTotal } from '@/constants';
import type { Patient, LabTest } from '@/types';
import { toast } from 'sonner';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockPatients: Patient[] = [
    { id: '1', patientId: 'DH-88291', fullName: 'Anura Kumara J.', age: 42, gender: 'Male', phone: '+94 77 123 4567' },
    { id: '2', patientId: 'DH-88302', fullName: 'Nilmini Perera', age: 35, gender: 'Female', phone: '+94 77 987 6543' },
    { id: '3', patientId: 'DH-77102', fullName: 'Kamala Perera', age: 58, gender: 'Female', phone: '+94 71 234 5678' },
    { id: '4', patientId: 'DH-65234', fullName: 'Rohan Fernando', age: 45, gender: 'Male', phone: '+94 76 345 6789' },
    { id: '5', patientId: 'DH-54112', fullName: 'Nimal Silva', age: 30, gender: 'Male', phone: '+94 70 456 7890' },
];

const mockTests: LabTest[] = [
    { id: '1', testCode: 'LBT-001', testName: 'Complete Blood Count (CBC)', category: 'Hematology', price: 1200 },
    { id: '2', testCode: 'LBT-042', testName: 'Lipid Profile', category: 'Biochemistry', price: 2450 },
    { id: '3', testCode: 'LBT-011', testName: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry', price: 850 },
    { id: '4', testCode: 'LBT-005', testName: 'HbA1c', category: 'Biochemistry', price: 1800 },
    { id: '5', testCode: 'LBT-023', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', price: 2200 },
    { id: '6', testCode: 'LBT-034', testName: 'Kidney Function Test (KFT)', category: 'Biochemistry', price: 1900 },
    { id: '7', testCode: 'LBT-056', testName: 'Full Blood Count (FBC)', category: 'Hematology', price: 1200 },
    { id: '8', testCode: 'LBT-067', testName: 'Urine Full Report (UFR)', category: 'Urinalysis', price: 600 },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CreateTestOrderPage() {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(mockPatients[0]);
    const [selectedTests, setSelectedTests] = useState<LabTest[]>([mockTests[0], mockTests[1], mockTests[2]]);
    const [searchQuery, setSearchQuery] = useState('');
    const [testSearchQuery, setTestSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false); // controls whether search box is active

    const subtotal = selectedTests.reduce((sum, test) => sum + test.price, 0);
    const serviceCharge = calculateServiceCharge(subtotal);
    const totalAmount = calculateTotal(subtotal, 0);

    // ── Patient search ────────────────────────────────────────────────────────
    const filteredPatients = mockPatients.filter(p =>
        searchQuery.trim() === '' ? false : (
            p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.phone.includes(searchQuery)
        )
    );

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsSearching(false);
        setSearchQuery('');
        toast.success(`Patient ${patient.fullName} selected`);
    };

    // Clicking "Change" clears the selected patient and activates search
    const handleChangePatient = () => {
        setSelectedPatient(null);
        setIsSearching(true);
        setSearchQuery('');
    };

    // ── Test toggle ───────────────────────────────────────────────────────────
    const handleTestToggle = (test: LabTest) => {
        const isSelected = selectedTests.some(t => t.id === test.id);
        if (isSelected) {
            setSelectedTests(selectedTests.filter(t => t.id !== test.id));
        } else {
            setSelectedTests([...selectedTests, test]);
        }
    };

    const filteredTests = mockTests.filter(test =>
        test.testName.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.testCode.toLowerCase().includes(testSearchQuery.toLowerCase())
    );

    // ── Create order ──────────────────────────────────────────────────────────
    const handleCreateOrder = () => {
        if (!selectedPatient) {
            toast.error('Please select a patient');
            return;
        }
        if (selectedTests.length === 0) {
            toast.error('Please select at least one test');
            return;
        }
        toast.success('Order created successfully!');
    };

    return (
        <div className="p-8">
            <PageHeader
                title="Create New Test Order"
                description="Select patient and tests to generate a laboratory order."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left column ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ── Patient Selection ── */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                <h2 className="text-lg font-semibold">Patient Selection</h2>
                            </div>

                            {/* Search box — shown when no patient selected OR after clicking Change */}
                            {(isSearching || !selectedPatient) && (
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search Patient by Name, ID, or Phone Number..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />

                                    {/* Search results dropdown */}
                                    {filteredPatients.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                            {filteredPatients.map((patient) => (
                                                <div
                                                    key={patient.id}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                    onClick={() => handleSelectPatient(patient)}
                                                >
                                                    <Avatar className="w-9 h-9">
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                                            <User className="w-4 h-4" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 text-sm">{patient.fullName}</p>
                                                        <p className="text-xs text-gray-500">{patient.patientId} • {patient.age}Y / {patient.gender} • {patient.phone}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results */}
                                    {searchQuery.trim() !== '' && filteredPatients.length === 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
                                            No patients found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selected patient card */}
                            {selectedPatient && !isSearching && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                                    <User className="w-6 h-6" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">PATIENT ID</p>
                                                <p className="font-bold text-gray-900 mb-2">{selectedPatient.patientId}</p>
                                                <p className="text-xs text-gray-500 font-medium">FULL NAME</p>
                                                <p className="font-semibold text-gray-900 mb-2">{selectedPatient.fullName}</p>
                                                <div className="flex gap-6 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">AGE / GENDER</p>
                                                        <p className="font-medium text-gray-900">{selectedPatient.age}Y / {selectedPatient.gender}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">PHONE</p>
                                                        <p className="font-medium text-gray-900">{selectedPatient.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* ✅ Change button now works */}
                                        <Button
                                            variant="link"
                                            className="text-blue-600"
                                            onClick={handleChangePatient}
                                        >
                                            Change
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Prompt when no patient selected yet */}
                            {!selectedPatient && !isSearching && (
                                <div className="border border-dashed rounded-lg p-6 text-center text-gray-400">
                                    <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">Search and select a patient above</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Test Selection ── */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                    <h2 className="text-lg font-semibold">Test Selection</h2>
                                </div>
                                <div className="relative">
                                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Filter tests..."
                                        className="pl-10 w-48"
                                        value={testSearchQuery}
                                        onChange={(e) => setTestSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase"></th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Test Code</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Test Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Category</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Price (LKR)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredTests.map((test) => (
                                        <tr key={test.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleTestToggle(test)}>
                                            <td className="py-3 px-4">
                                                <Checkbox
                                                    checked={selectedTests.some(t => t.id === test.id)}
                                                    onCheckedChange={() => handleTestToggle(test)}
                                                />
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900">{test.testCode}</td>
                                            <td className="py-3 px-4 text-gray-900">{test.testName}</td>
                                            <td className="py-3 px-4 text-gray-600">{test.category}</td>
                                            <td className="py-3 px-4 text-right font-medium text-gray-900">{test.price.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right column: Order Summary ── */}
                <div>
                    <Card className="sticky top-24">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                <h2 className="text-lg font-semibold">Order Summary</h2>
                            </div>

                            {selectedTests.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">No tests selected yet</p>
                            ) : (
                                <div className="space-y-4 mb-6">
                                    {selectedTests.map((test) => (
                                        <div key={test.id} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{test.testName}</p>
                                                <p className="text-xs text-gray-500">{test.testCode}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">{test.price.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Service Charge (5%)</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(serviceCharge)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="font-semibold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                                    onClick={handleCreateOrder}
                                    disabled={selectedTests.length === 0 || !selectedPatient}
                                >
                                    Create Order
                                </Button>
                                <Button variant="outline" className="w-full h-12">Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
