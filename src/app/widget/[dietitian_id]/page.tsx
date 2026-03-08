"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

type Availability = {
    day_of_week: number
    start_time: string
    end_time: string
    is_active: boolean
}

type WidgetSettings = {
    require_phone: boolean
    require_email: boolean
    custom_message: string
}

export default function BookingWidget() {
    const params = useParams()
    const identifier = params?.dietitian_id as string

    const [loading, setLoading] = React.useState(true)
    const [submitting, setSubmitting] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [availabilities, setAvailabilities] = React.useState<Availability[]>([])
    const [settings, setSettings] = React.useState<WidgetSettings>({
        require_phone: true,
        require_email: false,
        custom_message: "Randevu talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz."
    })

    const [step, setStep] = React.useState(1)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [time, setTime] = React.useState<string | undefined>(undefined)

    const [formData, setFormData] = React.useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        notes: ""
    })

    React.useEffect(() => {
        if (!identifier) return

        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/availability?identifier=${identifier}`)
                if (!res.ok) throw new Error("Veriler alınamadı")

                const { data } = await res.json()
                setAvailabilities(data.availabilities || [])
                if (data.settings) setSettings(data.settings)
            } catch {
                setError("Müsaitlik bilgisi yüklenirken bir hata oluştu.")
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [identifier])

    const hasAvailability = (dayOfWeek: number) => {
        if (availabilities.length === 0) {
            return dayOfWeek >= 1 && dayOfWeek <= 5
        }
        return availabilities.some(a => a.day_of_week === dayOfWeek)
    }

    const getAvailableTimes = () => {
        if (!date) return []

        const dayOfWeek = date.getDay()
        const daySettings = availabilities.find(a => a.day_of_week === dayOfWeek)

        const startTime = daySettings?.start_time || "09:00:00"
        const endTime = daySettings?.end_time || "17:00:00"

        const slots: string[] = []
        const current = new Date(`1970-01-01T${startTime}`)
        const end = new Date(`1970-01-01T${endTime}`)

        while (current < end) {
            slots.push(current.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }))
            current.setMinutes(current.getMinutes() + 45)
        }

        return slots
    }

    const availableTimes = getAvailableTimes()

    const handleNext = () => setStep((s) => s + 1)
    const handleBack = () => setStep((s) => s - 1)

    const handleSubmit = async () => {
        if (!date || !time || !formData.firstName || !formData.lastName || (settings.require_phone && !formData.phone) || (settings.require_email && !formData.email)) {
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const res = await fetch("/api/appointment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier,
                    date: date.toISOString().split("T")[0],
                    time,
                    ...formData
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || "Randevu oluşturulamadı")
            }

            setStep(4)
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Randevu oluşturulurken bir hata oluştu.")
            } finally {
                setSubmitting(false)
            }
    }

    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20 bg-background/95 backdrop-blur flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-lg border-destructive bg-destructive/5 text-center p-8">
                <p className="text-destructive font-semibold">{error}</p>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20 bg-background/95 backdrop-blur font-sans">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-center">Randevu Alın</CardTitle>
                <div className="flex justify-center items-center gap-2 mt-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
                    <div className={`h-1 w-8 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
                    <div className={`h-1 w-8 rounded ${step >= 3 ? "bg-primary" : "bg-muted"}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</div>
                </div>
            </CardHeader>

            <CardContent className="min-h-[300px]">
                {step === 1 && (
                    <div className="space-y-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        <h3 className="font-semibold text-center mb-2">Tarih Seçin</h3>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d: Date | undefined) => { setDate(d); setTime(undefined) }}
                            className="rounded-xl border shadow-sm p-3 bg-card"
                            disabled={(candidateDate) => {
                                if (candidateDate < new Date(new Date().setHours(0, 0, 0, 0))) return true
                                return !hasAvailability(candidateDate.getDay())
                            }}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <h3 className="font-semibold text-center mb-4">{date?.toLocaleDateString("tr-TR")} - Saat Seçin</h3>
                        {availableTimes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Bu tarih için uygun saat bulunmuyor.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {availableTimes.map((t) => (
                                    <Button
                                        key={t}
                                        variant={time === t ? "default" : "outline"}
                                        onClick={() => setTime(t)}
                                        className={`rounded-lg ${time === t ? "bg-primary shadow-md" : "hover:bg-primary/5"}`}
                                    >
                                        {t}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <h3 className="font-semibold text-center mb-4">İletişim Bilgileri</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Adınız *</Label>
                                <Input id="firstName" value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Soyadınız *</Label>
                                <Input id="lastName" value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon Numaranız {settings.require_phone ? "*" : "(Opsiyonel)"}</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta Adresiniz {settings.require_email ? "*" : "(Opsiyonel)"}</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notunuz (Opsiyonel)</Label>
                            <Textarea id="notes" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} className="resize-none" />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-in zoom-in duration-500">
                        <div className="h-20 w-20 bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-bold">Talebiniz Alındı</h3>
                        <p className="text-muted-foreground">{settings.custom_message}</p>
                    </div>
                )}
            </CardContent>

            {step < 4 && (
                <CardFooter className="flex justify-between border-t p-4 bg-muted/10 rounded-b-xl">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1 || submitting}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                    </Button>
                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={(step === 1 && !date) || (step === 2 && !time)}
                            className="bg-primary shadow-md"
                        >
                            İleri <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !formData.firstName || !formData.lastName || (settings.require_phone && !formData.phone) || (settings.require_email && !formData.email)}
                            className="bg-primary hover:bg-primary/90 shadow-md min-w-[140px]"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {submitting ? "Gönderiliyor" : "Talebi Gönder"}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}

