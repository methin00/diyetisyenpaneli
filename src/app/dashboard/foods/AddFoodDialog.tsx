"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Apple, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { addFood } from "./actions"

const addFoodSchema = z.object({
    name: z.string().min(2, "Besin adı en az 2 karakter olmalıdır"),
    calories: z.coerce.number().min(0, "Kalori 0'dan küçük olamaz"),
    carbohydrates: z.coerce.number().min(0, "Karbonhidrat 0'dan küçük olamaz"),
    proteins: z.coerce.number().min(0, "Protein 0'dan küçük olamaz"),
    fats: z.coerce.number().min(0, "Yağ 0'dan küçük olamaz"),
    servingSize: z.string().optional(),
})

type AddFoodValues = z.infer<typeof addFoodSchema>

export function AddFoodDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AddFoodValues>({
        resolver: zodResolver(addFoodSchema) as any,
        defaultValues: {
            name: "",
            calories: 0,
            carbohydrates: 0,
            proteins: 0,
            fats: 0,
            servingSize: "100g",
        },
    })

    async function onSubmit(data: AddFoodValues) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('calories', data.calories.toString())
            formData.append('carbohydrates', data.carbohydrates.toString())
            formData.append('proteins', data.proteins.toString())
            formData.append('fats', data.fats.toString())
            if (data.servingSize) formData.append('servingSize', data.servingSize)

            const result = await addFood(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Besin başarıyla eklendi.")
                setOpen(false)
                form.reset()
            }
        } catch (error) {
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Besin Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Apple className="h-5 w-5 text-primary" />
                        Yeni Besin Ekle
                    </DialogTitle>
                    <DialogDescription>
                        Sadece sizin kullanabileceğiniz özel bir besin ekleyin.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Besin Adı *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Yulaf Ezmesi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="servingSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Porsiyon / Miktar</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: 100g, 1 Dilim" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="calories"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kalori (kcal) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="carbohydrates"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Karbonhidrat (g) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="proteins"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Protein (g) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fats"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yağ (g) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Ekleniyor...
                                    </>
                                ) : (
                                    "Kaydet"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
