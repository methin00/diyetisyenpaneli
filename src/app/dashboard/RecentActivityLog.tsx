import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { UserPlus, Weight, Apple, BookOpen, ClipboardList } from "lucide-react"

type ActivityItem = {
    id: string
    type: 'client' | 'measurement' | 'food' | 'recipe' | 'diet_program'
    message: string
    date: string
}

export async function RecentActivityLog({ userId }: { userId: string }) {
    const supabase = await createClient()

    // Fetch recent clients (last 15)
    const { data: recentClients } = await supabase
        .from('clients')
        .select('id, first_name, last_name, created_at')
        .eq('dietitian_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch recent measurements — only for this dietitian's clients
    const { data: recentMeasurements } = await supabase
        .from('client_measurements')
        .select('id, measurement_date, created_at, clients!inner(first_name, last_name, dietitian_id)')
        .eq('clients.dietitian_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch recent foods
    const { data: recentFoods } = await supabase
        .from('foods')
        .select('id, name, created_at')
        .eq('dietitian_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch recent recipes
    const { data: recentRecipes } = await supabase
        .from('recipes')
        .select('id, title, created_at')
        .eq('dietitian_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch recent diet programs
    const { data: recentPrograms } = await supabase
        .from('diet_programs')
        .select('id, title, created_at, clients(first_name, last_name)')
        .eq('dietitian_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // Merge all into a single timeline
    const activities: ActivityItem[] = []

        ; (recentClients || []).forEach(c => {
            activities.push({
                id: `client-${c.id}`,
                type: 'client',
                message: `${c.first_name} ${c.last_name} adlı yeni danışan eklendi.`,
                date: c.created_at,
            })
        })

        ; (recentMeasurements || []).forEach((m: any) => {
            const clientName = m.clients ? `${m.clients.first_name} ${m.clients.last_name}` : 'Bilinmeyen'
            activities.push({
                id: `measurement-${m.id}`,
                type: 'measurement',
                message: `${clientName} adlı danışanın yeni ölçümleri girildi.`,
                date: m.measurement_date,
            })
        })

        ; (recentFoods || []).forEach(f => {
            activities.push({
                id: `food-${f.id}`,
                type: 'food',
                message: `"${f.name}" adlı yeni besin eklendi.`,
                date: f.created_at,
            })
        })

        ; (recentRecipes || []).forEach(r => {
            activities.push({
                id: `recipe-${r.id}`,
                type: 'recipe',
                message: `"${r.title}" adlı yeni tarif oluşturuldu.`,
                date: r.created_at,
            })
        })

        ; (recentPrograms || []).forEach((p: any) => {
            const clientName = p.clients ? `${p.clients.first_name} ${p.clients.last_name}` : ''
            activities.push({
                id: `program-${p.id}`,
                type: 'diet_program',
                message: clientName
                    ? `${clientName} için "${p.title}" diyet programı oluşturuldu.`
                    : `"${p.title}" diyet programı oluşturuldu.`,
                date: p.created_at,
            })
        })

    // Sort by date descending and take top 15
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const topActivities = activities.slice(0, 15)

    const iconMap = {
        client: <UserPlus className="h-4 w-4 text-primary" />,
        measurement: <Weight className="h-4 w-4 text-blue-500" />,
        food: <Apple className="h-4 w-4 text-green-500" />,
        recipe: <BookOpen className="h-4 w-4 text-orange-500" />,
        diet_program: <ClipboardList className="h-4 w-4 text-purple-500" />,
    }

    const bgMap = {
        client: 'bg-primary/10',
        measurement: 'bg-blue-500/10',
        food: 'bg-green-500/10',
        recipe: 'bg-orange-500/10',
        diet_program: 'bg-purple-500/10',
    }

    function formatDate(dateStr: string) {
        const d = new Date(dateStr)
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
            + ' · '
            + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent>
                {topActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        Henüz bir aktivite kaydı bulunmuyor.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {topActivities.map((activity, i) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgMap[activity.type]} mt-0.5`}>
                                    {iconMap[activity.type]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-snug">{activity.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDate(activity.date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
