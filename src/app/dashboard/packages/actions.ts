"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPackage(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const title = (formData.get("title") as string)?.trim()
    const description = (formData.get("description") as string)?.trim() || null
    const session_count = Number(formData.get("sessionCount") || 1)
    const price = Number(formData.get("price") || 0)
    const currency = ((formData.get("currency") as string) || "TRY").toUpperCase()
    const is_public = formData.get("isPublic") === "true"
    const is_active = formData.get("isActive") !== "false"

    if (!title) return { error: "Paket adi zorunludur." }
    if (session_count < 1) return { error: "Seans sayisi en az 1 olmalidir." }
    if (price < 0) return { error: "Fiyat negatif olamaz." }

    const { error } = await supabase.from("packages").insert({
        dietitian_id: user.id,
        title,
        description,
        session_count,
        price,
        currency,
        is_public,
        is_active
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/packages")
    return { success: true }
}

export async function updatePackageVisibility(id: string, isPublic: boolean) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from("packages")
        .update({ is_public: isPublic })
        .eq("id", id)
        .eq("dietitian_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/packages")
    revalidatePath("/dashboard/form-builder")
    return { success: true }
}

export async function updatePackageActive(id: string, isActive: boolean) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from("packages")
        .update({ is_active: isActive })
        .eq("id", id)
        .eq("dietitian_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/packages")
    return { success: true }
}

export async function deletePackage(id: string) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", id)
        .eq("dietitian_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/packages")
    revalidatePath("/dashboard/form-builder")
    return { success: true }
}

