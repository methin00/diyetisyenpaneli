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
    const { searchParams, origin } = new URL(request.url)
    const siteKey = searchParams.get("site_key")

    if (!siteKey) {
        return NextResponse.json({ error: "site_key is required" }, { status: 400, headers: CORS_HEADERS })
    }

    const supabase = createServiceRoleClient()
    const dietitianId = await resolveDietitianIdFromIdentifier(siteKey, supabase)

    if (!dietitianId) {
        return NextResponse.json({ error: "Invalid site key" }, { status: 404, headers: CORS_HEADERS })
    }

    const [{ data: dietitian }, { data: settings }, { data: availabilities }, { data: recipes }, { data: blogs }, { data: packages }] = await Promise.all([
        supabase
            .from("dietitians")
            .select("id, first_name, last_name, title")
            .eq("id", dietitianId)
            .single(),
        supabase
            .from("form_settings")
            .select("require_phone, require_email, custom_message")
            .eq("dietitian_id", dietitianId)
            .single(),
        supabase
            .from("availabilities")
            .select("day_of_week, start_time, end_time, is_active")
            .eq("dietitian_id", dietitianId)
            .eq("is_active", true)
            .order("day_of_week", { ascending: true }),
        supabase
            .from("recipes")
            .select("id, title, description, instructions, prep_time_minutes, image_url, created_at")
            .eq("dietitian_id", dietitianId)
            .eq("is_public", true)
            .order("created_at", { ascending: false }),
        supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt, content_html, cover_image_url, published_at, created_at")
            .eq("dietitian_id", dietitianId)
            .eq("is_public", true)
            .order("published_at", { ascending: false }),
        supabase
            .from("packages")
            .select("id, title, description, session_count, price, currency, created_at")
            .eq("dietitian_id", dietitianId)
            .eq("is_public", true)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
    ])

    const payload = {
        key: siteKey,
        dietitian: dietitian || null,
        appointment_form: {
            widget_url: `${origin}/widget/${siteKey}`,
            availability_endpoint: `${origin}/api/availability?identifier=${siteKey}`,
            create_appointment_endpoint: `${origin}/api/appointment`,
            settings: settings || {
                require_phone: true,
                require_email: false,
                custom_message: "Randevu talebiniz alındı."
            },
            availabilities: availabilities || []
        },
        packages: packages || [],
        recipes: recipes || [],
        blogs: blogs || [],
        synced_at: new Date().toISOString()
    }

    return NextResponse.json(payload, {
        headers: {
            ...CORS_HEADERS,
            "Cache-Control": "no-store"
        }
    })
}
