"use client"

import { useState } from "react"
import { MoreHorizontal, Trash, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "sonner"
import { deleteFood } from "./actions"

interface FoodActionButtonsProps {
    clientId: string | null;
    foodId: string;
}

export function FoodActionButtons({ clientId, foodId }: FoodActionButtonsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Genel besinse (clientId null ise) işlemi engelliyoruz/gizliyoruz
    if (clientId === null) {
        return <span className="text-xs text-muted-foreground italic">Sistem Kaydı</span>
    }

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const result = await deleteFood(foodId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Besin başarıyla silindi.")
            }
        } catch (error) {
            toast.error("Bir hata oluştu.")
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Düzenle seçeneği eklenebilir. Şimdilik sadece silme var. */}
                    <DropdownMenuItem
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground focus:outline-none cursor-pointer"
                        onSelect={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu besini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bu besini içeren tarifler etkilenebilir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
