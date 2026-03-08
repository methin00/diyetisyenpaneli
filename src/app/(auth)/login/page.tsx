import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default async function LoginPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const errorParam = searchParams?.error as string | undefined;

    let errorMessage = "";
    if (errorParam === "EmailNotConfirmed") {
        errorMessage = "Üyeliğiniz başarıyla oluşturuldu fakat güvenliğiniz için e-posta onayı bekleniyor. Lütfen Supabase üzerinden Authentication -> Providers -> Email ayarlarından 'Confirm email' seçeneğini kapatıp, hesabı silerek tekrar giriş yapmayı deneyin veya e-postanızı onaylayın.";
    } else if (errorParam === "InvalidCredentials") {
        errorMessage = "E-posta veya şifre hatalı. Lütfen tekrar deneyin.";
    } else if (errorParam) {
        errorMessage = decodeURIComponent(errorParam);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <form action="/auth/login" method="post">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
                        <CardDescription>
                            Diyetisyen Paneline erişmek için hesap bilgilerinizle giriş yapın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errorMessage && (
                            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex gap-2 items-start mb-4">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span className="leading-snug">{errorMessage}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input id="email" name="email" type="email" placeholder="email@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input id="password" name="password" type="password" placeholder="••••••••" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">Giriş Yap</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
