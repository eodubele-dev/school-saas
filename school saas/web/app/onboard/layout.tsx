export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="h-16 border-b bg-white flex items-center justify-between px-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">BH</span>
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">Blue-Horizon</span>
                </div>
                <div className="text-sm text-slate-500">
                    School Setup Wizard
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-8">
                {children}
            </main>
        </div>
    )
}
