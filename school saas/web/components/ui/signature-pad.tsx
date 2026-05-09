"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Pen, RotateCcw, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SignaturePadProps {
    value: string | null
    onChange: (dataUrl: string | null) => void
}

export function SignaturePad({ value, onChange }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(false)
    const [mode, setMode] = useState<'preview' | 'drawing'>(value ? 'preview' : 'drawing')
    const lastPos = useRef<{ x: number; y: number } | null>(null)

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }, [])

    useEffect(() => {
        if (mode === 'drawing') {
            initCanvas()
            setHasDrawn(false)
        }
    }, [mode, initCanvas])

    const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        if ('touches' in e) {
            const touch = e.touches[0]
            return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
        }
        return {
            x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
            y: ((e as React.MouseEvent).clientY - rect.top) * scaleY
        }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        const canvas = canvasRef.current
        if (!canvas) return
        setIsDrawing(true)
        setHasDrawn(true)
        lastPos.current = getPos(e, canvas)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas || !lastPos.current) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const pos = getPos(e, canvas)
        ctx.beginPath()
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        lastPos.current = pos
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        lastPos.current = null
    }

    const clearCanvas = () => {
        initCanvas()
        setHasDrawn(false)
    }

    const saveSignature = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const dataUrl = canvas.toDataURL('image/png')
        onChange(dataUrl)
        setMode('preview')
    }

    const removeSignature = () => {
        onChange(null)
        setMode('drawing')
        setHasDrawn(false)
    }

    // --- PREVIEW MODE ---
    if (mode === 'preview' && value) {
        return (
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-full max-w-xs h-24 rounded-xl border border-white/10 bg-slate-950/60 flex items-center justify-center overflow-hidden group">
                    <img
                        src={value}
                        alt="Principal Signature"
                        className="h-full w-full object-contain p-2"
                        style={{ filter: 'invert(1) brightness(1.8)' }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                            onClick={() => setMode('drawing')}
                            className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors"
                        >
                            <Pen className="h-3 w-3" /> Re-sign
                        </button>
                        <button
                            onClick={removeSignature}
                            className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
                        >
                            <X className="h-3 w-3" /> Remove
                        </button>
                    </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <Check className="h-3 w-3" />
                    Signature saved — hover to modify
                </span>
            </div>
        )
    }

    // --- DRAWING MODE ---
    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Pen className="h-3 w-3 text-blue-400" />
                    Use mouse or finger to draw signature below
                </p>
                <button
                    onClick={clearCanvas}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="h-3 w-3" /> Clear
                </button>
            </div>

            {/* Canvas */}
            <div
                className="relative w-full rounded-xl overflow-hidden border-2 border-dashed border-slate-300/40 bg-white cursor-crosshair hover:border-blue-400/60 transition-colors"
                style={{ touchAction: 'none' }}
            >
                {/* Baseline guide */}
                <div className="absolute bottom-[30px] left-4 right-4 border-b border-dashed border-slate-300/60 pointer-events-none" />
                <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 pointer-events-none font-medium tracking-widest uppercase select-none">
                    Sign here
                </p>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={160}
                    className="w-full block"
                    style={{ height: '120px', display: 'block' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            <div className="flex gap-2 w-full">
                <Button
                    type="button"
                    onClick={saveSignature}
                    disabled={!hasDrawn}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-40"
                >
                    <Check className="h-4 w-4 mr-1.5" />
                    Save Signature
                </Button>
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setMode('preview')}
                        className="text-slate-400 hover:text-white border border-white/10"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    )
}
