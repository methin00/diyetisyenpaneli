"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function addFood(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const name = formData.get('name') as string
    const calories = Number(formData.get('calories')) || 0
    const carbohydrates = Number(formData.get('carbohydrates')) || 0
    const proteins = Number(formData.get('proteins')) || 0
    const fats = Number(formData.get('fats')) || 0
    const serving_size = formData.get('servingSize') as string

    if (!name) return { error: "Besin adı zorunludur." }

    const { error } = await supabase.from('foods').insert({
        dietitian_id: user.id, // Dietician specific food
        name,
        calories,
        carbohydrates,
        proteins,
        fats,
        serving_size
    })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/foods')
    return { success: true }
}

export async function deleteFood(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase.from('foods').delete().eq('id', id).eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/foods')
    return { success: true }
}
