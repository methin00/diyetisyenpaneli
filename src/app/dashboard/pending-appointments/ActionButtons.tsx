"use client"

import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { updateAppointmentStatus } from "../actions"
import { useTransition } from "react"
import { toast } from "sonner"

export function AppointmentActionButtons({ appointmentId }: { appointmentId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleUpdate = (status: 'confirmed' | 'cancelled') => {
        startTransition(async () => {
            const result = await updateAppointmentStatus(appointmentId, status)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(status === 'confirmed' ? "Randevu onaylandı." : "Randevu reddedildi.")
            }
        })
    }

    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleUpdate('cancelled')}
                disabled={isPending}
            >
                <X className="h-4 w-4 mr-1" /> Reddet
            </Button>
            <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleUpdate('confirmed')}
                disabled={isPending}
            >
                <Check className="h-4 w-4 mr-1" /> Onayla
            </Button>
        </div>
    )
}
