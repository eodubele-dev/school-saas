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

// Since this is MVP, we fetch the action via absolute import from previous creation
import { addMedicalIncident } from "@/lib/actions/health"

const formSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    type: z.enum(['Injury', 'Illness', 'Routine', 'Emergency']),
    title: z.string().min(3, "Title too short"),
    treatment: z.string().min(5, "Treatment notes required"),
    status: z.enum(['Back to Class', 'Sent Home', 'Under Observation']),
})

export function IncidentForm({ students, onSuccess }: { students: any[], onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: "",
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" }),
            type: "Illness",
            title: "",
            treatment: "",
            status: "Back to Class",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        // Call server action
        // @ts-ignore - Temporary ignore for server action import typing in MVP
        const result = await addMedicalIncident(values)

        setIsSubmitting(false)

        if (result.success) {
            toast.success("Incident logged successfully")
            form.reset()
            onSuccess()
        } else {
            toast.error(result.error || "Failed to log incident")
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
                            <FormLabel className="text-slate-400">Student</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-indigo-500/50">
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

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-400">Date</FormLabel>
                                <FormControl>
                                    <Input type="date" className="bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500/50" {...field} />
                                </FormControl>
                                <FormMessage className="text-red-400 text-xs" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-400">Time</FormLabel>
                                <FormControl>
                                    <Input type="time" className="bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500/50" {...field} />
                                </FormControl>
                                <FormMessage className="text-red-400 text-xs" />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-400">Incident Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-indigo-500/50">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem value="Illness">Illness</SelectItem>
                                    <SelectItem value="Injury">Injury</SelectItem>
                                    <SelectItem value="Routine">Routine</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-400">Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Headache and fever" className="bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500/50" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-400">Treatment / Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Details of treatment administered..." className="bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500/50 min-h-[80px]" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-400">Outcome Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="bg-slate-900 border-slate-800 text-slate-200 focus:ring-indigo-500/50">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select outcome" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem value="Back to Class">Back to Class</SelectItem>
                                    <SelectItem value="Sent Home">Sent Home</SelectItem>
                                    <SelectItem value="Under Observation">Under Observation</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                    )}
                />

                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] w-full sm:w-auto"
                    >
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Log Medical Incident"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
