import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor: string;
    iconBgColor: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export function StatCard({
                             title,
                             value,
                             icon: Icon,
                             iconColor,
                             iconBgColor,
                             trend,
                         }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <h3 className="text-2xl font-bold mt-2">{value}</h3>
                        {trend && (
                            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.value}
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${iconBgColor}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}