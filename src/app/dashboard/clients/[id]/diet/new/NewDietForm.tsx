"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Plus, Trash2, Calendar, FileText, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createDietProgram } from "../actions"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const mealSchema = z.object({
    dayOfWeek: z.coerce.number().nullable(), // 1 for Mon, 7 for Sun, null for Every Day
    mealTime: z.string().min(1, "Öğün zamanı seçin"), // Sabah, Öğle vb.
    foodId: z.string().nullable().optional(),
    recipeId: z.string().nullable().optional(),
    amount: z.coerce.number().nullable().optional(),
    notes: z.string().nullable().optional(),
})

const dietFormSchema = z.object({
    title: z.string().min(2, "Program adı en az 2 karakter olmalıdır"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    notes: z.string().optional(),
    meals: z.array(mealSchema)
})

type DietFormValues = z.infer<typeof dietFormSchema>

export function NewDietForm({ clientId, clientName, availableFoods, availableRecipes }: {
    clientId: string,
    clientName: string,
    availableFoods: any[],
    availableRecipes: any[]
}) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<DietFormValues>({
        resolver: zodResolver(dietFormSchema) as any,
        defaultValues: {
            title: "İlk Hafta Başlangıç",
            startDate: "",
            endDate: "",
            notes: "",
            meals: [
                { dayOfWeek: null, mealTime: "Sabah", foodId: null, recipeId: null, amount: 1, notes: "" }
            ]
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "meals",
    })

    async function onSubmit(data: DietFormValues) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('title', data.title)
            if (data.startDate) formData.append('startDate', data.startDate)
            if (data.endDate) formData.append('endDate', data.endDate)
            if (data.notes) formData.append('notes', data.notes)

            // Convert nullables correctly
            const mappedMeals = data.meals.map(m => ({
                dayOfWeek: m.dayOfWeek === null || Number.isNaN(m.dayOfWeek) ? null : m.dayOfWeek,
                mealTime: m.mealTime,
                foodId: m.foodId || null,
                recipeId: m.recipeId || null,
                amount: m.amount || null,
                notes: m.notes || null,
            }))

            const result = await createDietProgram(clientId, formData, mappedMeals)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Diyet programı başarıyla oluşturuldu.")
                router.push(`/dashboard/clients/${clientId}`)
            }
        } catch (error) {
            toast.error("Beklenmeyen bir hata oluştu.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/dashboard/clients/${clientId}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Yeni Diyet Programı</h2>
                            <p className="text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{clientName}</span> için özel beslenme listesi hazırlayın.
                            </p>
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
                        Programı Kaydet
                    </Button>
                </div>

                {/* Main Settings */}
                <Card className="border-0 shadow-sm ring-1 ring-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Program Detayları
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="lg:col-span-2">
                                    <FormLabel>Program Adı / Süreç *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: 1. Hafta Detoks" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Başlangıç Tarihi</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bitiş Tarihi</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2 lg:col-span-4">
                                    <FormLabel>Programa Özel Genel Notlar / Uyarılar</FormLabel>
                                    <FormControl>
                                        <Textarea className="resize-none" placeholder="Örn: Günde en az 3 litre su içilecek. Akşam 8'den sonra meyve tüketilmeyecek." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Meals List */}
                <Card className="border-0 shadow-sm ring-1 ring-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Öğünler
                        </CardTitle>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => append({ dayOfWeek: null, mealTime: "Ara Öğün", foodId: null, recipeId: null, amount: 1, notes: "" })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Satır Ekle
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                Henüz hiçbir öğün eklemediniz. Aşağıdaki veya yanındaki butondan eklemeye başlayın.
                            </div>
                        )}

                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 rounded-lg border bg-card/40 relative group">

                                {/* 1. Gün Seçimi */}
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Hangi Gün?</label>
                                    <FormField
                                        control={form.control}
                                        name={`meals.${index}.dayOfWeek`}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => field.onChange(val === 'all' ? null : Number(val))}
                                                defaultValue={field.value?.toString() || 'all'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">Her Gün</SelectItem>
                                                    <SelectItem value="1">Pazartesi</SelectItem>
                                                    <SelectItem value="2">Salı</SelectItem>
                                                    <SelectItem value="3">Çarşamba</SelectItem>
                                                    <SelectItem value="4">Perşembe</SelectItem>
                                                    <SelectItem value="5">Cuma</SelectItem>
                                                    <SelectItem value="6">Cumartesi</SelectItem>
                                                    <SelectItem value="7">Pazar</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* 2. Öğün Zamanı */}
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Zaman</label>
                                    <FormField
                                        control={form.control}
                                        name={`meals.${index}.mealTime`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Sabah">Sabah</SelectItem>
                                                    <SelectItem value="Ara Öğün 1">Ara Öğün 1</SelectItem>
                                                    <SelectItem value="Öğle">Öğle</SelectItem>
                                                    <SelectItem value="Ara Öğün 2">Ara Öğün 2</SelectItem>
                                                    <SelectItem value="Akşam">Akşam</SelectItem>
                                                    <SelectItem value="Gece">Gece</SelectItem>
                                                    <SelectItem value="Diğer">Diğer / Özgür</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* 3. Seçim (Besin / Tarif veya Boş) */}
                                <div className="lg:col-span-3 space-y-2 relative">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Ne Yenecek?</label>
                                    <div className="flex flex-col gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`meals.${index}.foodId`}
                                            render={({ field: { value, onChange, ...rest } }) => (
                                                <Select
                                                    value={value || "empty"}
                                                    onValueChange={(val) => {
                                                        onChange(val === "empty" ? null : val);
                                                        if (val !== "empty") {
                                                            // Clear recipe if food is selected
                                                            form.setValue(`meals.${index}.recipeId`, null);
                                                        }
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder="Tekil Besin Seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="empty">-- Besin Seçmeyin --</SelectItem>
                                                        {availableFoods.map(food => (
                                                            <SelectItem key={food.id} value={food.id}>{food.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`meals.${index}.recipeId`}
                                            render={({ field: { value, onChange, ...rest } }) => (
                                                <Select
                                                    value={value || "empty"}
                                                    onValueChange={(val) => {
                                                        onChange(val === "empty" ? null : val);
                                                        if (val !== "empty") {
                                                            // Clear food if recipe is selected
                                                            form.setValue(`meals.${index}.foodId`, null);
                                                        }
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder="Veya Tarif Seçin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="empty">-- Tarif Seçmeyin --</SelectItem>
                                                        {availableRecipes.map(recipe => (
                                                            <SelectItem key={recipe.id} value={recipe.id}>{recipe.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* 4. Miktar & Birim */}
                                <div className="lg:col-span-1 space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Miktar</label>
                                    <FormField
                                        control={form.control}
                                        name={`meals.${index}.amount`}
                                        render={({ field }) => (
                                            <FormControl>
                                                <Input type="number" step="0.5" className="bg-background" {...field} value={field.value || ''} />
                                            </FormControl>
                                        )}
                                    />
                                </div>

                                {/* 5. Özel Metin / Not */}
                                <div className="lg:col-span-4 space-y-2 relative">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Açıklama / Serbest Metin</label>
                                    <FormField
                                        control={form.control}
                                        name={`meals.${index}.notes`}
                                        render={({ field }) => (
                                            <FormControl>
                                                <Textarea
                                                    className="resize-none h-20 bg-background"
                                                    placeholder="Örn: 1 Dilim tam buğday ekmeği veya 'Peynir yağsız olsun'"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -right-2 -top-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => append({ dayOfWeek: null, mealTime: "Sabah", foodId: null, recipeId: null, amount: 1, notes: "" })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Yeni Satır Ekle
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </Form>
    )
}
