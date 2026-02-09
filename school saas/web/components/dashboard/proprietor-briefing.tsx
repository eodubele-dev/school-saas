import InterCampusRevenueChart from './revenue-comparison-chart';
import { TrendingUp, ShieldAlert, BarChart3, Globe } from 'lucide-react';

const ProprietorBriefing = () => {
    return (
        <div className="bg-[#0A0A0B] min-h-screen p-12 text-white font-sans border-t-4 border-amber-600">
            <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-amber-500">Global Group Performance Report</h1>
                    <p className="text-gray-500 font-mono mt-2">Achievers Minds School International • Platinum Executive Briefing</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Status: SYNC_COMPLETE</p>
                    <p className="font-mono text-amber-400">ID: PROP-B5FCB81D</p>
                </div>
            </header>

            {/* 💰 Total Group Recovery Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[2.5rem] col-span-1">
                    <div className="flex items-center gap-4 mb-4">
                        <TrendingUp className="text-amber-500" size={32} />
                        <h2 className="text-xl font-bold uppercase">Total Group Recovery</h2>
                    </div>
                    <p className="text-6xl font-black tracking-tighter">86.1%</p>
                    <p className="text-gray-500 mt-4 text-sm font-mono italic">Increase of 4.2% since automated fee-nudge implementation.</p>
                </div>
                <div className="col-span-2">
                    <InterCampusRevenueChart />
                </div>
            </div>

            {/* 🛡️ Integrity Flags Section */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-8">
                    <ShieldAlert className="text-red-500" size={20} />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Critical Integrity Logs (24h)</h2>
                </div>
                <div className="space-y-4 font-mono text-sm">
                    {/* Mapping of security alerts */}
                    <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-500/5">
                        <span className="text-red-400 font-bold">[08:14] IKEJA_CAMPUS:</span> <span className="text-gray-300">GEOFENCE_BREACH (14_STUDENTS) - LATE_ENTRY_FLAG</span>
                    </div>
                    <div className="border-l-2 border-amber-500 pl-4 py-2 bg-amber-500/5">
                        <span className="text-amber-400 font-bold">[11:30] LEKKI_CAMPUS:</span> <span className="text-gray-300">AUDIT_LOCK_TRIGGERED - MANUAL_OVERRIDE_ATTEMPT (ID: ADM-004)</span>
                    </div>
                    <div className="border-l-2 border-blue-500 pl-4 py-2 bg-blue-500/5">
                        <span className="text-blue-400 font-bold">[14:45] SYSTEM_WIDE:</span> <span className="text-gray-300">GEMINI_API_LATENCY (1.2s) - REPORT_CARD_GENERATION_QUEUE</span>
                    </div>
                    <div className="border-l-2 border-green-500 pl-4 py-2 bg-green-500/5">
                        <span className="text-green-400 font-bold">[16:15] PAYMENT_GATEWAY:</span> <span className="text-gray-300">BATCH_SETTLEMENT_SUCCESS (₦2.4M) - PARENT_ENGAGEMENT_PORTAL</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProprietorBriefing;
