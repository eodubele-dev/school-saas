import { PayrollDashboard } from "@/components/bursar/payroll/payroll-dashboard"

export default function BursarPayrollPage() {
    return (
        <div className="bg-slate-950 min-h-screen">
            <div className="p-4 md:p-6 lg:p-8">
                <PayrollDashboard />
            </div>
        </div>
    )
}
