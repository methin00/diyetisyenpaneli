"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { addClient } from "./actions"
import { toast } from "sonner"

export function AddClientDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await addClient(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Danışan başarıyla eklendi.")
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Danışan Ekle</DialogTitle>
                    <DialogDescription>
                        Danışanın temel bilgilerini girerek sisteme kaydedin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Ad *</Label>
                            <Input id="firstName" name="firstName" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Soyad *</Label>
                            <Input id="lastName" name="lastName" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefon Numarası</Label>
                        <Input id="phone" name="phone" type="tel" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta Adresi</Label>
                        <Input id="email" name="email" type="email" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notlar / Şikayetler</Label>
                        <Textarea id="notes" name="notes" placeholder="Danışan hakkında genel notlar..." className="resize-none" />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>İptal</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Kaydediliyor' : 'Kaydet'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
