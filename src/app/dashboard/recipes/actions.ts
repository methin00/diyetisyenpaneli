"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createRecipe(formData: FormData, ingredients: { foodId: string, amount: number, unit: string }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const instructions = formData.get('instructions') as string
    const prep_time_minutes = Number(formData.get('prepTime')) || null
    const is_public = formData.get('isPublic') === 'true'

    if (!title) return { error: "Tarif adı zorunludur." }

    // 1. Insert Recipe
    const { data: recipe, error: recipeError } = await supabase.from('recipes').insert({
        dietitian_id: user.id,
        title,
        description,
        instructions,
        prep_time_minutes,
        is_public,
    }).select().single()

    if (recipeError || !recipe) return { error: recipeError?.message || "Tarif oluşturulamadı" }

    // 2. Insert Ingredients
    if (ingredients && ingredients.length > 0) {
        const ingredientsToInsert = ingredients.map(ing => ({
            recipe_id: recipe.id,
            food_id: ing.foodId,
            amount: ing.amount,
            unit: ing.unit
        }))

        const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(ingredientsToInsert)
        if (ingredientsError) {
            // Rollback: if ingredients fail, delete the recipe (Since it's a simple app, we can do manual rollback)
            await supabase.from('recipes').delete().eq('id', recipe.id)
            return { error: `Malzemeler eklenirken hata: ${ingredientsError.message}` }
        }
    }

    revalidatePath('/dashboard/recipes')
    return { success: true, recipeId: recipe.id }
}

export async function deleteRecipe(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase.from('recipes').delete().eq('id', id).eq('dietitian_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/recipes')
    return { success: true }
}
