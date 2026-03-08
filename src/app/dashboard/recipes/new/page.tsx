import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NewRecipeForm } from "./NewRecipeForm"

export default async function NewRecipePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // GET all foods (System AND Personal)
    const { data: foods, error } = await supabase
        .from('foods')
        .select('id, name, calories, carbohydrates, proteins, fats')
        .or(`dietitian_id.is.null,dietitian_id.eq.${user.id}`)
        .order('name', { ascending: true })

    if (error) {
        console.error("Error fetching foods:", JSON.stringify(error, null, 2))
    }

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            {/* The Form handles the whole page layout for itself */}
            <NewRecipeForm availableFoods={foods || []} />
        </div>
    )
}
