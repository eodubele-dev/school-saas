"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processPastQuestionsPdf } from "@/lib/actions/cbt-upload"
import { toast } from "sonner"
import { Upload, Loader2, FileText } from "lucide-react"

export function QuestionUploader() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<{ count: number } | null>(null)

    const handleUpload = async (formData: FormData) => {
        setLoading(true)
        setStats(null)

        try {
            if (!file) {
                toast.error("Please select a PDF file")
                return
            }

            formData.set("file", file)
            const result = await processPastQuestionsPdf(formData)

            if (result.success) {
                toast.success(`Successfully extracted ${result.count} questions!`)
                setStats({ count: result.count || 0 })
                setFile(null)
            } else {
                toast.error(result.error as string)
            }
        } catch {
            toast.error("Enhanced generation failed, falling back to basic parsing")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Upload Past Questions (PDF)</CardTitle>
                <CardDescription>
                    Upload a PDF exam paper. Gemini AI will extract questions, options, and generate explanations automatically.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select name="subject" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Physics">Physics</SelectItem>
                                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                                    <SelectItem value="Biology">Biology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Exam Body</Label>
                            <Select name="examType" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Exam" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WAEC">WAEC</SelectItem>
                                    <SelectItem value="JAMB">JAMB</SelectItem>
                                    <SelectItem value="NECO">NECO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" name="year" placeholder="2023" min="2000" max="2030" required />
                    </div>

                    <div className="space-y-2">
                        <Label>PDF File</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-center">
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                id="pdf-upload"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <Label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {file ? file.name : "Click to select parsed PDF"}
                                </span>
                            </Label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !file}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                AI Parsing in Progress...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Parse with Gemini
                            </>
                        )}
                    </Button>

                    {stats && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm text-center">
                            Success! Added {stats.count} new questions to the database.
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
