'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClassFeedPost {
    id: string
    class_id: string
    class_name: string
    teacher_id: string
    teacher_name: string
    title: string
    content: string
    post_date: string
    created_at: string
    attachments: Array<{
        id: string
        file_url: string
        file_type: string | null
    }>
}

/**
 * Create a new class feed post
 */
export async function createClassPost(
    classId: string,
    title: string,
    content: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get tenant ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return { success: false, error: 'Profile not found' }
        }

        // Create post
        const { data: post, error } = await supabase
            .from('class_feed_posts')
            .insert({
                tenant_id: profile.tenant_id,
                class_id: classId,
                teacher_id: user.id,
                title,
                content,
                post_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating post:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/class-feed')
        return { success: true, postId: post.id }

    } catch (error) {
        console.error('Error in createClassPost:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Upload image attachment to a post
 */
export async function uploadPostImage(
    postId: string,
    file: File
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
    const supabase = createClient()

    try {
        // Validate file
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return { success: false, error: 'File size exceeds 5MB limit' }
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed' }
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const extension = file.name.split('.').pop()
        const filename = `${postId}/${timestamp}-${randomString}.${extension}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('class-feed-images')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Error uploading file:', uploadError)
            return { success: false, error: uploadError.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('class-feed-images')
            .getPublicUrl(filename)

        // Save attachment record
        const { error: attachmentError } = await supabase
            .from('post_attachments')
            .insert({
                post_id: postId,
                file_url: publicUrl,
                file_type: file.type,
                file_size: file.size
            })

        if (attachmentError) {
            console.error('Error saving attachment:', attachmentError)
            return { success: false, error: attachmentError.message }
        }

        revalidatePath('/class-feed')
        return { success: true, fileUrl: publicUrl }

    } catch (error) {
        console.error('Error in uploadPostImage:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get class feed posts for a specific class
 */
export async function getClassFeed(
    classId: string,
    limit: number = 20
): Promise<{ success: boolean; data?: ClassFeedPost[]; error?: string }> {
    const supabase = createClient()

    try {
        const { data: posts, error } = await supabase
            .from('class_feed_posts')
            .select(`
                id,
                class_id,
                classes!inner(name),
                teacher_id,
                profiles!inner(full_name),
                title,
                content,
                post_date,
                created_at,
                post_attachments(id, file_url, file_type)
            `)
            .eq('class_id', classId)
            .order('post_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching feed:', error)
            return { success: false, error: error.message }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feedPosts: ClassFeedPost[] = (posts || []).map((post: any) => ({
            id: post.id,
            class_id: post.class_id,
            class_name: post.classes?.name || 'Unknown Class',
            teacher_id: post.teacher_id,
            teacher_name: post.profiles?.full_name || 'Unknown Teacher',
            title: post.title,
            content: post.content,
            post_date: post.post_date,
            created_at: post.created_at,
            attachments: post.post_attachments || []
        }))

        return { success: true, data: feedPosts }

    } catch (error) {
        console.error('Error in getClassFeed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get feed posts for parent (all classes their children are in)
 */
export async function getParentFeed(
    limit: number = 20
): Promise<{ success: boolean; data?: ClassFeedPost[]; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get all classes for parent's children
        const { data: students } = await supabase
            .from('students')
            .select('class_id')
            .eq('parent_id', user.id)

        if (!students || students.length === 0) {
            return { success: true, data: [] }
        }

        const classIds = students.map(s => s.class_id).filter(Boolean)

        // Get posts from all those classes
        const { data: posts, error } = await supabase
            .from('class_feed_posts')
            .select(`
                id,
                class_id,
                classes!inner(name),
                teacher_id,
                profiles!inner(full_name),
                title,
                content,
                post_date,
                created_at,
                post_attachments(id, file_url, file_type)
            `)
            .in('class_id', classIds)
            .order('post_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching parent feed:', error)
            return { success: false, error: error.message }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feedPosts: ClassFeedPost[] = (posts || []).map((post: any) => ({
            id: post.id,
            class_id: post.class_id,
            class_name: post.classes?.name || 'Unknown Class',
            teacher_id: post.teacher_id,
            teacher_name: post.profiles?.full_name || 'Unknown Teacher',
            title: post.title,
            content: post.content,
            post_date: post.post_date,
            created_at: post.created_at,
            attachments: post.post_attachments || []
        }))

        return { success: true, data: feedPosts }

    } catch (error) {
        console.error('Error in getParentFeed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Delete a class feed post
 */
export async function deleteClassPost(
    postId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Verify ownership
        const { data: post } = await supabase
            .from('class_feed_posts')
            .select('teacher_id')
            .eq('id', postId)
            .single()

        if (!post || post.teacher_id !== user.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Delete post (attachments will cascade delete)
        const { error } = await supabase
            .from('class_feed_posts')
            .delete()
            .eq('id', postId)

        if (error) {
            console.error('Error deleting post:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/class-feed')
        return { success: true }

    } catch (error) {
        console.error('Error in deleteClassPost:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
