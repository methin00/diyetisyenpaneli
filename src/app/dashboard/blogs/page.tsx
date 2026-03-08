import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { CalendarDays, Globe, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogActionButtons } from "./BlogActionButtons"

export default async function BlogsPage() {
    const supabase = await createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: blogs } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("dietitian_id", user.id)
        .order("published_at", { ascending: false })

    return (
        <div className="flex-1 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Blog Yazılari</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Görselli ve formatlı yazı oluşturun, dış sitelere anlık yansitin.
                    </p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/dashboard/blogs/new">
                        <Plus className="h-4 w-4" />
                        Yeni Blog
                    </Link>
                </Button>
            </div>

            {!blogs || blogs.length === 0 ? (
                <div className="rounded-xl border shadow-sm bg-card p-12 text-center text-muted-foreground">
                    Henüz blog yazısı yok.
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {blogs.map((blog) => (
                        <article key={blog.id} className="rounded-xl border bg-card overflow-hidden shadow-sm">
                            <div className="aspect-video w-full bg-muted/20">
                                {blog.cover_image_url ? (
                                    <img
                                        src={blog.cover_image_url}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                                        Kapak görseli yok
                                    </div>
                                )}
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold line-clamp-2">{blog.title}</h3>
                                    <BlogActionButtons blogId={blog.id} isPublic={blog.is_public} />
                                </div>
                                {blog.excerpt && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">{blog.excerpt}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                                    <div className="flex items-center gap-1">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {new Date(blog.published_at || blog.created_at).toLocaleDateString("tr-TR")}
                                    </div>
                                    <Badge variant={blog.is_public ? "secondary" : "outline"} className="gap-1">
                                        <Globe className="h-3 w-3" />
                                        {blog.is_public ? "Yayında" : "Gizli"}
                                    </Badge>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

