import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddClientDialog } from "./AddClientDialog"
import { ClientActionButtons } from "./ClientActionButtons"

export default async function ClientsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('dietitian_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Danışanlar</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Tüm kayıtlı danışanlarınızı bu ekrandan yönetebilirsiniz.</p>
                </div>
                <AddClientDialog />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Danışan ara..." className="pl-8 bg-background border-muted shadow-sm" />
                </div>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold">Ad Soyad</TableHead>
                            <TableHead className="font-semibold">Telefon</TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">E-posta</TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">Kayıt Tarihi</TableHead>
                            <TableHead className="text-right font-semibold">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!clients || clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <span className="text-lg">Listenizde henüz kayıtlı danışan bulunmamaktadır.</span>
                                        <span className="text-sm">Hemen yukarıdan "Yeni Ekle" butonuna tıklayarak ilk danışanınızı oluşturun.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => {
                                const formattedDate = new Date(client.created_at).toLocaleDateString('tr-TR', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                })
                                return (
                                    <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <Link href={`/dashboard/clients/${client.id}`} className="hover:underline text-primary transition-colors">
                                                {client.first_name} {client.last_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{client.phone || '-'}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{client.email || '-'}</TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{formattedDate}</TableCell>
                                        <TableCell className="text-right">
                                            <ClientActionButtons client={client} />
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
