import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createLessonPlan } from "@/lib/actions/teacher"

export default function CreateLessonPage() {
    async function handleCreate(formData: FormData) {
        'use server'
        await createLessonPlan(formData)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link href="/lesson-plans" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Lesson Plans
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
                <p className="text-muted-foreground">Plan your upcoming class session.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Lesson Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Introduction to Alegbra" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="e.g. Mathematics" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" name="date" type="date" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Lesson Content / Notes</Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="Describe the lesson plan, objectives, and activities..."
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg">Save Lesson Plan</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
