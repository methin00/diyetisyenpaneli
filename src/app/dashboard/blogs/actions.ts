"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
}

export async function createBlogPost(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const title = (formData.get("title") as string)?.trim()
    const excerpt = (formData.get("excerpt") as string)?.trim() || null
    const content_html = (formData.get("contentHtml") as string)?.trim()
    const is_public = formData.get("isPublic") === "true"
    const coverImage = formData.get("coverImage") as File | null

    if (!title) return { error: "Başlık zorunludur." }
    if (!content_html || content_html === "<p><br></p>" || content_html === "<br>") {
        return { error: "İçerik zorunludur." }
    }

    let cover_image_url: string | null = null

    if (coverImage && coverImage.size > 0) {
        if (!ALLOWED_IMAGE_TYPES.includes(coverImage.type)) {
            return { error: "Sadece JPG, PNG, WEBP veya GIF dosyalari yukleyebilirsiniz." }
        }
        if (coverImage.size > MAX_FILE_SIZE) {
            return { error: "Görsel boyutu 5MB'dan büyük olamaz." }
        }

        const extension = coverImage.name.split(".").pop()?.toLowerCase() || "jpg"
        const path = `${user.id}/blogs/${Date.now()}-${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
            .from("dietitian-media")
            .upload(path, coverImage, {
                contentType: coverImage.type,
                upsert: false,
            })

        if (uploadError) {
            return { error: `Görsel yuklenemedi: ${uploadError.message}` }
        }

        const { data: publicData } = supabase.storage
            .from("dietitian-media")
            .getPublicUrl(path)

        cover_image_url = publicData.publicUrl
    }

    const slugBase = slugify(title) || "blog"
    const slug = `${slugBase}-${Date.now().toString(36)}`

    const { error } = await supabase.from("blog_posts").insert({
        dietitian_id: user.id,
        title,
        slug,
        excerpt,
        content_html,
        cover_image_url,
        is_public,
        published_at: new Date().toISOString(),
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/blogs")
    return { success: true }
}

export async function updateBlogVisibility(blogId: string, isPublic: boolean) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from("blog_posts")
        .update({ is_public: isPublic })
        .eq("id", blogId)
        .eq("dietitian_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/blogs")
    return { success: true }
}

export async function deleteBlogPost(blogId: string) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", blogId)
        .eq("dietitian_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/blogs")
    return { success: true }
}

