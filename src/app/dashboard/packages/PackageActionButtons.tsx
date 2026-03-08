"use client"

import { useState, useTransition } from "react"
import { MoreHorizontal, Trash2, Eye, EyeOff, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { deletePackage, updatePackageActive, updatePackageVisibility } from "./actions"

export function PackageActionButtons({
    packageId,
    isPublic,
    isActive,
}: {
    packageId: string
    isPublic: boolean
    isActive: boolean
}) {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const toggleVisibility = () => {
        startTransition(async () => {
            const result = await updatePackageVisibility(packageId, !isPublic)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(!isPublic ? "Paket web'de yayına alındı." : "Paket web yayından kaldırıldı.")
            }
        })
    }

    const toggleActive = () => {
        startTransition(async () => {
            const result = await updatePackageActive(packageId, !isActive)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(!isActive ? "Paket aktif edildi." : "Paket pasif edildi.")
            }
        })
    }

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deletePackage(packageId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Paket silindi.")
                setDeleteOpen(false)
            }
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={toggleVisibility} className="cursor-pointer">
                        {isPublic ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {isPublic ? "Web'den Gizle" : "Web'de Yayınla"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleActive} className="cursor-pointer">
                        {isActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                        {isActive ? "Pasif Et" : "Aktif Et"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Paketi silmek istiyor musunuz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Siliniyor..." : "Evet, Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

