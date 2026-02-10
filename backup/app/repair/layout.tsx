import { Wrench } from "lucide-react";

export default function RepairLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Mobile-friendly Header */}
            <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2 max-w-md mx-auto">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Canyfix</h1>
                        <p className="text-[10px] text-slate-300 font-medium tracking-wide uppercase">Home Service Partner</p>
                    </div>
                </div>
            </header>

            {/* Main Content Area - constrained width for mobile feel on desktop */}
            <main className="max-w-md mx-auto min-h-[calc(100vh-64px)] bg-slate-50 relative">
                {children}
            </main>
        </div>
    );
}
