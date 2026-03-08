import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service"
import { resolveDietitianIdFromIdentifier } from "@/lib/site-identifier"

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            dietitian_id,
            identifier,
            site_key,
            date,
            time,
            firstName,
            lastName,
            phone,
            email,
            notes
        } = body

        const rawIdentifier = identifier || site_key || dietitian_id

        if (!rawIdentifier || !date || !time || !firstName || !lastName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: CORS_HEADERS })
        }

        const supabase = createServiceRoleClient()
        const resolvedDietitianId = await resolveDietitianIdFromIdentifier(rawIdentifier, supabase)

        if (!resolvedDietitianId) {
            return NextResponse.json({ error: "Dietitian not found" }, { status: 404, headers: CORS_HEADERS })
        }

        const [rawHour, rawMinute] = String(time).split(":")
        const startTimeFormatted = `${String(rawHour || "00").padStart(2, "0")}:${String(rawMinute || "00").padStart(2, "0")}:00`

        const startDate = new Date(`1970-01-01T${startTimeFormatted}`)
        startDate.setMinutes(startDate.getMinutes() + 45)
        const endTimeFormatted = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}:00`

        const insertData = {
            dietitian_id: resolvedDietitianId,
            client_name: `${firstName} ${lastName}`.trim(),
            client_phone: phone || null,
            client_email: email || null,
            appointment_date: date,
            start_time: startTimeFormatted,
            end_time: endTimeFormatted,
            status: "pending",
            attendance_status: "unknown",
            notes: notes || null
        }

        const { error } = await supabase
            .from("appointments")
            .insert(insertData)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    message: "Appointment request created successfully"
                }
            },
            {
                headers: CORS_HEADERS
            }
        )
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: CORS_HEADERS })
    }
}
