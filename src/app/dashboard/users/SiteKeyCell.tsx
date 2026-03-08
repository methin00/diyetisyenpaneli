"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Copy, KeyRound } from "lucide-react"
import { generateDietitianSiteKey } from "./actions"

export function SiteKeyCell({
    dietitianId,
    siteKey,
}: {
    dietitianId: string
    siteKey: string | null
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleCopy = async () => {
        if (!siteKey) return
        await navigator.clipboard.writeText(siteKey)
        toast.success("Site key kopyalandı.")
    }

    const handleGenerate = () => {
        startTransition(async () => {
            const result = await generateDietitianSiteKey(dietitianId)
            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.siteKey) {
                await navigator.clipboard.writeText(result.siteKey)
            }

            toast.success("Site key üretildi ve kopyalandı.")
            router.refresh()
        })
    }

    if (!siteKey) {
        return (
            <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">Yok</span>
                <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isPending}>
                    <KeyRound className="h-3.5 w-3.5 mr-1" />
                    Üret
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-end gap-2">
            <span className="font-mono text-xs text-muted-foreground">
                {siteKey.slice(0, 6)}...{siteKey.slice(-4)}
            </span>
            <Button size="icon" variant="ghost" onClick={handleCopy} title="Kopyala">
                <Copy className="h-4 w-4" />
            </Button>
        </div>
    )
}
