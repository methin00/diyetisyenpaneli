"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bold, Heading2, ImageIcon, Italic, Link2, List, Loader2, Underline } from "lucide-react"
import { toast } from "sonner"
import { createBlogPost } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function NewBlogForm() {
    const router = useRouter()
    const editorRef = useRef<HTMLDivElement | null>(null)

    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [contentHtml, setContentHtml] = useState("<p>Yazı içeriğini buraya yazın...</p>")
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const previewUrl = useMemo(() => {
        if (!coverImage) return ""
        return URL.createObjectURL(coverImage)
    }, [coverImage])

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML.trim()) {
            editorRef.current.innerHTML = contentHtml
        }
    }, [contentHtml])

    const syncEditorContent = () => {
        if (!editorRef.current) return
        setContentHtml(editorRef.current.innerHTML)
    }

    const applyCommand = (command: string, value?: string) => {
        if (!editorRef.current) return
        editorRef.current.focus()
        document.execCommand(command, false, value)
        syncEditorContent()
    }

    const handleInsertLink = () => {
        const url = window.prompt("Link adresini girin (https://...)")
        if (!url) return
        applyCommand("createLink", url)
    }

    const handleSubmit = async () => {
        const plainText = editorRef.current?.innerText?.trim() || ""

        if (!title.trim()) {
            toast.error("Başlık zorunludur.")
            return
        }
        if (!plainText) {
            toast.error("Blog içeriği zorunludur.")
            return
        }

        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("title", title)
            if (excerpt.trim()) formData.append("excerpt", excerpt.trim())
            formData.append("contentHtml", contentHtml)
            formData.append("isPublic", isPublic ? "true" : "false")
            if (coverImage) formData.append("coverImage", coverImage)

            const result = await createBlogPost(formData)
            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Blog yazısı oluşturuldu.")
            router.push("/dashboard/blogs")
        } catch {
            toast.error("Blog yazısı kaydedilemedi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/blogs">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Yeni Blog Yazısı</h2>
                        <p className="text-sm text-muted-foreground">
                            Görsel yükleyin, metni formatlayın ve web&apos;de yayınlayın.
                        </p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Kaydediliyor
                        </>
                    ) : (
                        "Yazıyı Kaydet"
                    )}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-xl border bg-card p-5 space-y-4">
                        <div className="space-y-2">
                            <Label>Başlık *</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Örn: Ramazanda Sağlıklı Beslenme Rehberi"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Kısa Özet</Label>
                            <Textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                placeholder="Liste ekranlarında gözükecek kısa açıklama."
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 space-y-4">
                        <Label>İçerik *</Label>
                        <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-muted/20">
                            <Button type="button" size="sm" variant="outline" onClick={() => applyCommand("bold")}>
                                <Bold className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => applyCommand("italic")}>
                                <Italic className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => applyCommand("underline")}>
                                <Underline className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => applyCommand("formatBlock", "h2")}>
                                <Heading2 className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => applyCommand("insertUnorderedList")}>
                                <List className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={handleInsertLink}>
                                <Link2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div
                            ref={editorRef}
                            className="min-h-[300px] rounded-md border bg-background p-4 focus:outline-none"
                            contentEditable
                            suppressContentEditableWarning
                            onInput={syncEditorContent}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-5 space-y-3">
                        <Label htmlFor="coverImage">Kapak Görseli</Label>
                        <Input
                            id="coverImage"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                        />
                        {previewUrl ? (
                            <img src={previewUrl} alt="Kapak ön izleme" className="w-full aspect-video object-cover rounded-md border" />
                        ) : (
                            <div className="w-full aspect-video rounded-md border bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Kapak görseli seçilmedi
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Web&apos;de Yayınla</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Açıksa API key ile dış sitelerde de görünür.
                                </p>
                            </div>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

