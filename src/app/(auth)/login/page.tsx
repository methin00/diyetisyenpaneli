import { AlertCircle, Sparkles } from "lucide-react"
import { DM_Sans, Libre_Baskerville } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

const libre = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
})

export default async function LoginPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const errorParam = searchParams?.error as string | undefined

    let errorMessage = ""
    if (errorParam === "EmailNotConfirmed") {
        errorMessage =
            "Üyeliğiniz oluşturuldu ancak e-posta onayı bekleniyor. Supabase > Authentication > Providers > Email ayarlarında 'Confirm email' seçeneğini kapatabilir veya e-postanızı onaylayarak tekrar giriş yapabilirsiniz."
    } else if (errorParam === "InvalidCredentials") {
        errorMessage = "E-posta veya şifre hatalı. Lütfen tekrar deneyin."
    } else if (errorParam) {
        try {
            errorMessage = decodeURIComponent(errorParam)
        } catch {
            errorMessage = errorParam
        }
    }

    return (
        <main className={`${dmSans.className} h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_10%_10%,_#d7f8e7_0%,_#f5f7f4_40%,_#eef3f0_100%)]`}>
            <div className="relative grid h-full w-full overflow-hidden border-emerald-100 bg-white/90 shadow-[0_30px_70px_-35px_rgba(6,95,70,0.45)] backdrop-blur md:grid-cols-[1.08fr_0.92fr] md:border">
                <div className="absolute inset-0 md:hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/dietitian-hero.svg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/78 via-emerald-900/62 to-emerald-700/45" />
                </div>

                <section className="relative hidden h-full overflow-hidden md:block">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/dietitian-hero.svg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/70 to-emerald-700/30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

                    <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white lg:p-10">
                        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Diyetisyen Paneli
                        </div>

                        <h1 className={`${libre.className} text-3xl leading-tight lg:text-5xl`}>
                            Danışan sürecinizi tek ekranda, güvenle yönetin.
                        </h1>
                        <p className="mt-4 max-w-xl text-sm text-emerald-50/90 lg:text-base">
                            Randevu planlama, takip notları, ölçüm geçmişi ve içerik yönetimi ile profesyonel çalışma akışınızı sade ama güçlü bir yapıda yönetin.
                        </p>

                        <div className="mt-6 grid gap-3 lg:grid-cols-3">
                            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur">
                                <p className="text-[11px] uppercase tracking-wide text-emerald-100">Planlama</p>
                                <p className="mt-1 text-sm font-semibold">Takvim ve müsaitlik</p>
                            </div>
                            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur">
                                <p className="text-[11px] uppercase tracking-wide text-emerald-100">Takip</p>
                                <p className="mt-1 text-sm font-semibold">Ölçüm ve not geçmişi</p>
                            </div>
                            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur">
                                <p className="text-[11px] uppercase tracking-wide text-emerald-100">İçerik</p>
                                <p className="mt-1 text-sm font-semibold">Blog, tarif ve paketler</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-4 py-6 sm:px-8 md:bg-white/95 md:py-8 lg:px-12">
                    <div className="w-full max-w-md rounded-2xl border border-white/45 bg-white/80 p-5 shadow-[0_24px_60px_-34px_rgba(2,44,34,0.65)] backdrop-blur-xl md:my-auto md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Hoş geldiniz</p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Panele giriş yapın</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Hesabınıza giriş yaparak danışan yönetimi ekranına erişin.
                            </p>
                        </div>

                        <form action="/auth/login" method="post" className="mt-6 space-y-4">
                            {errorMessage && (
                                <div className="rounded-xl border border-red-200 bg-red-50/90 p-3 text-sm text-red-700">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span className="leading-snug">{errorMessage}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">E-posta</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    required
                                    className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Şifre</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-emerald-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-md transition hover:bg-emerald-700"
                            >
                                Giriş Yap
                            </Button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    )
}
