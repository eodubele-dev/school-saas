"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getClassFeed, deleteClassPost, type ClassFeedPost } from "@/lib/actions/class-feed"

interface FeedListProps {
    classId: string
    refreshTrigger: number // Update this number to trigger a refresh
}

export function FeedList({ classId, refreshTrigger }: FeedListProps) {
    const [posts, setPosts] = useState<ClassFeedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchPosts = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getClassFeed(classId)
            if (result.success && result.data) {
                setPosts(result.data)
            } else {
                toast.error("Failed to load feed")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [classId])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts, refreshTrigger])

    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return

        setDeletingId(postId)
        try {
            const result = await deleteClassPost(postId)
            if (result.success) {
                toast.success("Post deleted")
                setPosts(prev => prev.filter(p => p.id !== postId))
            } else {
                toast.error(result.error || "Failed to delete post")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setDeletingId(null)
        }
    }

    if (loading && posts.length === 0) {
        return <div className="text-center py-8 text-slate-500">Loading updates...</div>
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                <p className="text-slate-500">No updates yet. Be the first to post!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{post.teacher_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base">{post.title}</CardTitle>
                                <CardDescription>
                                    {post.teacher_name} • {format(new Date(post.created_at), "MMM d, yyyy h:mm a")}
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="whitespace-pre-wrap text-sm text-slate-700">
                            {post.content}
                        </div>

                        {/* Image Grid */}
                        {post.attachments && post.attachments.length > 0 && (
                            <div className={`grid gap-2 ${post.attachments.length === 1 ? 'grid-cols-1' :
                                post.attachments.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
                                }`}>
                                {post.attachments.map(att => (
                                    <div key={att.id} className="rounded-md overflow-hidden bg-slate-100 border relative aspect-video">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={att.file_url}
                                            alt="Attachment"
                                            className="w-full h-full object-cover transition-transform hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
