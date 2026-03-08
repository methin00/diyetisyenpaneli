"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function addFinancialTransaction(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const type = formData.get("type") as "income" | "expense"
    const amount = Number(formData.get("amount") || 0)
    const transaction_date = formData.get("transactionDate") as string
    const category = ((formData.get("category") as string) || "").trim() || null
    const payment_method = ((formData.get("paymentMethod") as string) || "").trim() || null
    const description = ((formData.get("description") as string) || "").trim() || null
    const client_id = ((formData.get("clientId") as string) || "").trim() || null
    const package_id = ((formData.get("packageId") as string) || "").trim() || null

    if (type !== "income" && type !== "expense") {
        return { error: "İşlem tipi gecersiz." }
    }

    if (!transaction_date) return { error: "İşlem tarihi zorunludur." }
    if (amount <= 0) return { error: "Tutar 0'dan büyük olmalidir." }

    const { error } = await supabase.from("financial_transactions").insert({
        dietitian_id: user.id,
        type,
        amount,
        transaction_date,
        category,
        payment_method,
        description,
        client_id,
        package_id
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

export async function deleteFinancialTransaction(id: string) {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return { error: "Yetkisiz işlem." }

    const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", id)
        .eq("dietitian_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/finance")
    return { success: true }
}

