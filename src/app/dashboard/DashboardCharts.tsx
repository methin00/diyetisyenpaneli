"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
    { name: "Pzt", yeni: 4, randevu: 6 },
    { name: "Sal", yeni: 3, randevu: 8 },
    { name: "Çar", yeni: 2, randevu: 4 },
    { name: "Per", yeni: 5, randevu: 7 },
    { name: "Cum", yeni: 6, randevu: 9 },
    { name: "Cmt", yeni: 1, randevu: 3 },
    { name: "Paz", yeni: 0, randevu: 1 },
]

export function DashboardCharts() {
    return (
        <Card className="col-span-full border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Haftalık Aktivite Özeti</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                cursor={{ fill: "hsl(var(--muted))" }}
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid hsl(var(--border))",
                                    backgroundColor: "hsl(var(--background))",
                                    color: "hsl(var(--foreground))"
                                }}
                            />
                            <Bar dataKey="randevu" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Görüşme" />
                            <Bar dataKey="yeni" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Yeni Kayıt" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
