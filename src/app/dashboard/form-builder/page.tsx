import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { FormBuilderForm } from "./FormBuilderForm"

export default async function FormBuilderPage() {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: settings } = await supabase
        .from("form_settings")
        .select("*")
        .eq("dietitian_id", user.id)
        .single()

    return <FormBuilderForm initialData={settings} dietitianId={user.id} />
}
