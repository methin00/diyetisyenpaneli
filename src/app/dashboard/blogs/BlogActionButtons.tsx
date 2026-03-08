"use client"

import { useState, useTransition } from "react"
import { Eye, EyeOff, MoreHorizontal, Trash2 } from "lucide-react"
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
import { deleteBlogPost, updateBlogVisibility } from "./actions"

export function BlogActionButtons({ blogId, isPublic }: { blogId: string; isPublic: boolean }) {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const toggleVisibility = () => {
        startTransition(async () => {
            const result = await updateBlogVisibility(blogId, !isPublic)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(!isPublic ? "Blog yayına alındı." : "Blog gizlendi.")
            }
        })
    }

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteBlogPost(blogId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Blog silindi.")
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
                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Blog yazısı silinsin mi?</AlertDialogTitle>
                        <AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription>
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

