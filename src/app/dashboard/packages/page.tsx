import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddPackageDialog } from "./AddPackageDialog"
import { PackageActionButtons } from "./PackageActionButtons"

export default async function PackagesPage() {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: packages } = await supabase
        .from("packages")
        .select("*")
        .eq("dietitian_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Paketler</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Seans paketlerinizi oluşturun, yayınlayın ve yönetin.
                    </p>
                </div>
                <AddPackageDialog />
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Paket</TableHead>
                            <TableHead className="text-center">Seans</TableHead>
                            <TableHead className="text-center">Fiyat</TableHead>
                            <TableHead className="text-center">Durum</TableHead>
                            <TableHead className="text-center">Web</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!packages || packages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Henüz paket yok. İlk paketinizi ekleyin.
                                </TableCell>
                            </TableRow>
                        ) : (
                            packages.map((pkg) => (
                                <TableRow key={pkg.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium">{pkg.title}</div>
                                        {pkg.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">{pkg.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">{pkg.session_count}</TableCell>
                                    <TableCell className="text-center font-semibold">
                                        {Number(pkg.price).toLocaleString("tr-TR")} {pkg.currency}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={pkg.is_active ? "default" : "outline"}>
                                            {pkg.is_active ? "Aktif" : "Pasif"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={pkg.is_public ? "secondary" : "outline"}>
                                            {pkg.is_public ? "Yayında" : "Gizli"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <PackageActionButtons
                                            packageId={pkg.id}
                                            isPublic={pkg.is_public}
                                            isActive={pkg.is_active}
                                        />
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

