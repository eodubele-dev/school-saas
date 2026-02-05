'use client'

import React from 'react'
import { Download, MessageSquare } from 'lucide-react'

interface SMSTransaction {
    id: string
    parentName: string
    phone: string
    type: string
    status: 'Delivered' | 'Pending' | 'Failed'
    cost: number
    timestamp: string
}

interface SMSTransactionWidgetProps {
    transactions: SMSTransaction[]
}

/**
 * SMSTransactionWidget Component
 * Implements the "Forensic Ledger" for institutional communication tracking.
 * Provides line-by-line accountability for every SMS sent from the wallet.
 */
export function SMSTransactionWidget({ transactions }: SMSTransactionWidgetProps) {
    const total24h = transactions.reduce((sum, tx) => sum + tx.cost, 0)

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg tracking-tight">Communication Ledger</h3>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Forensic SMS Audit</p>
                    </div>
                </div>
                <button className="text-[10px] font-mono text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg hover:bg-cyan-400/10 transition-all uppercase tracking-widest flex items-center gap-2">
                    <Download className="h-3 w-3" />
                    Export_CSV
                </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0A0A0B] text-[10px] font-mono text-slate-500 uppercase tracking-widest z-10">
                        <tr>
                            <th className="pb-3 px-2 font-bold">Recipient</th>
                            <th className="pb-3 px-2 text-center font-bold">Status</th>
                            <th className="pb-3 px-2 text-right font-bold">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-2">
                                        <p className="text-white font-medium text-sm">{tx.parentName}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                            {tx.phone} <span className="opacity-30">//</span> {tx.type}
                                        </p>
                                    </td>
                                    <td className="py-4 px-2 text-center">
                                        <span className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${tx.status === 'Delivered'
                                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                : tx.status === 'Pending'
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2 text-right font-mono text-white/80 text-sm">
                                        -₦{tx.cost.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="py-12 text-center">
                                    <MessageSquare className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">No SMS transactions recorded</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System_Verified_Log</p>
                <p className="text-xs text-white">
                    Total Spent (24h): <span className="font-bold text-cyan-400">₦{total24h.toFixed(2)}</span>
                </p>
            </div>
        </div>
    )
}
