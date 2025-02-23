"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  username: string
  password: string
  avatar?: string
  email: string
  phone: string
  preferredNotification: "email" | "whatsapp" | "none"
}

interface UserManagementProps {
  initialUsers: User[]
  onUpdateUsers: (users: User[]) => void
}

export function UserManagement({ initialUsers, onUpdateUsers }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<User>({
    id: "",
    username: "",
    password: "",
    avatar: "",
    email: "",
    phone: "",
    preferredNotification: "none",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addUser = () => {
    if (newUser.username && newUser.password) {
      const userToAdd = { ...newUser, id: Date.now().toString() }
      const updatedUsers = [...users, userToAdd]
      setUsers(updatedUsers)
      onUpdateUsers(updatedUsers)
      resetForm()
    }
  }

  const updateUser = () => {
    if (editingUser) {
      const updatedUsers = users.map((user) => (user.id === editingUser.id ? editingUser : user))
      setUsers(updatedUsers)
      onUpdateUsers(updatedUsers)
      setEditingUser(null)
    }
  }

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)
    onUpdateUsers(updatedUsers)
  }

  const resetForm = () => {
    setNewUser({
      id: "",
      username: "",
      password: "",
      avatar: "",
      email: "",
      phone: "",
      preferredNotification: "none",
    })
    setEditingUser(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof User) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: e.target.value })
    } else {
      setNewUser({ ...newUser, [field]: e.target.value })
    }
  }

  const handleSelectChange = (value: "email" | "whatsapp" | "none") => {
    if (editingUser) {
      setEditingUser({ ...editingUser, preferredNotification: value })
    } else {
      setNewUser({ ...newUser, preferredNotification: value })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        if (editingUser) {
          setEditingUser({ ...editingUser, avatar: base64String })
        } else {
          setNewUser({ ...newUser, avatar: base64String })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">ניהול משתמשים</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>ניהול משתמשים</DialogTitle>
          <DialogDescription>הוסף, ערוך או מחק משתמשים ועדכן את פרטיהם.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="list" className="flex-grow overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">רשימת משתמשים</TabsTrigger>
            <TabsTrigger value="add">הוסף/ערוך משתמש</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="flex-grow overflow-hidden">
            <Card>
              <CardHeader>
                <CardTitle>רשימת משתמשים</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>תמונה</TableHead>
                        <TableHead>שם משתמש</TableHead>
                        <TableHead>אימייל</TableHead>
                        <TableHead>טלפון</TableHead>
                        <TableHead>העדפת התראות</TableHead>
                        <TableHead>פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.username[0]}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.preferredNotification}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                              ערוך
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteUser(user.id)} className="mr-2">
                              מחק
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="add" className="flex-grow overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>{editingUser ? "ערוך משתמש" : "הוסף משתמש חדש"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">שם משתמש</Label>
                      <Input
                        id="username"
                        value={editingUser ? editingUser.username : newUser.username}
                        onChange={(e) => handleInputChange(e, "username")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">סיסמה</Label>
                      <Input
                        id="password"
                        type="password"
                        value={editingUser ? editingUser.password : newUser.password}
                        onChange={(e) => handleInputChange(e, "password")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingUser ? editingUser.email : newUser.email}
                        onChange={(e) => handleInputChange(e, "email")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">טלפון</Label>
                      <Input
                        id="phone"
                        value={editingUser ? editingUser.phone : newUser.phone}
                        onChange={(e) => handleInputChange(e, "phone")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredNotification">העדפת התראות</Label>
                      <Select
                        value={editingUser ? editingUser.preferredNotification : newUser.preferredNotification}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger id="preferredNotification">
                          <SelectValue placeholder="בחר העדפת התראות" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">אימייל</SelectItem>
                          <SelectItem value="whatsapp">וואטסאפ</SelectItem>
                          <SelectItem value="none">ללא</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avatar">תמונת פרופיל</Label>
                      <Input id="avatar" type="file" ref={fileInputRef} onChange={handleFileChange} />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" onClick={resetForm}>
                      נקה טופס
                    </Button>
                    <Button type="submit" onClick={editingUser ? updateUser : addUser}>
                      {editingUser ? "עדכן משתמש" : "הוסף משתמש"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

