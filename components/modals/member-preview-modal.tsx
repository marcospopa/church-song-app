"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { membersApi } from "@/lib/database"
import type { Member } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil } from "lucide-react"

type Props = {
  open?: boolean
  memberId?: string | null
  onOpenChange?: (open: boolean) => void
}

export default function MemberPreviewModal({ open = false, memberId = null, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState<Member | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!open || !memberId) return
      setLoading(true)
      const data = await membersApi.getById(memberId)
      if (active) setMember(data)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [open, memberId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Vista de miembro</DialogTitle>
          <DialogDescription>Detalle rápido del miembro seleccionado</DialogDescription>
        </DialogHeader>

        {loading && <div className="p-4 text-sm text-muted-foreground">Cargando...</div>}

        {!loading && !member && <div className="p-4 text-sm">No se encontró el miembro.</div>}

        {!loading && member && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                  {member.role && <Badge variant="outline">{member.role}</Badge>}
                </div>
              </div>
              <Button asChild>
                <Link href={`/members/${member.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Teléfono:</span> {member.phone || "-"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Ingreso:</span> {member.join_date || "-"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Instrumentos:</span>{" "}
                  {member.instruments?.length ? (
                    <span className="inline-flex flex-wrap gap-1">
                      {member.instruments.map((i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {i}
                        </Badge>
                      ))}
                    </span>
                  ) : (
                    "-"
                  )}
                </div>
                {member.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notas:</span> {member.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
