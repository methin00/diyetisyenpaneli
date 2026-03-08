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
import { AddFoodDialog } from "./AddFoodDialog"
import { FoodActionButtons } from "./FoodActionButtons"

export default async function FoodsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get both global foods (dietitian_id is null) and personal foods (dietitian_id = user.id)
    const { data: foods, error } = await supabase
        .from('foods')
        .select('*')
        .or(`dietitian_id.is.null,dietitian_id.eq.${user.id}`)
        .order('name', { ascending: true })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Besin Veritabanı</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Sistemdeki genel besinleri görebilir, kendi özel besinlerinizi ekleyebilirsiniz.</p>
                </div>
                <AddFoodDialog />
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-semibold px-4 py-3">Besin Adı</TableHead>
                            <TableHead className="font-semibold text-center">Porsiyon</TableHead>
                            <TableHead className="font-semibold text-center">Kalori (kcal)</TableHead>
                            <TableHead className="font-semibold text-center hidden md:table-cell">Karbonhidrat (g)</TableHead>
                            <TableHead className="font-semibold text-center hidden md:table-cell">Protein (g)</TableHead>
                            <TableHead className="font-semibold text-center hidden md:table-cell">Yağ (g)</TableHead>
                            <TableHead className="font-semibold text-center hidden sm:table-cell">Tür</TableHead>
                            <TableHead className="text-right font-semibold px-4">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!foods || foods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <span className="text-lg">Kayıtlı besin bulunamadı.</span>
                                        <span className="text-sm">Yukarıdaki "Yeni Besin Ekle" butonunu kullanarak kendi besinlerinizi ekleyebilirsiniz.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            foods.map((food) => (
                                <TableRow key={food.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium px-4">{food.name}</TableCell>
                                    <TableCell className="text-center">{food.serving_size || '-'}</TableCell>
                                    <TableCell className="text-center font-semibold text-primary/80">{food.calories}</TableCell>
                                    <TableCell className="text-center hidden md:table-cell">{food.carbohydrates}</TableCell>
                                    <TableCell className="text-center hidden md:table-cell">{food.proteins}</TableCell>
                                    <TableCell className="text-center hidden md:table-cell">{food.fats}</TableCell>
                                    <TableCell className="text-center hidden sm:table-cell">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${food.dietitian_id === null ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                            {food.dietitian_id === null ? "Genel" : "Bana Özel"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right px-4">
                                        <FoodActionButtons clientId={food.dietitian_id} foodId={food.id} />
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
