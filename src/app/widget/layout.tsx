export default function WidgetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-transparent p-4">
            {children}
        </div>
    )
}
