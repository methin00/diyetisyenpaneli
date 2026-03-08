"use client"

import { useState } from "react"
import { Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { addFinancialTransaction } from "./actions"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const transactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    amount: z.coerce.number().positive("Tutar 0'dan büyük olmalidir."),
    transactionDate: z.string().min(1, "Tarih zorunludur."),
    category: z.string().optional(),
    paymentMethod: z.string().optional(),
    description: z.string().optional(),
    clientId: z.string().optional(),
    packageId: z.string().optional(),
})

type TransactionValues = z.infer<typeof transactionSchema>

export function AddTransactionDialog({
    clients,
    packages,
}: {
    clients: Array<{ id: string; first_name: string; last_name: string }>
    packages: Array<{ id: string; title: string }>
}) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<TransactionValues>({
        resolver: zodResolver(transactionSchema) as Resolver<TransactionValues>,
        defaultValues: {
            type: "income",
            amount: 0,
            transactionDate: new Date().toISOString().split("T")[0],
            category: "",
            paymentMethod: "",
            description: "",
            clientId: "",
            packageId: "",
        },
    })

    async function onSubmit(values: TransactionValues) {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("type", values.type)
            formData.append("amount", String(values.amount))
            formData.append("transactionDate", values.transactionDate)
            if (values.category) formData.append("category", values.category)
            if (values.paymentMethod) formData.append("paymentMethod", values.paymentMethod)
            if (values.description) formData.append("description", values.description)
            if (values.clientId && values.clientId !== "none") formData.append("clientId", values.clientId)
            if (values.packageId && values.packageId !== "none") formData.append("packageId", values.packageId)

            const result = await addFinancialTransaction(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("İşlem kaydedildi.")
                form.reset({
                    type: "income",
                    amount: 0,
                    transactionDate: new Date().toISOString().split("T")[0],
                    category: "",
                    paymentMethod: "",
                    description: "",
                    clientId: "",
                    packageId: "",
                })
                setOpen(false)
            }
        } catch {
            toast.error("İşlem kaydedilemedi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    İşlem Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Yeni Finans İşlemi</DialogTitle>
                    <DialogDescription>Gelir veya gider işlemi oluşturun.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tip</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="income">Gelir</SelectItem>
                                                <SelectItem value="expense">Gider</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tutar</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="transactionDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tarih</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Danışan</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seçiniz (opsiyonel)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Yok</SelectItem>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.first_name} {client.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="packageId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paket</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seçiniz (opsiyonel)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Yok</SelectItem>
                                                {packages.map((pkg) => (
                                                    <SelectItem key={pkg.id} value={pkg.id}>
                                                        {pkg.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Orn: Paket satisi, kira..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ödeme Yöntemi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Orn: Nakit, Havale, Kart" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} placeholder="Not..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

