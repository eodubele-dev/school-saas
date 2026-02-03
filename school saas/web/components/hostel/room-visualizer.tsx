"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Bed, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Bunk = {
    id: string
    label: string
    type: 'top' | 'bottom' | 'single'
    is_serviceable: boolean
    student?: { id: string, name: string, class: string } | null
}

type Room = {
    id: string
    name: string
    capacity: number
    bunks: Bunk[]
}

export function RoomVisualizer({ room, onAllocate, onVacate }: {
    room: Room,
    onAllocate: (bunkId: string) => void,
    onVacate: (bunkId: string) => void
}) {
    // We visualize bunks in pairs if possible

    return (
        <Card className="p-6 bg-slate-900 border-white/5">
            <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{room.name}</h3>
                <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                    {room.bunks.filter(b => b.student).length} / {room.capacity} Occupied
                </Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {room.bunks.map((bunk) => (
                    <div
                        key={bunk.id}
                        className={`relative p-3 rounded-lg border-2 transition-all ${bunk.student
                                ? 'bg-blue-950/30 border-blue-500/50'
                                : 'bg-slate-950/50 border-slate-700/50 hover:border-slate-500'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs uppercase font-bold text-slate-500">{bunk.label}</span>
                            <Bed className={`h-4 w-4 ${bunk.student ? 'text-blue-400' : 'text-slate-600'}`} />
                        </div>

                        {bunk.student ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                        {bunk.student.name.substring(0, 2)}
                                    </div>
                                    <p className="text-sm font-bold text-white truncate w-24">
                                        {bunk.student.name}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-400 pl-8">{bunk.student.class}</p>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onVacate(bunk.id)}
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                className="w-full h-12 border-2 border-dashed border-slate-800 text-slate-600 hover:text-white hover:border-slate-600 hover:bg-transparent"
                                onClick={() => onAllocate(bunk.id)}
                            >
                                <span className="text-xs">+ Assign</span>
                            </Button>
                        )}

                        {!bunk.is_serviceable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                                <span className="text-xs font-bold text-red-500 bg-black px-2 py-1 rounded">BROKEN</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    )
}
