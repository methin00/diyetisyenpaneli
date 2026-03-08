"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2, Scale, StickyNote, Trash2, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { addMeasurement, addNote, deleteMeasurement, deleteNote } from "./actions"
import { toast } from "sonner"

// ─── Add Measurement Dialog ─────────────────────────
export function AddMeasurementDialog({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('clientId', clientId)

        startTransition(async () => {
            const result = await addMeasurement(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Ölçüm başarıyla eklendi.")
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Scale className="mr-2 h-4 w-4" /> Ölçüm Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Ölçüm Ekle</DialogTitle>
                    <DialogDescription>
                        Danışanın güncel vücut ölçümlerini kaydedin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Tarih *</Label>
                        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Kilo (kg)</Label>
                            <Input id="weight" name="weight" type="number" step="0.1" placeholder="75.5" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bodyFat">Yağ Oranı (%)</Label>
                            <Input id="bodyFat" name="bodyFat" type="number" step="0.1" placeholder="22.0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="muscleMass">Kas (kg)</Label>
                            <Input id="muscleMass" name="muscleMass" type="number" step="0.1" placeholder="32.0" />
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>İptal</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Add Note Dialog ────────────────────────────────
export function AddNoteDialog({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('clientId', clientId)

        startTransition(async () => {
            const result = await addNote(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Not başarıyla eklendi.")
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <StickyNote className="mr-2 h-4 w-4" /> Not Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Not Ekle</DialogTitle>
                    <DialogDescription>
                        Sadece siz görebilirsiniz. Danışan hakkında özel notlarınızı yazın.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="content">Not *</Label>
                        <Textarea id="content" name="content" rows={4} placeholder="Danışanla ilgili notlarınız..." className="resize-none" required />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>İptal</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Timeline ───────────────────────────────────────
type TimelineItem = {
    id: string
    type: 'measurement' | 'note'
    date: string
    data: any
}

export function Timeline({ items, clientId }: { items: TimelineItem[], clientId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = (item: TimelineItem) => {
        startTransition(async () => {
            let result
            if (item.type === 'measurement') {
                result = await deleteMeasurement(item.id, clientId)
            } else {
                result = await deleteNote(item.id, clientId)
            }
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Kayıt silindi.")
            }
        })
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <StickyNote className="h-7 w-7" />
                </div>
                <p className="text-sm">Henüz ölçüm veya not eklenmemiş.</p>
                <p className="text-xs mt-1">Yukarıdaki butonlardan başlayabilirsiniz.</p>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
                {items.map((item, index) => (
                    <div key={item.id} className="relative flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Dot */}
                        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${item.type === 'measurement'
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                                : 'border-amber-500 bg-amber-500/10 text-amber-600'
                            }`}>
                            {item.type === 'measurement' ? <Scale className="h-4 w-4" /> : <StickyNote className="h-4 w-4" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === 'measurement'
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : 'bg-amber-500/10 text-amber-600'
                                        }`}>
                                        {item.type === 'measurement' ? 'Ölçüm' : 'Not'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(item)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {item.type === 'measurement' ? (
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {item.data.weight && (
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-bold text-foreground">{item.data.weight}</span>
                                            <span className="text-xs text-muted-foreground">kg</span>
                                        </div>
                                    )}
                                    {item.data.body_fat_percentage && (
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-bold text-foreground">%{item.data.body_fat_percentage}</span>
                                            <span className="text-xs text-muted-foreground">yağ</span>
                                        </div>
                                    )}
                                    {item.data.muscle_mass && (
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-bold text-foreground">{item.data.muscle_mass}</span>
                                            <span className="text-xs text-muted-foreground">kg kas</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap leading-relaxed">{item.data.content}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
