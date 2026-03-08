"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

type AttendanceStatus = "unknown" | "attended" | "not_attended"
type AvailabilityInput = {
    day_of_week: number
    start_time: string
    end_time: string
    is_active: boolean
}

export async function updateAppointmentStatus(appointmentId: string, status: "confirmed" | "cancelled") {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Giriş yapmanız gereklidir." }

    const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId)
        .eq("dietitian_id", user.id)

    if (error) {
        return { error: "İşlem sırasında bir hata oluştu." }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/calendar")
    revalidatePath("/dashboard/pending-appointments")
    return { success: true }
}

export async function updateAppointmentAttendance(appointmentId: string, attendanceStatus: AttendanceStatus) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Giriş yapmanız gereklidir." }

    const payload: { attendance_status: AttendanceStatus; attendance_marked_at: string | null } = {
        attendance_status: attendanceStatus,
        attendance_marked_at: attendanceStatus === "unknown" ? null : new Date().toISOString()
    }

    const { error } = await supabase
        .from("appointments")
        .update(payload)
        .eq("id", appointmentId)
        .eq("dietitian_id", user.id)

    if (error) {
        return { error: "Katılım durumu güncellenemedi." }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/calendar")
    revalidatePath("/dashboard/pending-appointments")
    return { success: true }
}

export async function saveAvailabilitySettings(availabilities: AvailabilityInput[]) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()
    if (!user) return { error: "Giriş yapmanız gereklidir." }

    await supabase.from("availabilities").delete().eq("dietitian_id", user.id)

    if (availabilities.length > 0) {
        const payload = availabilities.map((a) => ({
            dietitian_id: user.id,
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
            is_active: a.is_active
        }))
        const { error } = await supabase.from("availabilities").insert(payload)
        if (error) return { error: error.message }
    }

    revalidatePath("/dashboard/availability")
    return { success: true }
}

export async function saveFormSettings(settings: {
    require_phone: boolean
    require_email: boolean
    custom_message: string
}) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()
    if (!user) return { error: "Giriş yapmanız gereklidir." }

    const { error } = await supabase.from("form_settings").upsert({
        dietitian_id: user.id,
        require_phone: settings.require_phone,
        require_email: settings.require_email,
        custom_message: settings.custom_message
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/form-builder")
    return { success: true }
}


