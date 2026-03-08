"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { updateAppointmentAttendance } from "../actions"

type AttendanceStatus = "unknown" | "attended" | "not_attended"

export function AttendanceButtons({
    appointmentId,
    status,
}: {
    appointmentId: string
    status: AttendanceStatus
}) {
    const [isPending, startTransition] = useTransition()

    const handleUpdate = (nextStatus: AttendanceStatus) => {
        startTransition(async () => {
            const result = await updateAppointmentAttendance(appointmentId, nextStatus)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Katılım durumu güncellendi.")
            }
        })
    }

    return (
        <div className="flex items-center gap-2 mt-2">
            <Button
                size="sm"
                variant={status === "attended" ? "default" : "outline"}
                className={status === "attended" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                onClick={() => handleUpdate("attended")}
                disabled={isPending}
            >
                Katıldı
            </Button>
            <Button
                size="sm"
                variant={status === "not_attended" ? "default" : "outline"}
                className={status === "not_attended" ? "bg-destructive hover:bg-destructive/90" : ""}
                onClick={() => handleUpdate("not_attended")}
                disabled={isPending}
            >
                Katılmadı
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => handleUpdate("unknown")}
                disabled={isPending}
            >
                Temizle
            </Button>
        </div>
    )
}

