import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Calendar as CalendarIcon, Clock, Apple, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DietProgramViewPage(props: { params: Promise<{ id: string, programId: string }> }) {
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

    if (!client) return <div className="p-8 text-center text-muted-foreground">Danışan bulunamadı.</div>

    // Fetch program details
    const { data: program } = await supabase
        .from('diet_programs')
        .select('*')
        .eq('id', params.programId)
        .eq('client_id', client.id)
        .single()

    if (!program) return <div className="p-8 text-center text-muted-foreground">Program bulunamadı.</div>

    // Fetch meals with related foods and recipes
    const { data: meals } = await supabase
        .from('diet_program_meals')
        .select(`
            *,
            foods (*),
            recipes (*)
        `)
        .eq('program_id', program.id)
        .order('day_of_week', { ascending: true }) // nulls will usually be sorted differently, we handle grouping in JS

    // Group meals by day
    // dayOfWeek: 1=Mon, 7=Sun, null=Every Day
    const dayNames: Record<string, string> = {
        'null': 'Her Gün',
        '1': 'Pazartesi',
        '2': 'Salı',
        '3': 'Çarşamba',
        '4': 'Perşembe',
        '5': 'Cuma',
        '6': 'Cumartesi',
        '7': 'Pazar'
    }

    // Helper to sort meal times logically
    const mealTimeOrder: Record<string, number> = {
        'Sabah': 1,
        'Ara Öğün 1': 2,
        'Öğle': 3,
        'Ara Öğün 2': 4,
        'Akşam': 5,
        'Gece': 6,
        'Diğer': 7
    }

    // Organize meals
    const groupedMeals = (meals || []).reduce((acc: any, meal) => {
        const dayKey = meal.day_of_week === null ? 'null' : meal.day_of_week.toString();
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(meal);
        return acc;
    }, {});

    // Sort days: "Her Gün" (null) first, then 1 to 7
    const sortedDays = Object.keys(groupedMeals).sort((a, b) => {
        if (a === 'null') return -1;
        if (b === 'null') return 1;
        return Number(a) - Number(b);
    });

    const startDate = program.start_date ? new Date(program.start_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'
    const endDate = program.end_date ? new Date(program.end_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/clients/${client.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-primary">{program.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-semibold text-foreground">{client.first_name} {client.last_name}</span> adlı danışanın diyet programı
                        </p>
                    </div>
                </div>
                <Button variant="secondary" className="gap-2 opacity-60" disabled>
                    <Printer className="h-4 w-4" />
                    Yazdır (Yakında)
                </Button>
            </div>

            {/* Overview Card */}
            <Card className="shadow-sm border-0 ring-1 ring-border/50 bg-muted/20">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4" /> Başlangıç Tarihi
                            </div>
                            <div className="font-medium">{startDate}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4" /> Bitiş Tarihi
                            </div>
                            <div className="font-medium">{endDate}</div>
                        </div>
                        <div className="space-y-1 md:col-span-3">
                            <div className="text-sm text-muted-foreground mb-1">Genel Notlar / Uyarılar</div>
                            <div className="bg-background p-3 rounded-md border text-sm whitespace-pre-wrap">
                                {program.notes || "Bu program için genel bir not eklenmemiştir."}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Meals Display */}
            <div className="space-y-8 mt-8">
                {sortedDays.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        Bu programda henüz hiçbir öğün bulunmuyor.
                    </div>
                )}

                {sortedDays.map(dayKey => {
                    // Sort meals inside the day by mealTimeOrder
                    const dayMeals = groupedMeals[dayKey].sort((a: any, b: any) => {
                        const orderA = mealTimeOrder[a.meal_time] || 99;
                        const orderB = mealTimeOrder[b.meal_time] || 99;
                        return orderA - orderB;
                    });

                    return (
                        <div key={dayKey} className="space-y-4">
                            <h3 className="text-xl font-bold border-b pb-2 text-foreground/80 flex items-center gap-2">
                                <span className={dayKey === 'null' ? 'text-primary' : ''}>
                                    {dayNames[dayKey]}
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dayMeals.map((meal: any) => (
                                    <div key={meal.id} className="relative rounded-xl border bg-card text-card-foreground shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 right-0 p-3 pt-4">
                                            {meal.recipes ? (
                                                <UtensilsCrossed className="h-4 w-4 text-orange-500/70" />
                                            ) : meal.foods ? (
                                                <Apple className="h-4 w-4 text-green-500/70" />
                                            ) : null}
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <span className="font-semibold">{meal.meal_time}</span>
                                        </div>

                                        <div className="space-y-2">
                                            {meal.foods && (
                                                <div className="font-medium text-lg leading-tight">
                                                    {meal.amount && <span>{meal.amount} x </span>}
                                                    {meal.foods.name}
                                                </div>
                                            )}
                                            {meal.recipes && (
                                                <div className="font-medium text-lg leading-tight">
                                                    {meal.amount && <span>{meal.amount} Porsiyon </span>}
                                                    {meal.recipes.title}
                                                    <div className="text-xs text-muted-foreground mt-1">Tarif</div>
                                                </div>
                                            )}
                                            {!meal.foods && !meal.recipes && (
                                                <div className="font-medium italic text-muted-foreground">
                                                    (Serbest Seçim)
                                                </div>
                                            )}

                                            {meal.notes && (
                                                <p className="text-sm text-muted-foreground mt-2 bg-muted/40 p-2 rounded-md border-l-2 border-primary/50">
                                                    {meal.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
