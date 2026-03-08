"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AttendanceButtons } from "./AttendanceButtons"

type Appointment = {
    id: string
    date: string
    time: string
    clientName: string
    status: "pending" | "confirmed" | "cancelled" | "completed" | string
    attendance_status?: "unknown" | "attended" | "not_attended" | string
}

function getStatusLabel(status: Appointment["status"]) {
    if (status === "confirmed") return "Onaylı"
    if (status === "pending") return "Beklemede"
    if (status === "completed") return "Tamamlandı"
    if (status === "cancelled") return "İptal"
    return status
}

function getAttendanceLabel(status: Appointment["attendance_status"]) {
    if (status === "attended") return "Katıldı"
    if (status === "not_attended") return "Katılmadı"
    return "İşaretlenmedi"
}

export function CalendarView({ appointments }: { appointments: Appointment[] }) {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    const selectedDayAppointments = appointments.filter(
        (app) => date && new Date(app.date).toDateString() === date.toDateString()
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 border-0 shadow-sm ring-1 ring-border/50 bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="text-lg">Takvim</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex justify-center py-4">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-0" />
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 border-0 shadow-sm ring-1 ring-border/50 bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <CardTitle className="text-lg">
                        {date
                            ? date.toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                              })
                            : "Tarih Seçin"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {selectedDayAppointments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Bu tarihte randevu bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedDayAppointments.map((app) => {
                                const attendanceStatus =
                                    app.attendance_status === "attended" || app.attendance_status === "not_attended"
                                        ? app.attendance_status
                                        : "unknown"

                                const showAttendanceActions =
                                    app.status === "confirmed" || app.status === "completed"

                                return (
                                    <div
                                        key={app.id}
                                        className="flex flex-col justify-between p-4 border rounded-xl bg-card transition-colors hover:border-primary/50 hover:shadow-sm"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-xl w-20">
                                                    <span className="font-bold text-primary text-lg">
                                                        {app.time.substring(0, 5)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg text-foreground">{app.clientName}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge
                                                            variant={
                                                                app.status === "confirmed"
                                                                    ? "default"
                                                                    : app.status === "pending"
                                                                    ? "secondary"
                                                                    : "outline"
                                                            }
                                                            className={
                                                                app.status === "confirmed"
                                                                    ? "bg-emerald-500 hover:bg-emerald-600 border-none"
                                                                    : app.status === "cancelled"
                                                                    ? "text-destructive border-destructive"
                                                                    : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none"
                                                            }
                                                        >
                                                            {getStatusLabel(app.status)}
                                                        </Badge>

                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                attendanceStatus === "attended"
                                                                    ? "border-emerald-600 text-emerald-700"
                                                                    : attendanceStatus === "not_attended"
                                                                    ? "border-destructive text-destructive"
                                                                    : ""
                                                            }
                                                        >
                                                            {getAttendanceLabel(attendanceStatus)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {showAttendanceActions && (
                                            <AttendanceButtons
                                                appointmentId={app.id}
                                                status={attendanceStatus}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

