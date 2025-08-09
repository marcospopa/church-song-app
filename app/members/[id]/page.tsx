"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { membersApi } from "@/lib/database"
import type { Member } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const availableInstruments = [
  "Vocals",
  "Piano",
  "Keyboard",
  "Electric Guitar",
  "Acoustic Guitar",
  "Bass Guitar",
  "Drums",
  "Percussion",
  "Violin",
  "Cello",
  "Flute",
  "Trumpet",
  "Saxophone",
  "Clarinet",
  "Sound Tech",
  "Lighting",
]

export default function MemberDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    notes: "",
    instruments: [] as string[],
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await membersApi.getById(params.id)
      if (data) {
        setMember(data)
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          role: data.role || "",
          status: data.status || "active",
          notes: data.notes || "",
          instruments: data.instruments || [],
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const updateField = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInstrument = (inst: string) => {
    updateField(
      "instruments",
      form.instruments.includes(inst) ? form.instruments.filter((i) => i !== inst) : [...form.instruments, inst],
    )
  }

  const save = async () => {
    if (!member) return
    setSaving(true)
    try {
      await membersApi.update(member.id, {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: form.role || null,
        instruments: form.instruments.length ? form.instruments : null,
        status: form.status,
        notes: form.notes || null,
      })
      router.push("/members")
    } catch (e) {
      console.error("Failed to save member:", e)
      alert("No se pudo guardar el miembro.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!member) return
    try {
      await membersApi.delete(member.id)
      router.push("/members")
    } catch (e) {
      console.error("Failed to delete member:", e)
      alert("No se pudo eliminar el miembro.")
    }
  }

  if (loading) return <div className="p-6">Cargando miembro...</div>
  if (!member) return <div className="p-6">Miembro no encontrado.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar miembro</h1>
          <p className="text-muted-foreground">ID: {member.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Eliminar</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar este miembro?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del miembro</CardTitle>
          <CardDescription>Edita y guarda los cambios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => updateField("role", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el rol" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Worship Leader",
                    "Assistant Worship Leader",
                    "Vocalist",
                    "Guitarist",
                    "Pianist",
                    "Drummer",
                    "Bassist",
                    "Sound Technician",
                    "Team Member",
                  ].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instrumentos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableInstruments.map((inst) => (
                <label key={inst} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.instruments.includes(inst)} onCheckedChange={() => toggleInstrument(inst)} />
                  {inst}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {form.instruments.map((i) => (
                <Badge key={i} variant="secondary">
                  {i}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              className="min-h-[120px]"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
