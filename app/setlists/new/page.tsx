"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setlistsApi } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewSetlistPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    service_date: "",
    service_type: "",
    status: "draft",
    notes: "",
  })

  const updateField = (field: keyof typeof form, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await setlistsApi.create({
        name: form.name,
        service_date: form.service_date || null,
        service_type: form.service_type || null,
        status: form.status,
        notes: form.notes || null,
        created_by: null,
      })
      router.push("/setlists")
    } catch (e) {
      console.error("Failed to create setlist:", e)
      alert("No se pudo crear el setlist.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuevo setlist</h1>
          <p className="text-muted-foreground">Crea un setlist básico. Podrás agregar canciones después.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del setlist</CardTitle>
          <CardDescription>Completa la información y guarda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input required value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha del servicio</Label>
                <Input
                  type="date"
                  value={form.service_date}
                  onChange={(e) => updateField("service_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de servicio</Label>
                <Select value={form.service_type} onValueChange={(v) => updateField("service_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                    <SelectItem value="Prayer Night">Prayer Night</SelectItem>
                    <SelectItem value="Youth Service">Youth Service</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
