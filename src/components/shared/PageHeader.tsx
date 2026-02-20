interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="text-gray-600 mt-1">{description}</p>
                )}
            </div>
            {children && <div className="flex gap-3">{children}</div>}
        </div>
    );
}