"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Loader2, Edit, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { editClient, deleteClient } from "./actions"
import { toast } from "sonner"

export function ClientActionButtons({ client }: { client: any }) {
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await editClient(client.id, formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Danışan bilgileri güncellendi.")
                setEditOpen(false)
            }
        })
    }

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteClient(client.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Danışan silindi.")
                setDeleteOpen(false)
            }
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Seçenekler</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Danışanı Düzenle</DialogTitle>
                        <DialogDescription>
                            İlgili alanları güncelleyerek kaydedin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Ad *</Label>
                                <Input id="firstName" name="firstName" defaultValue={client.first_name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Soyad *</Label>
                                <Input id="lastName" name="lastName" defaultValue={client.last_name} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon Numarası</Label>
                            <Input id="phone" name="phone" type="tel" defaultValue={client.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta Adresi</Label>
                            <Input id="email" name="email" type="email" defaultValue={client.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notlar</Label>
                            <Textarea id="notes" name="notes" defaultValue={client.notes} placeholder="Danışan hakkında genel notlar..." className="resize-none" />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isPending}>İptal</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? 'Kaydediliyor' : 'Değişiklikleri Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu danışan, varsa ölçümleri ve geçmişi sistemden kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
                            {isPending ? 'Siliniyor...' : 'Evet, Sil'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
