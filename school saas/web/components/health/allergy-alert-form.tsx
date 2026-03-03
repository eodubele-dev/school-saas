"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { addHealthAlert } from "@/lib/actions/health"

const formSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    condition: z.string().min(3, "Condition name required"),
    severity: z.enum(['Mild', 'Moderate', 'Severe', 'Critical']),
    notes: z.string().min(5, "Instructions/Notes required"),
})

export function AllergyAlertForm({ students, onSuccess }: { students: any[], onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: "",
            condition: "",
            severity: "Moderate",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        // @ts-ignore
        const result = await addHealthAlert(values)

        setIsSubmitting(false)

        if (result.success) {
            toast.success("Health alert profile created")
            form.reset()
            onSuccess()
        } else {
            toast.error(result.error || "Failed to create health alert")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-rose-200/70">Student</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="bg-rose-950/20 border-rose-500/20 text-slate-200 focus:ring-rose-500/50">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a student" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 custom-scrollbar max-h-[200px]">
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={s.id} className="hover:bg-slate-800 transition-colors cursor-pointer">
                                            <span className="font-medium text-slate-200">{s.full_name}</span>
                                            <span className="text-slate-500 text-xs ml-2 font-mono">{s.admission_number}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-rose-200/70">Condition / Allergy</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Peanut Allergy" className="bg-rose-950/20 border-rose-500/20 text-slate-200 focus:border-rose-500/50" {...field} />
                                </FormControl>
                                <FormMessage className="text-red-400 text-xs" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-rose-200/70">Level of Severity</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl className="bg-rose-950/20 border-rose-500/20 text-slate-200 focus:ring-rose-500/50">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                        <SelectItem value="Mild">Mild</SelectItem>
                                        <SelectItem value="Moderate">Moderate</SelectItem>
                                        <SelectItem value="Severe">Severe</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-red-400 text-xs" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-rose-200/70">Precautionary Notes & Instructions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="What to do in case of emergency..." className="bg-rose-950/20 border-rose-500/20 text-slate-200 focus:border-rose-500/50 min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                    )}
                />

                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] w-full sm:w-auto"
                    >
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Submit Health Profile"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
