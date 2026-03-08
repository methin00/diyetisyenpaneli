"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

const SUPER_ADMIN_EMAIL = "metin-cakmak2005@hotmail.com"
const MEDIA_BUCKET = "dietitian-media"
const STORAGE_LIST_LIMIT = 100
const STORAGE_REMOVE_LIMIT = 100

function generateSiteKey() {
    return crypto.randomUUID().replace(/-/g, "")
}

function createAdminClient(serviceRoleKey: string) {
    return createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

function isMissingResourceError(message: string) {
    const normalized = message.toLowerCase()

    return (
        normalized.includes("bucket not found") ||
        normalized.includes("not found") ||
        normalized.includes("does not exist") ||
        normalized.includes("could not find the table")
    )
}

function isForeignKeyDeleteError(message: string) {
    const normalized = message.toLowerCase()

    return (
        normalized.includes("foreign key") ||
        normalized.includes("violates") ||
        normalized.includes("update or delete on table")
    )
}

function isRetryableDeleteError(message: string) {
    const normalized = message.toLowerCase()

    return (
        isForeignKeyDeleteError(message) ||
        normalized.includes("database error deleting user")
    )
}

async function collectStoragePathsRecursively(
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    rootPrefix: string
) {
    const queue = [rootPrefix]
    const files: string[] = []

    while (queue.length > 0) {
        const currentPrefix = queue.shift()
        if (!currentPrefix) continue

        let offset = 0

        while (true) {
            const { data, error } = await supabaseAdmin.storage
                .from(MEDIA_BUCKET)
                .list(currentPrefix, {
                    limit: STORAGE_LIST_LIMIT,
                    offset,
                    sortBy: { column: "name", order: "asc" }
                })

            if (error) {
                if (isMissingResourceError(error.message)) {
                    break
                }
                return { error: error.message, files }
            }

            if (!data || data.length === 0) {
                break
            }

            for (const entry of data) {
                const childPath = `${currentPrefix}/${entry.name}`

                if (entry.id) {
                    files.push(childPath)
                } else {
                    queue.push(childPath)
                }
            }

            if (data.length < STORAGE_LIST_LIMIT) {
                break
            }

            offset += STORAGE_LIST_LIMIT
        }
    }

    return { files }
}

async function deleteDietitianMedia(
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    dietitianId: string
) {
    const { files, error } = await collectStoragePathsRecursively(supabaseAdmin, dietitianId)

    if (error) {
        return `Medya dosyaları listelenemedi: ${error}`
    }

    if (!files || files.length === 0) {
        return null
    }

    for (let i = 0; i < files.length; i += STORAGE_REMOVE_LIMIT) {
        const chunk = files.slice(i, i + STORAGE_REMOVE_LIMIT)
        const { error: removeError } = await supabaseAdmin.storage.from(MEDIA_BUCKET).remove(chunk)

        if (removeError) {
            return `Medya dosyaları silinemedi: ${removeError.message}`
        }
    }

    return null
}

async function deleteByDietitianId(
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    tableName: string,
    dietitianId: string
) {
    const { error } = await supabaseAdmin
        .from(tableName)
        .delete()
        .eq("dietitian_id", dietitianId)

    if (!error || isMissingResourceError(error.message)) {
        return null
    }

    return `${tableName}: ${error.message}`
}

async function cleanupDietitianData(
    supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
    dietitianId: string
) {
    const tableOrder = [
        "client_measurements",
        "client_notes",
        "appointments",
        "financial_transactions",
        "blog_posts",
        "availabilities",
        "form_settings",
        "diet_programs",
        "recipes",
        "foods",
        "packages",
        "clients",
        "dietitian_site_configs",
    ]

    for (const tableName of tableOrder) {
        const tableDeleteError = await deleteByDietitianId(supabaseAdmin, tableName, dietitianId)
        if (tableDeleteError) {
            return tableDeleteError
        }
    }

    const { error: deleteDietitianError } = await supabaseAdmin
        .from("dietitians")
        .delete()
        .eq("id", dietitianId)

    if (deleteDietitianError && !isMissingResourceError(deleteDietitianError.message)) {
        return `dietitians: ${deleteDietitianError.message}`
    }

    return null
}

export async function addDietitian(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        return { error: "Yetkisiz işlem." }
    }

    const first_name = formData.get("firstName") as string
    const last_name = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!first_name || !last_name || !email || !password) {
        return { error: "Lütfen tüm alanları doldurun." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: "Sistemde SUPABASE_SERVICE_ROLE_KEY eksik." }
    }

    const supabaseAdmin = createAdminClient(serviceRoleKey)

    const { error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            first_name,
            last_name
        }
    })

    if (createUserError) return { error: createUserError.message }

    revalidatePath("/dashboard/users")
    return { success: true }
}

export async function deleteDietitian(id: string) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        return { error: "Yetkisiz işlem." }
    }

    if (user.id === id) {
        return { error: "Kendinizi silemezsiniz." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: "Sistemde SUPABASE_SERVICE_ROLE_KEY eksik." }
    }

    const supabaseAdmin = createAdminClient(serviceRoleKey)

    const mediaDeleteError = await deleteDietitianMedia(supabaseAdmin, id)
    if (mediaDeleteError) {
        return { error: mediaDeleteError }
    }

    let { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error && isRetryableDeleteError(error.message)) {
        const cleanupError = await cleanupDietitianData(supabaseAdmin, id)
        if (cleanupError) {
            return { error: `Kullanıcı silinemedi: ${cleanupError}` }
        }

        const retryResult = await supabaseAdmin.auth.admin.deleteUser(id)
        error = retryResult.error
    }

    if (error && isRetryableDeleteError(error.message)) {
        const softDeleteResult = await supabaseAdmin.auth.admin.deleteUser(id, true)
        error = softDeleteResult.error
    }

    if (error && !isMissingResourceError(error.message)) {
        return { error: error.message }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
}

export async function generateDietitianSiteKey(dietitianId: string) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        return { error: "Yetkisiz işlem." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: "Sistemde SUPABASE_SERVICE_ROLE_KEY eksik." }
    }

    const supabaseAdmin = createAdminClient(serviceRoleKey)

    const newSiteKey = generateSiteKey()

    const { error } = await supabaseAdmin
        .from("dietitian_site_configs")
        .upsert({
            dietitian_id: dietitianId,
            public_site_key: newSiteKey
        })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/users")
    revalidatePath("/dashboard/form-builder")
    return { success: true, siteKey: newSiteKey }
}
