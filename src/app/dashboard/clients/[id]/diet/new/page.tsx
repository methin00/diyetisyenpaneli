import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { NewDietForm } from "./NewDietForm"

export default async function NewDietProgramPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const clientId = params.id

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Client info for Header
    const { data: client } = await supabase
        .from('clients')
        .select('first_name, last_name')
        .eq('id', clientId)
        .eq('dietitian_id', user.id)
        .single()

    if (!client) redirect('/dashboard/clients')

    // Fetch Foods & Recipes for the Selectors
    const { data: foods } = await supabase
        .from('foods')
        .select('id, name, calories, serving_size')
        .or(`dietitian_id.is.null,dietitian_id.eq.${user.id}`)
        .order('name', { ascending: true })

    const { data: recipes } = await supabase
        .from('recipes')
        .select('id, title, prep_time_minutes')
        .eq('dietitian_id', user.id)
        .order('title', { ascending: true })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <NewDietForm
                clientId={clientId}
                clientName={`${client.first_name} ${client.last_name}`}
                availableFoods={foods || []}
                availableRecipes={recipes || []}
            />
        </div>
    )
}
