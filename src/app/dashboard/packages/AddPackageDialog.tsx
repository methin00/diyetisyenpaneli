"use client"

import { useState } from "react"
import { Box, Loader2, Plus } from "lucide-react"
import { Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { createPackage } from "./actions"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

const packageSchema = z.object({
    title: z.string().min(2, "Paket adi en az 2 karakter olmalidir."),
    description: z.string().optional(),
    sessionCount: z.coerce.number().min(1, "Seans sayisi en az 1 olmalidir."),
    price: z.coerce.number().min(0, "Fiyat negatif olamaz."),
    currency: z.string().min(3, "Para birimi giriniz.").max(5),
    isPublic: z.boolean().default(true),
    isActive: z.boolean().default(true),
})

type PackageValues = z.infer<typeof packageSchema>

export function AddPackageDialog() {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<PackageValues>({
        resolver: zodResolver(packageSchema) as Resolver<PackageValues>,
        defaultValues: {
            title: "",
            description: "",
            sessionCount: 4,
            price: 0,
            currency: "TRY",
            isPublic: true,
            isActive: true,
        },
    })

    async function onSubmit(values: PackageValues) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("title", values.title)
            if (values.description) formData.append("description", values.description)
            formData.append("sessionCount", String(values.sessionCount))
            formData.append("price", String(values.price))
            formData.append("currency", values.currency)
            formData.append("isPublic", values.isPublic ? "true" : "false")
            formData.append("isActive", values.isActive ? "true" : "false")

            const result = await createPackage(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Paket eklendi.")
                setOpen(false)
                form.reset()
            }
        } catch {
            toast.error("Paket eklenirken hata oluştu.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Paket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-primary" />
                        Yeni Paket Oluştur
                    </DialogTitle>
                    <DialogDescription>
                        Seans ve fiyat bilgilerini girerek yeni bir paket tanimlayin.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paket Adi *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Orn: 8 Seans Beslenme Takibi" {...field} />
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
                                    <FormLabel>Açıklama</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder="Pakete dahil detaylar..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-3">
                            <FormField
                                control={form.control}
                                name="sessionCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Seans</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fiyat</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Para Birimi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="TRY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
                                        <FormLabel className="mb-0">Web'de Yayında</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
                                        <FormLabel className="mb-0">Aktif</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kaydediliyor
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

