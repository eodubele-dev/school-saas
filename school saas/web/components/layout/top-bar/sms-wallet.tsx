"use client"

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getSMSWalletBalance } from "@/lib/actions/finance"

export function SMSWalletMonitor() {
    const [balance, setBalance] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBalance = async () => {
            const { success, balance } = await getSMSWalletBalance()
            if (success) setBalance(balance)
            setLoading(false)
        }
        fetchBalance()
    }, [])

    if (loading) return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl animate-pulse">
            <div className="h-8 w-20 bg-slate-800 rounded" />
        </div>
    )

    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl">
            <div className="flex flex-col items-start">
                <p className="text-[9px] text-gray-500 font-mono uppercase leading-none mb-0.5">SMS_Wallet</p>
                <p className={`text-sm font-bold ${balance < 1000 ? 'text-red-500' : 'text-emerald-400'}`}>
                    ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
            </div>
            <button className="p-1 hover:bg-white/10 rounded-lg text-gray-400 transition-all hover:text-white">
                <Plus size={14} />
            </button>
        </div>
    )
}
