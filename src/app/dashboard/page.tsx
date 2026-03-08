import { Card, CardContent } from "@/components/ui/card"
import { Users, CalendarCheck, ClipboardList, TrendingUp, Apple, BookOpen } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { RecentActivityLog } from "./RecentActivityLog"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Toplam Danışan
    const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('dietitian_id', user.id)

    // Aktif (Onaylanmış) Randevular
    const { count: activeAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('dietitian_id', user.id)
        .eq('status', 'confirmed')

    // Onay Bekleyen Randevular
    const { count: pendingAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('dietitian_id', user.id)
        .eq('status', 'pending')

    // Toplam Besin
    const { count: foodsCount } = await supabase
        .from('foods')
        .select('*', { count: 'exact', head: true })
        .eq('dietitian_id', user.id)

    // Toplam Tarif
    const { count: recipesCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('dietitian_id', user.id)

    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-500">
            {/* Header / Greeting */}
            <div className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Hoş Geldiniz, {user.user_metadata.first_name || 'Admin'} 👋</h2>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Simit Yazılım Panelinde bugün işler nasıl gidiyor? İşte hızlı bir özet.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card className="border-0 shadow-sm ring-1 ring-border/50 overflow-hidden relative group hover:ring-primary/50 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Toplam Danışan</p>
                                <div className="text-3xl font-bold mt-2">{clientsCount || 0}</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground gap-1">
                            Kayıtlı toplam danışan sayısı
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-border/50 overflow-hidden relative group hover:ring-blue-500/50 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Aktif Randevular</p>
                                <div className="text-3xl font-bold mt-2">{activeAppointmentsCount || 0}</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                <CalendarCheck className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground gap-1">
                            Onaylanmış randevularınız
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-border/50 overflow-hidden relative group hover:ring-amber-500/50 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Onay Bekleyenler</p>
                                <div className="text-3xl font-bold mt-2 text-amber-600">{pendingAppointmentsCount || 0}</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                <ClipboardList className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground gap-1">
                            Yeni form talepleri incelenmeyi bekliyor
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-border/50 overflow-hidden relative group hover:ring-green-500/50 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Özel Besinler</p>
                                <div className="text-3xl font-bold mt-2 text-green-600">{foodsCount || 0}</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                                <Apple className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground gap-1">
                            Veritabanına eklenenler
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-border/50 overflow-hidden relative group hover:ring-orange-500/50 transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kişisel Tarifler</p>
                                <div className="text-3xl font-bold mt-2 text-orange-600">{recipesCount || 0}</div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                                <BookOpen className="h-6 w-6 text-orange-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground gap-1">
                            Sisteme kayıtlı tarifler
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Son Aktiviteler */}
            <div className="mt-8">
                <RecentActivityLog userId={user.id} />
            </div>
        </div>
    )
}
