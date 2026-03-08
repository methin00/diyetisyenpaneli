"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Plus, Trash2, Calculator, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createRecipe } from "../actions"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const recipeFormSchema = z.object({
    title: z.string().min(2, "Tarif adı en az 2 karakter olmalıdır"),
    description: z.string().optional(),
    instructions: z.string().min(10, "Hazırlanışı biraz daha detaylandırın"),
    prepTime: z.coerce.number().min(1, "Hazırlama süresi 1'den küçük olamaz").optional(),
    isPublic: z.boolean().default(false),
    ingredients: z.array(
        z.object({
            foodId: z.string().min(1, "Besin seçimi zorunlu"),
            amount: z.coerce.number().min(0.01, "Miktar 0'dan büyük olmalı"),
            unit: z.string().min(1, "Birim zorunlu")
        })
    ).min(1, "En az bir malzeme eklemelisiniz")
})

type RecipeFormValues = z.infer<typeof recipeFormSchema>

export function NewRecipeForm({ availableFoods }: { availableFoods: any[] }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Calculate total macros whenever ingredients change
    const [totals, setTotals] = useState({ calories: 0, carbs: 0, proteins: 0, fats: 0 })

    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeFormSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            instructions: "",
            prepTime: 15,
            isPublic: false,
            ingredients: []
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    })

    // Macro calculator
    const updateMacros = () => {
        const currentIngredients = form.getValues().ingredients
        let cals = 0, carbs = 0, prot = 0, fat = 0

        currentIngredients.forEach(ing => {
            if (!ing.foodId || !ing.amount) return
            const food = availableFoods.find(f => f.id === ing.foodId)
            if (food) {
                // Here we assume standard ratio scaling: (amount * macro)
                cals += (food.calories * ing.amount)
                carbs += (food.carbohydrates * ing.amount)
                prot += (food.proteins * ing.amount)
                fat += (food.fats * ing.amount)
            }
        })

        setTotals({
            calories: Math.round(cals * 10) / 10,
            carbs: Math.round(carbs * 10) / 10,
            proteins: Math.round(prot * 10) / 10,
            fats: Math.round(fat * 10) / 10
        })
    }

    async function onSubmit(data: RecipeFormValues) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('title', data.title)
            if (data.description) formData.append('description', data.description)
            formData.append('instructions', data.instructions)
            if (data.prepTime) formData.append('prepTime', data.prepTime.toString())
            formData.append('isPublic', data.isPublic ? 'true' : 'false')

            const result = await createRecipe(formData, data.ingredients)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Tarif başarıyla kaydedildi.")
                router.push('/dashboard/recipes') // Go back to recipe list
            }
        } catch (error) {
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* 1. Header with Actions */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/recipes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Yeni Tarif Oluştur</h2>
                            <p className="text-muted-foreground text-sm">Tarif bilgilerinizi, aşamalarını ve malzemeleri girin.</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            "Tarifi Kaydet"
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: BASIC INFO */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Genel Bilgiler
                            </h3>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tarif Adı *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Örn: Fit Yulaf Lapası" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kısa Açıklama</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Tarif hakkında kısa, iştah açıcı bir açıklama girin..." className="resize-none h-20" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hazırlanışı *</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="1. Yulafı sütle kaynatın..." className="min-h-[150px]" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Tarifin adım adım yapılışını buraya ekleyin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* LEFT COLUMN: INGREDIENTS */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Malzemeler *</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => append({ foodId: "", amount: 1, unit: "Porsiyon" })}
                                >
                                    <Plus className="h-4 w-4" />
                                    Malzeme Ekle
                                </Button>
                            </div>

                            <div className="space-y-4 mt-2">
                                {fields.length === 0 && (
                                    <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
                                        Henüz hiç malzeme eklenmedi. Makro hesabı için yukarıdan malzeme ekleyin.
                                    </div>
                                )}
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20">

                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.foodId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={(val) => { field.onChange(val); updateMacros(); }} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Besin veritabanından seçin" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {availableFoods.map(food => (
                                                                    <SelectItem key={food.id} value={food.id}>
                                                                        {food.name} <span className="text-muted-foreground text-xs ml-2">({food.calories} kcal)</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="w-24">
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.amount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" placeholder="Miktar" {...field} onBlur={(e) => { field.onBlur(); updateMacros(); }} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="w-32">
                                            <FormField
                                                control={form.control}
                                                name={`ingredients.${index}.unit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Birim (Ör: gr)" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { remove(index); setTimeout(updateMacros, 50); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {form.formState.errors.ingredients?.root && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.ingredients.root.message}</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SETTINGS & MACRO CALCULATOR */}
                    <div className="space-y-6">

                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                Otomatik Makro Hesap
                            </h3>
                            <p className="text-sm text-muted-foreground">Eklemiş olduğunuz malzemelere ve girdiklerinize göre tarifin tahmini genel toplam değerleridir.</p>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-3 rounded-lg border bg-background flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-primary/80">{totals.calories}</span>
                                    <span className="text-xs text-muted-foreground font-medium uppercase mt-1">Kalori (kcal)</span>
                                </div>
                                <div className="p-3 rounded-lg border bg-background flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold">{totals.carbs}</span>
                                    <span className="text-xs text-muted-foreground font-medium uppercase mt-1">Karbonhidrat (g)</span>
                                </div>
                                <div className="p-3 rounded-lg border bg-background flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold">{totals.proteins}</span>
                                    <span className="text-xs text-muted-foreground font-medium uppercase mt-1">Protein (g)</span>
                                </div>
                                <div className="p-3 rounded-lg border bg-background flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold">{totals.fats}</span>
                                    <span className="text-xs text-muted-foreground font-medium uppercase mt-1">Yağ (g)</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Ayarlar</h3>

                            <FormField
                                control={form.control}
                                name="prepTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hazırlama Süresi (Dk)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Herkese Açık</FormLabel>
                                            <FormDescription>
                                                Tarifiniz widget üzerinden erişilebilir olur.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
