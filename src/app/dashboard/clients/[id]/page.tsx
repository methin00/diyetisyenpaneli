import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { VitalsChart } from "./VitalsChart"
import { Mail, Phone, FileText, ArrowLeft, CalendarDays, Weight, Droplets, Dumbbell, Plus } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddNoteDialog, AddMeasurementDialog, Timeline } from "./ClientDetailComponents"
import { Button } from "@/components/ui/button"

export default async function ClientDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch client
    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .eq('dietitian_id', user.id)
        .single()

    if (!client) {
        return <div className="p-8 text-center text-muted-foreground">Danışan bulunamadı.</div>
    }

    // Fetch measurements
    const { data: measurements } = await supabase
        .from('client_measurements')
        .select('*')
        .eq('client_id', client.id)
        .order('measurement_date', { ascending: true })

    // Fetch notes
    const { data: notes } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

    // Fetch Diet Programs
    const { data: dietPrograms } = await supabase
        .from('diet_programs')
        .select('*, diet_program_meals(id)')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

    // Format data for Recharts
    const vitalsData = (measurements || []).map(m => ({
        date: new Date(m.measurement_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        weight: m.weight,
        fat: m.body_fat_percentage,
        muscle: m.muscle_mass,
    }))

    // Calculate latest stats and differences
    let latestWeight = 0, latestFat = 0, latestMuscle = 0
    let weightDiff = 0, fatDiff = 0, muscleDiff = 0

    if (measurements && measurements.length > 0) {
        const latest = measurements[measurements.length - 1]
        latestWeight = latest.weight
        latestFat = latest.body_fat_percentage
        latestMuscle = latest.muscle_mass

        if (measurements.length > 1) {
            const previous = measurements[measurements.length - 2]
            weightDiff = Number((latest.weight - previous.weight).toFixed(1))
            fatDiff = Number((latest.body_fat_percentage - previous.body_fat_percentage).toFixed(1))
            muscleDiff = Number((latest.muscle_mass - previous.muscle_mass).toFixed(1))
        }
    }

    // Build timeline items (measurements + notes merged, sorted by date desc)
    const timelineItems = [
        ...(measurements || []).map(m => ({
            id: m.id,
            type: 'measurement' as const,
            date: m.measurement_date,
            data: m,
        })),
        ...(notes || []).map(n => ({
            id: n.id,
            type: 'note' as const,
            date: n.created_at,
            data: n,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const joinDate = new Date(client.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/clients" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{client.first_name} {client.last_name}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Kayıt: {joinDate}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <AddNoteDialog clientId={client.id} />
                    <AddMeasurementDialog clientId={client.id} />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Genel Bakış</TabsTrigger>
                    <TabsTrigger value="diet" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Diyet Programları</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500 pt-2 border-none">
                    {/* Client Info + Stats Row */}
                    <div className="grid gap-4 md:grid-cols-4">
                        {/* Contact Info Card */}
                        <Card className="shadow-sm border-0 ring-1 ring-border/50 md:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">İletişim</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm truncate">{client.email || 'Belirtilmemiş'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm">{client.phone || 'Belirtilmemiş'}</span>
                                </div>
                                {client.notes && (
                                    <div className="flex items-start gap-3 pt-2 border-t">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0 mt-0.5">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm text-muted-foreground leading-relaxed">{client.notes}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Cards */}
                        <Card className="shadow-sm border-0 ring-1 ring-border/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <Weight className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Son Kilo</span>
                                </div>
                                <div className="text-3xl font-bold">{latestWeight ? `${latestWeight}` : '-'} <span className="text-base font-normal text-muted-foreground">kg</span></div>
                                {measurements && measurements.length > 1 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        <span className={weightDiff <= 0 ? "text-emerald-500 font-semibold" : "text-destructive font-semibold"}>
                                            {weightDiff > 0 ? '+' : ''}{weightDiff} kg
                                        </span> önceki ölçüme göre
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-0 ring-1 ring-border/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                                        <Droplets className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Yağ Oranı</span>
                                </div>
                                <div className="text-3xl font-bold">{latestFat ? `%${latestFat}` : '-'}</div>
                                {measurements && measurements.length > 1 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        <span className={fatDiff <= 0 ? "text-emerald-500 font-semibold" : "text-destructive font-semibold"}>
                                            {fatDiff > 0 ? '+' : ''}%{fatDiff}
                                        </span> önceki ölçüme göre
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-0 ring-1 ring-border/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Dumbbell className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Kas Kütlesi</span>
                                </div>
                                <div className="text-3xl font-bold">{latestMuscle ? `${latestMuscle}` : '-'} <span className="text-base font-normal text-muted-foreground">kg</span></div>
                                {measurements && measurements.length > 1 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        <span className={muscleDiff >= 0 ? "text-emerald-500 font-semibold" : "text-destructive font-semibold"}>
                                            {muscleDiff > 0 ? '+' : ''}{muscleDiff} kg
                                        </span> önceki ölçüme göre
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart + Timeline Row */}
                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Chart */}
                        <Card className="shadow-sm border-0 ring-1 ring-border/50 lg:col-span-3">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Gelişim Grafiği</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <VitalsChart data={vitalsData} />
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="shadow-sm border-0 ring-1 ring-border/50 lg:col-span-2 max-h-[550px] flex flex-col">
                            <CardHeader className="pb-2 shrink-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    Zaman Çizelgesi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto pr-2">
                                <Timeline items={timelineItems} clientId={client.id} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="diet" className="space-y-6 animate-in fade-in duration-500 pt-2 border-none">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h3 className="text-xl font-semibold">Diyet Programları</h3>
                            <p className="text-sm text-muted-foreground">{client.first_name} için hazırlanmış tüm programlar.</p>
                        </div>
                        <Link href={`/dashboard/clients/${client.id}/diet/new`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 gap-2">
                            <Plus className="h-4 w-4" />
                            Yeni Program
                        </Link>
                    </div>

                    {!dietPrograms || dietPrograms.length === 0 ? (
                        <Card className="shadow-sm border-0 ring-1 ring-border/50 bg-muted/30">
                            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Diyet Programı Bulunmuyor</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Bu danışana henüz bir diyet programı atanmamış. Hemen yeni bir program oluşturarak süreci başlatın.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {dietPrograms.map((prog) => {
                                const startDate = prog.start_date ? new Date(prog.start_date).toLocaleDateString('tr-TR') : '-';
                                const endDate = prog.end_date ? new Date(prog.end_date).toLocaleDateString('tr-TR') : '-';

                                return (
                                    <Card key={prog.id} className="shadow-sm border-0 ring-1 ring-border/50 hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3 border-b">
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg text-primary">{prog.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Başlangıç:</span>
                                                <span className="font-medium">{startDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Bitiş:</span>
                                                <span className="font-medium">{endDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm border-t pt-3 mt-3">
                                                <span className="text-muted-foreground">Toplam Öğün Sayısı:</span>
                                                <div className="flex bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                                                    {prog.diet_program_meals?.length || 0}
                                                </div>
                                            </div>

                                            {prog.notes && (
                                                <div className="text-sm bg-muted/50 p-3 rounded-md text-muted-foreground italic line-clamp-2">
                                                    "{prog.notes}"
                                                </div>
                                            )}

                                            <Button variant="outline" className="w-full mt-2" asChild>
                                                <Link href={`/dashboard/clients/${client.id}/diet/${prog.id}`}>
                                                    Programı İncele
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
