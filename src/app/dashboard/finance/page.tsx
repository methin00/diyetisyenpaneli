import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddTransactionDialog } from "./AddTransactionDialog"
import { FinanceActionButtons } from "./FinanceActionButtons"

type FinancialRow = {
    id: string
    type: "income" | "expense"
    amount: number | string
    transaction_date: string
    category: string | null
    clients: { first_name: string; last_name: string } | null
    packages: { title: string } | null
}

export default async function FinancePage() {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const [{ data: transactions }, { data: clients }, { data: packages }] = await Promise.all([
        supabase
            .from("financial_transactions")
            .select("*, clients(first_name, last_name), packages(title)")
            .eq("dietitian_id", user.id)
            .order("transaction_date", { ascending: false }),
        supabase
            .from("clients")
            .select("id, first_name, last_name")
            .eq("dietitian_id", user.id)
            .order("first_name", { ascending: true }),
        supabase
            .from("packages")
            .select("id, title")
            .eq("dietitian_id", user.id)
            .order("created_at", { ascending: false }),
    ])

    const typedTransactions = (transactions || []) as FinancialRow[]

    const income = typedTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const expense = typedTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const net = income - expense

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finans</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Gelir ve giderlerinizi takip edin.</p>
                </div>
                <AddTransactionDialog clients={clients || []} packages={packages || []} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Toplam Gelir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {income.toLocaleString("tr-TR")} TRY
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Toplam Gider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {expense.toLocaleString("tr-TR")} TRY
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Net Kar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${net >= 0 ? "text-primary" : "text-destructive"}`}>
                            {net.toLocaleString("tr-TR")} TRY
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead>Tutar</TableHead>
                            <TableHead className="hidden md:table-cell">Danışan</TableHead>
                            <TableHead className="hidden md:table-cell">Paket</TableHead>
                            <TableHead className="hidden lg:table-cell">Kategori</TableHead>
                            <TableHead className="text-right">İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {typedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Henüz finans işlemi bulunmuyor.
                                </TableCell>
                            </TableRow>
                        ) : (
                            typedTransactions.map((t) => (
                                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        {new Date(t.transaction_date).toLocaleDateString("tr-TR")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={t.type === "income" ? "default" : "outline"}>
                                            {t.type === "income" ? "Gelir" : "Gider"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={t.type === "income" ? "text-emerald-600 font-semibold" : "text-destructive font-semibold"}>
                                        {t.type === "income" ? "+" : "-"}{Number(t.amount).toLocaleString("tr-TR")} TRY
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                        {t.clients ? `${t.clients.first_name} ${t.clients.last_name}` : "-"}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                        {t.packages?.title || "-"}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                                        {t.category || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <FinanceActionButtons transactionId={t.id} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

