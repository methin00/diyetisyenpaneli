import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AvailabilityForm } from "./AvailabilityForm"

export default async function AvailabilityPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: availabilities } = await supabase
        .from('availabilities')
        .select('*')
        .eq('dietitian_id', user.id)

    return <AvailabilityForm initialData={availabilities || []} />
}
