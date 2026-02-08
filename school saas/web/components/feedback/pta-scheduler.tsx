"use client"

import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
}

import { bookPTASlot } from "@/lib/actions/platinum";

export const PTAScheduler = ({ slots = [], studentId }: { slots?: any[], studentId?: string }) => {
    const [selectedDate, setSelectedDate] = useState<number>(24); // Ideally dynamic
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBooked, setIsBooked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const activeSlots = slots && slots.length > 0 ? slots : [];

    const handleBook = async () => {
        if (!selectedSlot || !studentId) return;
        setIsLoading(true);
        try {
            const result = await bookPTASlot(selectedSlot, studentId, 'general_inquiry');
            if (result.success) {
                setIsBooked(true);
                setTimeout(() => {
                    setIsBooked(false);
                    setSelectedSlot(null);
                }, 3000);
            } else {
                console.error("Booking failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                        <Users className="text-purple-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">PTA Scheduler</h2>
                        <p className="text-slate-500 text-xs">Book 1-on-1 sessions</p>
                    </div>
                </div>
            </div>

            {/* Date Scroller */}
            <div className="flex items-center justify-between mb-6 bg-white/5 p-2 rounded-xl border border-white/5">
                <button className="p-1 hover:bg-white/10 rounded-lg text-slate-400"><ChevronLeft size={16} /></button>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {[22, 23, 24, 25, 26].map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "flex flex-col items-center justify-center w-12 h-14 rounded-lg transition-all border",
                                selectedDate === day
                                    ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                    : "border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300"
                            )}
                        >
                            <span className="text-[9px] uppercase font-bold">Oct</span>
                            <span className="text-lg font-black leading-none">{day}</span>
                        </button>
                    ))}
                </div>
                <button className="p-1 hover:bg-white/10 rounded-lg text-slate-400"><ChevronRight size={16} /></button>
            </div>

            {!isBooked ? (
                <>
                    {/* Time Slots */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {activeSlots.length > 0 ? (
                            activeSlots.map((slot) => (
                                <button
                                    key={slot.id}
                                    disabled={!slot.is_available}
                                    onClick={() => setSelectedSlot(slot.id)}
                                    className={cn(
                                        "py-2 rounded-lg text-xs font-mono font-bold transition-all border",
                                        !slot.is_available
                                            ? "opacity-30 cursor-not-allowed bg-white/5 border-transparent text-slate-500 decoration-slate-500 line-through"
                                            : selectedSlot === slot.id
                                                ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105"
                                                : "bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400"
                                    )}
                                >
                                    {new Date(slot.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </button>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-4 text-slate-500 text-xs italic">
                                No slots available for this date.
                            </div>
                        )}
                    </div>

                    {/* Booking Action */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-black">
                                MR
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Mr. A. Ibrahim</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Mathematics & Logic</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-black/20 p-2 rounded-lg">
                            <Video size={12} className="text-purple-400" />
                            <span>Virtual Meeting • Google Meet Link will be emailed</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={!selectedSlot || isLoading}
                        className={cn(
                            "w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
                            selectedSlot && !isLoading
                                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                                : "bg-white/5 text-slate-600 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? <span className="animate-pulse">Booking...</span> : <><Clock size={14} /> Confirm Booking</>}
                    </button>
                </>
            ) : (
                <div className="text-center py-8 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">Slot Confirmed!</h3>
                    <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                        Your meeting with Mr. Ibrahim is set for <span className="text-emerald-400 font-bold">10:00 AM</span> on <span className="text-emerald-400 font-bold">Oct 24</span>.
                    </p>
                </div>
            )}
        </div>
    );
};
