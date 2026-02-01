"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Loader2, Upload, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { recordManualCollection, getDebtorsList } from "@/lib/actions/collections"
import { toast } from "sonner"

export function ManualPaymentModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)

    // Search State
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

    // Form State
    const [amount, setAmount] = useState("")
    const [method, setMethod] = useState<any>("cash")
    const [ref, setRef] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleSearch = async () => {
        if (!searchQuery) return
        setSearching(true)
        const results = await getDebtorsList({ query: searchQuery })
        setSearchResults(results)
        setSearching(false)
    }

    const handleUpload = async () => {
        if (!file) return null
        setUploading(true)
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `manual/${fileName}`

        const { error: uploadError, data } = await supabase.storage
            .from('payment-evidence')
            .upload(filePath, file)

        if (uploadError) {
            toast.error("Upload failed: " + uploadError.message)
            setUploading(false)
            return null
        }

        const { data: { publicUrl } } = supabase.storage.from('payment-evidence').getPublicUrl(filePath)
        setUploading(false)
        return publicUrl
    }

    const handleSubmit = async () => {
        if (!selectedInvoice || !amount) {
            toast.error("Please select an invoice and enter amount")
            return
        }

        setLoading(true)
        const evidenceUrl = await handleUpload()

        const res = await recordManualCollection({
            studentId: selectedInvoice.studentId, // Note: backend expects UUID or admissions number? Let's check getDebtorsList map
            invoiceId: selectedInvoice.id,
            amount: Number(amount),
            method: method,
            reference: ref,
            evidenceUrl: evidenceUrl || undefined
        })

        if (res.success) {
            toast.success("Payment recorded successfully")
            setOpen(false)
            resetForm()
            onSuccess()
        } else {
            toast.error(res.error || "Failed to record payment")
        }
        setLoading(false)
    }

    const resetForm = () => {
        setSearchQuery("")
        setSearchResults([])
        setSelectedInvoice(null)
        setAmount("")
        setMethod("cash")
        setRef("")
        setFile(null)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[var(--school-accent)] text-white hover:brightness-110">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manual Payment Entry</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Record cash or bank transfers received at the office.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Student Selection */}
                    {!selectedInvoice ? (
                        <div className="space-y-2">
                            <Label className="text-slate-300">Search Student</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Name or Admission ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-950 border-white/10"
                                />
                                <Button size="icon" variant="outline" onClick={handleSearch} disabled={searching}>
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="max-h-[200px] overflow-y-auto space-y-1 mt-2">
                                {searchResults.map((inv) => (
                                    <div
                                        key={inv.id}
                                        onClick={() => {
                                            setSelectedInvoice(inv)
                                            setAmount(inv.balance.toString())
                                        }}
                                        className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                                    >
                                        <p className="text-sm font-medium">{inv.studentName}</p>
                                        <div className="flex justify-between text-[10px] text-slate-400">
                                            <span>{inv.className} • {inv.term}</span>
                                            <span className="text-rose-400">Bal: ₦{inv.balance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-emerald-400 uppercase font-bold">Selected Student</p>
                                <p className="font-medium text-white">{selectedInvoice.studentName}</p>
                                <p className="text-[10px] text-slate-400">{selectedInvoice.className} • {selectedInvoice.term}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setSelectedInvoice(null)}>
                                Change
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount (₦)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-slate-950 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="bg-slate-950 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="pos">POS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reference / Receipt #</Label>
                        <Input
                            value={ref}
                            onChange={(e) => setRef(e.target.value)}
                            placeholder="Optional"
                            className="bg-slate-950 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Evidence Upload</Label>
                        <div className="flex items-center gap-2">
                            <Label
                                htmlFor="file-upload"
                                className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                {file ? (
                                    <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="h-3 w-3" /> {file.name}</span>
                                ) : (
                                    <small className="text-slate-500 flex items-center gap-2"><Upload className="h-3 w-3" /> Click to upload proof</small>
                                )}
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedInvoice}
                        className="bg-[var(--school-accent)] text-white"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
