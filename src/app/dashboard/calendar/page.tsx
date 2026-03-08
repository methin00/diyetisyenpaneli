import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { CalendarView } from "./CalendarView"

export default async function CalendarPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('dietitian_id', user.id)
        .order('start_time', { ascending: true })

    const formattedAppointments = (appointments || []).map(app => ({
        id: app.id,
        date: app.appointment_date,
        time: app.start_time,
        clientName: app.client_name,
        status: app.status,
        attendance_status: app.attendance_status || 'unknown'
    }))

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Randevu Takvimi</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Günlük randevularınızı ve programınızı buradan takip edebilirsiniz.</p>
                </div>
            </div>

            <CalendarView appointments={formattedAppointments} />
        </div>
    )
}
