"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eraser } from "lucide-react"

interface SignaturePadProps {
    onEnd: (dataUrl: string | null) => void
}

export function SignaturePad({ onEnd }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Handle resizing
        const resize = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = 200 // Fixed height
                clear() // Clear on resize to avoid scaling artifacts
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Setup stroke
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#fff' // White stroke for dark theme

        const { offsetX, offsetY } = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(offsetX, offsetY)
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const { offsetX, offsetY } = getCoordinates(e)
        ctx.lineTo(offsetX, offsetY)
        ctx.stroke()

        if (!hasSignature) setHasSignature(true)
    }

    const stopDrawing = () => {
        if (!isDrawing) return
        setIsDrawing(false)

        const canvas = canvasRef.current
        if (canvas && hasSignature) {
            onEnd(canvas.toDataURL('image/png'))
        }
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
        onEnd(null)
    }

    const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { offsetX: 0, offsetY: 0 }

        const rect = canvas.getBoundingClientRect()
        let clientX, clientY

        if ('touches' in event) {
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
        } else {
            clientX = (event as React.MouseEvent).clientX
            clientY = (event as React.MouseEvent).clientY
        }

        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        }
    }

    return (
        <div className="space-y-2">
            <div className="border border-white/10 rounded-md overflow-hidden bg-slate-950 touch-none">
                <canvas
                    ref={canvasRef}
                    height={200}
                    className="w-full h-[200px] cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                >
                    <Eraser className="mr-2 h-4 w-4" /> Clear Signature
                </Button>
            </div>
        </div>
    )
}
