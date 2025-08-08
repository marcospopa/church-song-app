"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, Church, Bell, Mail, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your worship team management preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Church Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Church className="h-5 w-5" />
              Church Information
            </CardTitle>
            <CardDescription>Basic information about your church</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="church-name">Church Name</Label>
                <Input id="church-name" defaultValue="Grace Community Church" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastor-name">Pastor Name</Label>
                <Input id="pastor-name" defaultValue="Rev. John Smith" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="church-address">Address</Label>
              <Textarea id="church-address" defaultValue="123 Main Street, Anytown, ST 12345" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="church-phone">Phone</Label>
                <Input id="church-phone" defaultValue="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-email">Email</Label>
                <Input id="church-email" type="email" defaultValue="info@gracechurch.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about schedule changes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reminder Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders before services and rehearsals
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Song Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when new songs are added to the database
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Default Settings</CardTitle>
            <CardDescription>Set default values for new items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-key">Default Song Key</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-tempo">Default Tempo (BPM)</Label>
                <Input id="default-tempo" type="number" defaultValue="120" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-duration">Default Service Duration (minutes)</Label>
              <Input id="service-duration" type="number" defaultValue="25" />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Backup and restore your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup your data weekly
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex gap-4">
              <Button variant="outline">
                Export All Data
              </Button>
              <Button variant="outline">
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
