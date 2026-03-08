"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

export function VitalsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
                Kayıtlı ölçüm verisi bulunmamaktadır.
            </div>
        )
    }

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        name="Kilo (kg)"
                        stroke="var(--color-primary)"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="fat"
                        name="Yağ Oranı (%)"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="muscle"
                        name="Kas (kg)"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
