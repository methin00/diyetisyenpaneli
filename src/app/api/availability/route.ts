import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase-service"
import { resolveDietitianIdFromIdentifier } from "@/lib/site-identifier"

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const identifier =
        searchParams.get("identifier") ??
        searchParams.get("site_key") ??
        searchParams.get("dietitian_id")

    if (!identifier) {
        return NextResponse.json({ error: "Identifier is required" }, { status: 400, headers: CORS_HEADERS })
    }

    const supabase = createServiceRoleClient()
    const dietitianId = await resolveDietitianIdFromIdentifier(identifier, supabase)

    if (!dietitianId) {
        return NextResponse.json({ error: "Dietitian not found" }, { status: 404, headers: CORS_HEADERS })
    }

    const { data: availabilities, error: availError } = await supabase
        .from("availabilities")
        .select("*")
        .eq("dietitian_id", dietitianId)
        .eq("is_active", true)

    if (availError) {
        return NextResponse.json({ error: "Failed to fetch availabilities" }, { status: 500, headers: CORS_HEADERS })
    }

    const { data: formSettings } = await supabase
        .from("form_settings")
        .select("*")
        .eq("dietitian_id", dietitianId)
        .single()

    return NextResponse.json(
        {
            data: {
                dietitian_id: dietitianId,
                availabilities: availabilities || [],
                settings: formSettings || {
                    require_phone: true,
                    require_email: false,
                    custom_message: "Randevu talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz."
                }
            }
        },
        {
            headers: {
                ...CORS_HEADERS,
                "Cache-Control": "no-store"
            }
        }
    )
}
