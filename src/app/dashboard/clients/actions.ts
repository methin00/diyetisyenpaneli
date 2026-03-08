"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function addClient(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const first_name = formData.get('firstName') as string
    const last_name = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const notes = formData.get('notes') as string

    if (!first_name || !last_name) return { error: "Ad ve Soyad zorunludur." }

    const { error } = await supabase.from('clients').insert({
        dietitian_id: user.id,
        first_name,
        last_name,
        email,
        phone,
        notes
    })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function editClient(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const first_name = formData.get('firstName') as string
    const last_name = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const notes = formData.get('notes') as string

    if (!first_name || !last_name) return { error: "Ad ve Soyad zorunludur." }

    const { error } = await supabase.from('clients').update({
        first_name,
        last_name,
        email,
        phone,
        notes
    }).eq('id', id).eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/clients')
    revalidatePath(`/dashboard/clients/${id}`)
    return { success: true }
}

export async function deleteClient(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase.from('clients').delete().eq('id', id).eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/clients')
    return { success: true }
}
