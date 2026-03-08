"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function addMeasurement(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const client_id = formData.get('clientId') as string
    const weight = formData.get('weight') ? Number(formData.get('weight')) : null
    const body_fat_percentage = formData.get('bodyFat') ? Number(formData.get('bodyFat')) : null
    const muscle_mass = formData.get('muscleMass') ? Number(formData.get('muscleMass')) : null
    const measurement_date = formData.get('date') as string

    if (!client_id || !measurement_date) return { error: "Danışan ve tarih zorunludur." }
    if (!weight && !body_fat_percentage && !muscle_mass) return { error: "En az bir ölçüm değeri girin." }

    const { error } = await supabase.from('client_measurements').insert({
        client_id,
        dietitian_id: user.id,
        weight,
        body_fat_percentage,
        muscle_mass,
        measurement_date
    })

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/clients/${client_id}`)
    return { success: true }
}

export async function deleteMeasurement(id: string, clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from('client_measurements')
        .delete()
        .eq('id', id)
        .eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/clients/${clientId}`)
    return { success: true }
}

export async function addNote(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const client_id = formData.get('clientId') as string
    const content = formData.get('content') as string

    if (!client_id || !content?.trim()) return { error: "Not içeriği zorunludur." }

    const { error } = await supabase.from('client_notes').insert({
        client_id,
        dietitian_id: user.id,
        content: content.trim()
    })

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/clients/${client_id}`)
    return { success: true }
}

export async function deleteNote(id: string, clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', id)
        .eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/clients/${clientId}`)
    return { success: true }
}
