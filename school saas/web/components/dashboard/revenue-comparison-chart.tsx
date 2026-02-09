import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { name: 'Lekki', collected: 52400000, debt: 8200000, rate: '86.4%' },
    { name: 'Ikeja', collected: 38150000, debt: 12400000, rate: '75.5%' },
    { name: 'VI', collected: 61900000, debt: 4100000, rate: '93.8%' },
];

const InterCampusRevenueChart = () => {
    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl col-span-2">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-2xl font-black italic uppercase text-amber-500 tracking-tighter">
                        Revenue vs. Debt Recovery
                    </h2>
                    <p className="text-gray-500 text-xs font-mono">Comparative Forensic Ledger Analysis</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold">
                        GROUP_SYNC: ACTIVE
                    </span>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={10} tickFormatter={(value) => `₦${value / 1000000}M`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: number) => `₦${value.toLocaleString()}`}
                        />
                        <Bar dataKey="collected" fill="#22D3EE" radius={[6, 6, 0, 0]} name="Collected Revenue" />
                        <Bar dataKey="debt" fill="#ef444450" radius={[6, 6, 0, 0]} name="Outstanding Debt" stroke="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 🚀 Recovery Leaders Legend */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                {data.map(campus => (
                    <div key={campus.name} className="text-center">
                        <p className="text-[10px] text-gray-600 uppercase font-mono">{campus.name}_Recovery</p>
                        <p className="text-xl font-black text-white">{campus.rate}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InterCampusRevenueChart;
