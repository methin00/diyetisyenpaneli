"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { saveAvailabilitySettings } from "../actions"
import { toast } from "sonner"

const daysBase = [
    { id: 1, name: "Pazartesi" },
    { id: 2, name: "Salı" },
    { id: 3, name: "Çarşamba" },
    { id: 4, name: "Perşembe" },
    { id: 5, name: "Cuma" },
    { id: 6, name: "Cumartesi" },
    { id: 0, name: "Pazar" },
]

export function AvailabilityForm({ initialData }: { initialData: any[] }) {
    const [isPending, startTransition] = useTransition()

    const initialDaysState = daysBase.map(d => {
        const found = initialData.find((saved: any) => saved.day_of_week === d.id)
        return {
            day_of_week: d.id,
            name: d.name,
            is_active: found ? found.is_active : (d.id !== 0 && d.id !== 6), // varsayılan hafta içi
            start_time: found ? found.start_time.substring(0, 5) : "09:00",
            end_time: found ? found.end_time.substring(0, 5) : "18:00"
        }
    })

    const [days, setDays] = useState(initialDaysState)

    const handleChange = (id: number, field: string, value: any) => {
        setDays(prev => prev.map(d => d.day_of_week === id ? { ...d, [field]: value } : d))
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveAvailabilitySettings(days)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Müsaitlik ayarları başarıyla kaydedildi.")
            }
        })
    }

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Müsaitlik Ayarları</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Randevu kabul ettiğiniz gün ve saatleri yapılandırın.</p>
                </div>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="text-lg">Çalışma Saatleri</CardTitle>
                    <CardDescription>
                        Widget üzerinden danışanlarınız sadece aşağıdaki aktif gün ve saatler arasında randevu talep edebilir.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {days.map((day) => (
                        <div key={day.day_of_week} className="flex flex-col sm:flex-row sm:items-center gap-4 py-2 border-b last:border-0 border-muted">
                            <div className="w-32 flex items-center space-x-2">
                                <Switch
                                    id={`day-${day.day_of_week}`}
                                    checked={day.is_active}
                                    onCheckedChange={(checked) => handleChange(day.day_of_week, 'is_active', checked)}
                                />
                                <Label htmlFor={`day-${day.day_of_week}`} className={`cursor-pointer ${!day.is_active && 'text-muted-foreground line-through'}`}>{day.name}</Label>
                            </div>
                            <div className={`flex items-center gap-2 transition-opacity ${!day.is_active ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Input
                                    type="time"
                                    value={day.start_time}
                                    onChange={(e) => handleChange(day.day_of_week, 'start_time', e.target.value)}
                                    className="w-24 bg-background"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="time"
                                    value={day.end_time}
                                    onChange={(e) => handleChange(day.day_of_week, 'end_time', e.target.value)}
                                    className="w-24 bg-background"
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
