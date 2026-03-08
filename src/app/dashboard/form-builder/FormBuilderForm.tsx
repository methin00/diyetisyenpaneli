"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ExternalLink, RefreshCw } from "lucide-react"
import { saveFormSettings } from "../actions"
import { toast } from "sonner"
import Link from "next/link"

type FormSettings = {
    require_phone?: boolean
    require_email?: boolean
    custom_message?: string
} | null

export function FormBuilderForm({
    initialData,
    dietitianId,
}: {
    initialData: FormSettings
    dietitianId: string
}) {
    const [isPending, startTransition] = useTransition()
    const [baseUrl] = useState(
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    )
    const [refreshKey, setRefreshKey] = useState(0)

    const [settings, setSettings] = useState({
        require_phone: initialData?.require_phone ?? true,
        require_email: initialData?.require_email ?? false,
        custom_message:
            initialData?.custom_message ??
            "Randevu talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz."
    })

    const widgetUrl = `${baseUrl}/widget/${dietitianId}`
    const embedCode = `<iframe src="${widgetUrl}" width="100%" height="600" frameborder="0"></iframe>`

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveFormSettings(settings)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Ayarlar güncellendi.")
                setRefreshKey((prev) => prev + 1)
            }
        })
    }

    const copyText = (value: string, message: string) => {
        navigator.clipboard.writeText(value)
        toast.success(message)
    }

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Form Sihirbazı ve Widget</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Randevu formundaki alanları düzenleyin ve widget ön izlemesini buradan yönetin.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={widgetUrl} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" /> Widget Aç
                        </Link>
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle className="text-lg">Form Alanları</CardTitle>
                            <CardDescription>Randevu formundaki zorunlu alanları ayarlayın.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="req-phone" className="flex flex-col space-y-1">
                                    <span className="font-semibold text-foreground">Telefon Numarası</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Telefon alanı zorunlu olur.
                                    </span>
                                </Label>
                                <Switch
                                    id="req-phone"
                                    checked={settings.require_phone}
                                    onCheckedChange={(c) => setSettings((s) => ({ ...s, require_phone: c }))}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="req-email" className="flex flex-col space-y-1">
                                    <span className="font-semibold text-foreground">E-posta Adresi</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        E-posta alanı zorunlu olur.
                                    </span>
                                </Label>
                                <Switch
                                    id="req-email"
                                    checked={settings.require_email}
                                    onCheckedChange={(c) => setSettings((s) => ({ ...s, require_email: c }))}
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-muted">
                                <Label htmlFor="success-msg" className="font-semibold text-foreground">
                                    Başarılı Kayıt Mesajı
                                </Label>
                                <Textarea
                                    id="success-msg"
                                    value={settings.custom_message}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, custom_message: e.target.value }))
                                    }
                                    rows={3}
                                    className="resize-none bg-background shadow-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-card overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle className="text-lg">Widget Entegrasyonu</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label className="font-semibold">Widget URL</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={widgetUrl} className="font-mono text-xs" />
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => copyText(widgetUrl, "Widget URL kopyalandı")}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold">Embed Kodu</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={embedCode} className="font-mono text-xs" />
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => copyText(embedCode, "Embed kodu kopyalandı")}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-muted/20 overflow-hidden flex flex-col h-[700px]">
                    <CardHeader className="bg-muted/50 border-b py-3 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-sm">Canlı Ön İzleme</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)} className="h-8 text-xs">
                            <RefreshCw className="mr-2 h-3 w-3" /> Yenile
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative">
                        <div className="absolute inset-6 rounded-xl border border-border/50 bg-background shadow-xl overflow-hidden flex flex-col">
                            <div className="h-8 bg-muted/50 border-b flex items-center px-3 gap-1.5 shrink-0" />
                            <div className="flex-1 w-full bg-muted/10 overflow-hidden">
                                <iframe
                                    key={refreshKey}
                                    src={widgetUrl}
                                    className="w-full h-full border-0"
                                    title="Widget Ön İzleme"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t">
                        Kimlik: {dietitianId}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
