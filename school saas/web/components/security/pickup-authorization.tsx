import React from 'react';
import { ShieldCheck, UserPlus, Trash2 } from 'lucide-react';

export const PickupAuthorization = ({ data = [] }: { data?: any[] }) => {
    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight italic">Authorized Pick-up Persons</h2>
                    <p className="text-gray-500 text-sm">Designate who is permitted to collect your children</p>
                </div>
                <button className="bg-cyan-600 hover:bg-cyan-500 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all">
                    <UserPlus size={16} /> ADD_NEW_PERSON
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.length > 0 ? (
                    data.map((person) => (
                        <div key={person.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative group hover:bg-white/10 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-cyan-500/30 overflow-hidden flex items-center justify-center text-gray-500 relative">
                                {person.photo_url ? (
                                    <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-mono tracking-widest opacity-50">PHOTO_ID</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg">{person.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono italic uppercase tracking-wider mb-1">Relation: {person.relation}</p>
                                {person.is_verified && (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                        <ShieldCheck size={10} /> VERIFIED_ACCESS
                                    </span>
                                )}
                            </div>
                            <button className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <UserPlus className="mx-auto text-slate-700 mb-3" size={32} />
                        <p className="text-slate-500 text-sm">No authorized persons added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
