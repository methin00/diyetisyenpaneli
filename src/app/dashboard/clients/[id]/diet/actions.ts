"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createDietProgram(
    clientId: string,
    formData: FormData,
    meals: {
        dayOfWeek: number | null,
        mealTime: string,
        foodId: string | null,
        recipeId: string | null,
        amount: number | null,
        notes: string | null
    }[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const title = formData.get('title') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const notes = formData.get('notes') as string

    if (!title) return { error: "Program adı zorunludur." }

    // 1. Insert Diet Program
    const { data: program, error: programError } = await supabase.from('diet_programs').insert({
        dietitian_id: user.id,
        client_id: clientId,
        title,
        start_date: startDate || null,
        end_date: endDate || null,
        notes: notes || null,
    }).select().single()

    if (programError || !program) return { error: programError?.message || "Program oluşturulamadı" }

    // 2. Insert Meals
    if (meals && meals.length > 0) {
        // filter out completely empty meals (no food, no recipe, no notes)
        const validMeals = meals.filter(m => m.foodId || m.recipeId || m.notes)

        if (validMeals.length > 0) {
            const mealsToInsert = validMeals.map(meal => ({
                diet_program_id: program.id,
                day_of_week: meal.dayOfWeek,
                meal_time: meal.mealTime,
                food_id: meal.foodId || null,
                recipe_id: meal.recipeId || null,
                amount: meal.amount || null,
                notes: meal.notes || null,
            }))

            const { error: mealsError } = await supabase.from('diet_program_meals').insert(mealsToInsert)

            if (mealsError) {
                await supabase.from('diet_programs').delete().eq('id', program.id)
                return { error: `Öğünler eklenirken hata: ${mealsError.message}. Eksik veya hatalı bilgi girildi.` }
            }
        }
    }

    revalidatePath(`/dashboard/clients/${clientId}`)
    return { success: true, programId: program.id }
}

export async function deleteDietProgram(programId: string, clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase.from('diet_programs').delete()
        .eq('id', programId)
        .eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/clients/${clientId}`)
    return { success: true }
}
