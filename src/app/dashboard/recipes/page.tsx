import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Clock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function RecipesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('dietitian_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tarif Defteri</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Sağlıklı tariflerinizi oluşturun ve danışanlarınızla paylaşın.</p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/dashboard/recipes/new">
                        <Plus className="h-4 w-4" />
                        Yeni Tarif
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tariflerde ara..." className="pl-8 bg-background border-muted shadow-sm" />
                </div>
            </div>

            {!recipes || recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border shadow-sm bg-card mt-4">
                    <span className="text-lg font-medium text-foreground mb-2">Henüz tarif eklemediniz.</span>
                    <span className="text-sm text-muted-foreground max-w-sm">"Yeni Tarif" butonuna tıklayarak ilk sağlıklı tarifinizi oluşturabilir, kalorileri ve makroları otomatik hesaplayabilirsiniz.</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md">
                            {/* Image Placeholder */}
                            <div className="aspect-video w-full bg-muted overflow-hidden relative">
                                {recipe.image_url ? (
                                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                                        Görsel Yok
                                    </div>
                                )}

                                {recipe.is_public && (
                                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
                                        <Globe className="h-3 w-3 text-green-500" />
                                        Herkese Açık
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                    {recipe.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                    {recipe.description || "Açıklama girilmedi."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {recipe.prep_time_minutes ? `${recipe.prep_time_minutes} dk` : "-"}
                                    </div>
                                    <Link
                                        href={`/dashboard/recipes/${recipe.id}`}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Detaylar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
