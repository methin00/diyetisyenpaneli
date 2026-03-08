"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ComponentType } from "react"
import {
    Activity,
    Apple,
    BookOpen,
    Calendar,
    ChevronDown,
    FormInput,
    LayoutDashboard,
    LogOut,
    Menu,
    Newspaper,
    Package,
    Settings,
    User,
    UserPlus,
    Users,
    Wallet,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = {
    name: string
    href: string
    icon: ComponentType<{ className?: string }>
}

type NavGroup = {
    name: string
    icon: ComponentType<{ className?: string }>
    items: NavItem[]
}

const SUPER_ADMIN_EMAIL = "metin-cakmak2005@hotmail.com"

export function Header({
    userEmail,
    userFirstName,
    userLastName,
}: {
    userEmail?: string
    userFirstName?: string
    userLastName?: string
}) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const initials =
        userFirstName || userLastName
            ? `${userFirstName?.charAt(0) || ""}${userLastName?.charAt(0) || ""}`.toUpperCase()
            : "DP"

    const navigationGroups: NavGroup[] = [
        {
            name: "Genel",
            icon: LayoutDashboard,
            items: [{ name: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard }],
        },
        {
            name: "Danışan Yönetimi",
            icon: Users,
            items: [
                { name: "Danışanlar", href: "/dashboard/clients", icon: Users },
                { name: "Takvim", href: "/dashboard/calendar", icon: Calendar },
                { name: "Onay Bekleyenler", href: "/dashboard/pending-appointments", icon: Activity },
                { name: "Müsaitlik", href: "/dashboard/availability", icon: Settings },
            ],
        },
        {
            name: "İçerik",
            icon: BookOpen,
            items: [
                { name: "Besinler", href: "/dashboard/foods", icon: Apple },
                { name: "Tarifler", href: "/dashboard/recipes", icon: BookOpen },
                { name: "Bloglar", href: "/dashboard/blogs", icon: Newspaper },
                { name: "Paketler", href: "/dashboard/packages", icon: Package },
            ],
        },
        {
            name: "Operasyon",
            icon: Wallet,
            items: [
                { name: "Finans", href: "/dashboard/finance", icon: Wallet },
                { name: "Widget", href: "/dashboard/form-builder", icon: FormInput },
            ],
        },
    ]

    if (userEmail === SUPER_ADMIN_EMAIL) {
        navigationGroups.push({
            name: "Yönetim",
            icon: UserPlus,
            items: [{ name: "Kullanıcılar", href: "/dashboard/users", icon: UserPlus }],
        })
    }

    const mobileQuickLinks: NavItem[] = [
        { name: "Genel", href: "/dashboard", icon: LayoutDashboard },
        { name: "Danışanlar", href: "/dashboard/clients", icon: Users },
        { name: "Takvim", href: "/dashboard/calendar", icon: Calendar },
        { name: "Finans", href: "/dashboard/finance", icon: Wallet },
        { name: "Widget", href: "/dashboard/form-builder", icon: FormInput },
    ]

    if (userEmail === SUPER_ADMIN_EMAIL) {
        mobileQuickLinks.push({ name: "Kullanıcılar", href: "/dashboard/users", icon: UserPlus })
    }

    const isItemActive = (href: string) =>
        pathname === href || (pathname.startsWith(`${href}/`) && href !== "/dashboard")

    useEffect(() => {
        if (!isMobileMenuOpen) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isMobileMenuOpen])

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border bg-card/85 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0 sm:h-9 sm:w-9 sm:text-sm">
                                {initials}
                            </div>
                            <span className="hidden text-sm font-bold tracking-tight text-foreground sm:block lg:text-lg">
                                Diyetisyen Paneli
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-2">
                            {navigationGroups.map((group) => {
                                const groupActive = group.items.some((item) => isItemActive(item.href))
                                const isSingleItemGroup = group.items.length === 1

                                if (isSingleItemGroup) {
                                    const singleItem = group.items[0]
                                    return (
                                        <Button
                                            key={group.name}
                                            variant="ghost"
                                            asChild
                                            className={`h-9 rounded-md px-3 gap-2 ${
                                                groupActive
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <Link href={singleItem.href}>
                                                <group.icon className="h-4 w-4" />
                                                <span className="text-sm font-medium">{group.name}</span>
                                            </Link>
                                        </Button>
                                    )
                                }

                                return (
                                    <DropdownMenu key={group.name}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={`h-9 rounded-md px-3 gap-2 ${
                                                    groupActive
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                <group.icon className="h-4 w-4" />
                                                <span className="text-sm font-medium">{group.name}</span>
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-64">
                                            <DropdownMenuLabel>{group.name}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {group.items.map((item) => {
                                                const active = isItemActive(item.href)
                                                return (
                                                    <DropdownMenuItem
                                                        key={item.href}
                                                        asChild
                                                        className={active ? "bg-accent text-accent-foreground" : ""}
                                                    >
                                                        <Link href={item.href} className="flex items-center gap-2.5 w-full">
                                                            <item.icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold lg:hidden"
                            aria-label="Profil"
                        >
                            {initials}
                        </button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Menüyü Aç</span>
                        </Button>
                        <div className="hidden md:flex items-center rounded-full border border-border bg-card px-2.5 py-1.5">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="ml-2 whitespace-nowrap text-xs font-medium">
                                {userEmail === SUPER_ADMIN_EMAIL ? "Süper Admin" : "Diyetisyen"}
                            </span>
                        </div>
                        <form action="/auth/logout" method="post" className="hidden lg:block">
                            <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-destructive hover:bg-destructive/10 h-9 w-9"
                            >
                                <LogOut className="h-[18px] w-[18px]" />
                                <span className="sr-only">Çıkış Yap</span>
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border/70 lg:hidden">
                    <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {mobileQuickLinks.map((item) => {
                            const active = isItemActive(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${
                                        active
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background text-foreground hover:bg-muted"
                                    }`}
                                >
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </header>

            <div
                className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                aria-hidden={!isMobileMenuOpen}
            >
                <button
                    type="button"
                    className={`absolute inset-0 bg-black/45 transition-opacity ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Menüyü Kapat"
                />

                <aside
                    className={`absolute right-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto overscroll-contain border-l border-border bg-background px-4 py-4 pb-6 shadow-xl transition-transform duration-300 ${
                        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm font-semibold leading-tight">Navigasyon</p>
                                <p className="text-xs text-muted-foreground leading-tight">
                                    Mobil menü
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Menüyü Kapat</span>
                        </Button>
                    </div>

                    <div className="mt-4 rounded-lg border border-border/70 bg-muted/30 p-3">
                        <p className="text-sm font-medium leading-tight">
                            {userFirstName || userLastName
                                ? `${userFirstName || ""} ${userLastName || ""}`.trim()
                                : "Diyetisyen"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{userEmail}</p>
                    </div>

                    <nav className="mt-5 space-y-4">
                        {navigationGroups.map((group) => (
                            <div key={group.name}>
                                <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {group.name}
                                </p>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const active = isItemActive(item.href)
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors ${
                                                    active
                                                        ? "bg-primary text-primary-foreground"
                                                        : "text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {item.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <form action="/auth/logout" method="post" className="mt-6 border-t border-border pt-4">
                        <Button
                            type="submit"
                            variant="outline"
                            className="h-11 w-full justify-start border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Çıkış Yap
                        </Button>
                    </form>
                </aside>
            </div>
        </>
    )
}
