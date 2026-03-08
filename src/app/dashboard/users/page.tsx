import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddUserDialog } from "./AddUserDialog"
import { UserActionButtons } from "./UserActionButtons"
import { SiteKeyCell } from "./SiteKeyCell"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

export default async function UsersPage() {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    if (user.email !== "metin-cakmak2005@hotmail.com") {
        redirect("/dashboard")
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return (
            <div className="p-4 text-destructive border border-destructive/20 rounded bg-destructive/10">
                SUPABASE_SERVICE_ROLE_KEY bulunamadı. Lütfen .env.local dosyanızı kontrol edin.
            </div>
        )
    }

    const supabaseAdmin = createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const [{ data: usersData }, { data: siteConfigs, error: siteKeyError }] = await Promise.all([
        supabaseAdmin.auth.admin.listUsers(),
        supabaseAdmin.from("dietitian_site_configs").select("dietitian_id, public_site_key")
    ])

    const users = (usersData?.users || []).filter((u) => !(u as { deleted_at?: string | null }).deleted_at)

    const siteKeyByDietitianId = new Map<string, string>()
    if (!siteKeyError && siteConfigs) {
        for (const config of siteConfigs) {
            if (config?.dietitian_id && config?.public_site_key) {
                siteKeyByDietitianId.set(config.dietitian_id, config.public_site_key)
            }
        }
    }

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Kullanıcı Yönetimi <span className="text-sm font-normal text-muted-foreground ml-2">(Süper Admin)</span>
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Kayıtlı diyetisyenleri görüntüleyin, site keylerini yönetin ve yeni kullanıcılar oluşturun.
                    </p>
                </div>
                <AddUserDialog />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Diyetisyen ara..." className="pl-8 bg-background border-muted shadow-sm" />
                </div>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold">ID</TableHead>
                            <TableHead className="font-semibold">Ad Soyad</TableHead>
                            <TableHead className="font-semibold">E-posta</TableHead>
                            <TableHead className="hidden lg:table-cell font-semibold">Site Key</TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">Oluşturulma Tarihi</TableHead>
                            <TableHead className="text-right font-semibold">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <span className="text-lg">Kayıtlı kullanıcı bulunamadı.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => {
                                const formattedDate = new Date(u.created_at).toLocaleDateString("tr-TR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })
                                const meta = u.user_metadata || {}
                                const siteKey = siteKeyByDietitianId.get(u.id) || null

                                return (
                                    <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[100px]" title={u.id}>
                                            {u.id.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {meta.first_name || "-"} {meta.last_name || "-"}
                                            {u.email === "metin-cakmak2005@hotmail.com" && (
                                                <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold uppercase tracking-wider">
                                                    Kurucu
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <SiteKeyCell dietitianId={u.id} siteKey={siteKey} />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{formattedDate}</TableCell>
                                        <TableCell className="text-right">
                                            <UserActionButtons user={u} />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
