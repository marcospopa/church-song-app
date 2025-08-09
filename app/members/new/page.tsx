"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { membersApi } from "@/lib/database"

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

export default function NewMemberPage() {
  const router = useRouter()
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    notes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument) ? prev.filter((i) => i !== instrument) : [...prev, instrument],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("Submitting member payload:", {
      ...formData,
      instruments: selectedInstruments,
      join_date: new Date().toISOString().split("T")[0],
    })

    try {
      await membersApi.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role || null,
        instruments: selectedInstruments.length > 0 ? selectedInstruments : null,
        status: formData.status,
        notes: formData.notes || null,
        join_date: new Date().toISOString().split("T")[0],
        avatar_url: null,
      })

      router.push("/members")
    } catch (error) {
      console.error("Error creating member:", error)
      alert("Error creating member. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Team Member</h1>
        <p className="text-muted-foreground">Add a new member to your worship team</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential member details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role/Position</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Worship Leader">Worship Leader</SelectItem>
                    <SelectItem value="Assistant Worship Leader">Assistant Worship Leader</SelectItem>
                    <SelectItem value="Vocalist">Vocalist</SelectItem>
                    <SelectItem value="Guitarist">Guitarist</SelectItem>
                    <SelectItem value="Pianist">Pianist</SelectItem>
                    <SelectItem value="Drummer">Drummer</SelectItem>
                    <SelectItem value="Bassist">Bassist</SelectItem>
                    <SelectItem value="Sound Technician">Sound Technician</SelectItem>
                    <SelectItem value="Team Member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Instruments & Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Instruments & Skills</CardTitle>
              <CardDescription>Select all instruments and skills this member can contribute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {availableInstruments.map((instrument) => (
                  <div key={instrument} className="flex items-center space-x-2">
                    <Checkbox
                      id={instrument}
                      checked={selectedInstruments.includes(instrument)}
                      onCheckedChange={() => toggleInstrument(instrument)}
                    />
                    <Label htmlFor={instrument} className="text-sm">
                      {instrument}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedInstruments.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Instruments:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedInstruments.map((instrument) => (
                      <Badge key={instrument} variant="secondary" className="flex items-center gap-1">
                        {instrument}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleInstrument(instrument)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any additional information about this team member</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any special notes, availability, or other relevant information..."
              className="min-h-[100px]"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding Member..." : "Add Member"}
          </Button>
        </div>
      </form>
    </div>
  )
}
