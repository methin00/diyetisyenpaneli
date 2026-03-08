import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AppointmentActionButtons } from "./ActionButtons"

export default async function PendingAppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: pendingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('dietitian_id', user.id)
        .eq('status', 'pending')
        .order('appointment_date', { ascending: true })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Onay Bekleyenler</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Widget üzerinden gelen yeni randevu talepleri.</p>
                </div>
            </div>

            <div className="rounded-xl border shadow-sm bg-card mt-6 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold">Danışan</TableHead>
                            <TableHead className="font-semibold">İletişim</TableHead>
                            <TableHead className="font-semibold">Tarih & Saat</TableHead>
                            <TableHead className="text-right font-semibold">İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!pendingAppointments || pendingAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    Bekleyen randevu talebi bulunmuyor.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingAppointments.map((req) => {
                                const formattedDate = new Date(req.appointment_date).toLocaleDateString('tr-TR', {
                                    day: '2-digit', month: 'long', year: 'numeric'
                                })
                                return (
                                    <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium">{req.client_name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{req.client_phone || '-'}</span>
                                                <span className="text-xs text-muted-foreground">{req.client_email || ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="mr-2 bg-background">{formattedDate}</Badge>
                                            <span className="font-medium">{req.start_time.substring(0, 5)}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AppointmentActionButtons appointmentId={req.id} />
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
