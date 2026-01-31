"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClassPost, uploadPostImage } from "@/lib/actions/class-feed"

interface CreatePostFormProps {
    classId: string
    onPostCreated: () => void
}

export function CreatePostForm({ classId, onPostCreated }: CreatePostFormProps) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Clean up object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previews])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)

            // Validate size (5MB limit per file)
            const validFiles = newFiles.filter(file => {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large (max 5MB)`)
                    return false
                }
                return true
            })

            setFiles(prev => [...prev, ...validFiles])

            // Create previews
            const newPreviews = validFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))

        // Revoke the URL being removed
        URL.revokeObjectURL(previews[index])
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in all fields")
            return
        }

        setIsSubmitting(true)
        try {
            // 1. Create Post
            const result = await createClassPost(classId, title, content)

            if (!result.success || !result.postId) {
                throw new Error(result.error || "Failed to create post")
            }

            const postId = result.postId

            // 2. Upload Images (if any)
            if (files.length > 0) {
                const uploadPromises = files.map(file => uploadPostImage(postId, file))
                const uploadResults = await Promise.all(uploadPromises)

                const failedUploads = uploadResults.filter(r => !r.success)
                if (failedUploads.length > 0) {
                    toast.warning(`Post created, but ${failedUploads.length} images failed to upload`)
                }
            }

            toast.success("Post created successfully!")

            // Reset form
            setTitle("")
            setContent("")
            setFiles([])
            setPreviews([])
            onPostCreated()

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Post Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Science Fair Update"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <textarea
                            id="content"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="What's happening in class today?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Photos</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Add Photos
                            </Button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                        />

                        {/* Image Previews */}
                        {files.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                {previews.map((url, index) => (
                                    <div key={index} className="relative group rounded-md border overflow-hidden aspect-square bg-slate-100">
                                        <div className="absolute top-1 right-1 z-10">
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting || !title || !content}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                            </>
                        ) : "Post Update"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
