"use client"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

import * as React from "react"
import { Plus, Check, ChevronsUpDown, Paperclip } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { AudioRecorder } from "./audio-recorder"
import { FileUpload } from "./file-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface ScheduledTask {
  projectName: string
  taskName: string
  dueDate: Date
}

interface User {
  id: string
  username: string
  avatar: string
  email: string
  phone: string
  preferredNotification: "email" | "whatsapp" | "none"
}

interface TaskDialogProps {
  columnId: string
  onSave: (task: any) => void
  task?: any
  trigger?: React.ReactNode
  users: User[]
  currentUser: { id: string; username: string }
  onNotify: (userId: string, taskTitle: string) => void
}

interface CalendarProps {
  mode: "single"
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

function CalendarComponent({ mode, selected, onSelect }: CalendarProps) {
  return <Calendar mode={mode} selected={selected} onSelect={onSelect} />
}

export function TaskDialog({ columnId, onSave, task, trigger, users, currentUser, onNotify }: TaskDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState(task?.title || "")
  const [description, setDescription] = React.useState(task?.description || "")
  const [category, setCategory] = React.useState(task?.category || "")
  const [categories, setCategories] = React.useState<string[]>([
    "Design",
    "Copywriting",
    "Illustration",
    "UI Design",
    "Research",
  ])
  const [priority, setPriority] = React.useState(task?.priority || "Mid")
  const [progress, setProgress] = React.useState(task?.progress || 0)
  const [dueDate, setDueDate] = React.useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined)
  const [assignedTo, setAssignedTo] = React.useState<string[]>(task?.assignedTo || [currentUser.id])
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(task?.audioBlob || null)
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null)
  const [openCombobox, setOpenCombobox] = React.useState(false)
  const [version, setVersion] = React.useState(task?.version || "")
  const [scheduledTasks, setScheduledTasks] = useState<{ projectName: string; taskName: string; dueDate: Date }[]>([])
  const [projectName, setProjectName] = useState("")

  const renderAttachmentPreview = () => {
    if (!attachedFile) return null

    const isImage = attachedFile.name.match(/\.(jpeg|jpg|gif|png)$/i)

    return (
      <div className="mt-2">
        {isImage ? (
          <img
            src={URL.createObjectURL(attachedFile) || "/placeholder.svg"}
            alt={attachedFile.name}
            className="max-w-full h-auto rounded-md"
            style={{ maxHeight: "200px" }}
          />
        ) : (
          <div className="bg-gray-100 p-2 rounded-md text-sm">
            <Paperclip className="h-4 w-4 inline-block mr-2" />
            {attachedFile.name}
          </div>
        )}
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let audioBase64 = null
    if (audioBlob) {
      const reader = new FileReader()
      audioBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(audioBlob)
      })
    }

    let fileBase64 = null
    let fileName = null
    if (attachedFile) {
      const reader = new FileReader()
      fileBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(attachedFile)
      })
      fileName = attachedFile.name
    }

    const updatedTask = {
      id: task?.id || Date.now().toString(),
      title,
      description,
      category,
      priority,
      progress,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
      assignees: assignedTo.map((id) => ({
        avatar: users.find((u) => u.id === id)?.avatar || "/placeholder.svg",
        name: users.find((u) => u.id === id)?.username || "Unknown",
      })),
      createdBy: task?.createdBy || currentUser.id,
      assignedTo,
      audioRecording: audioBase64,
      attachment: fileBase64 ? { data: fileBase64, name: fileName } : null,
      comments: Math.floor(Math.random() * 10), // Simulated comment count
      version,
      versionDate: new Date().toISOString(),
    }

    onSave(updatedTask)

    // שליחת התראות לכל המשתמשים החדשים שהוקצו למשימה
    const newAssignees = assignedTo.filter((id) => !task?.assignedTo?.includes(id))
    for (const userId of newAssignees) {
      onNotify(userId, updatedTask.title)
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full gap-2 hover:bg-primary hover:text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "ערוך את פרטי המשימה הקיימת שלך." : "מלא את הפרטים ליצירת משימה חדשה."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} dir="rtl" className="space-y-6 max-h-[80vh] overflow-y-auto px-6 py-4 text-right">
          <div className="space-y-4">
            <Input
              placeholder="כותרת המשימה"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              required
            />
            <Textarea
              placeholder="הוסף תיאור למשימה"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">קטגוריה</label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {category ? category : "בחר קטגוריה..."}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="חפש קטגוריה..." />
                    <CommandList>
                      <CommandEmpty>לא נמצאה קטגוריה.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            key={cat}
                            onSelect={(currentValue) => {
                              setCategory(currentValue === category ? "" : currentValue)
                              setOpenCombobox(false)
                            }}
                          >
                            <Check className={cn("ml-2 h-4 w-4", category === cat ? "opacity-100" : "opacity-0")} />
                            {cat}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className="p-2 border-t">
                    <Input
                      placeholder="הוסף קטגוריה חדשה"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const newCategory = e.currentTarget.value
                          if (newCategory && !categories.includes(newCategory)) {
                            setCategories([...categories, newCategory])
                            setCategory(newCategory)
                            setOpenCombobox(false)
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">תאריך יעד ופרויקט</label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-[240px]"
                />
                <Input
                  placeholder="שם הפרויקט"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex-grow"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">משימות מתוזמנות</label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>פרויקט</TableHead>
                  <TableHead>משימה</TableHead>
                  <TableHead>תאריך יעד</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledTasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>{task.taskName}</TableCell>
                    <TableCell>{format(task.dueDate, "PPP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">הקצה ל</label>
            <ScrollArea className="h-32">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={assignedTo.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAssignedTo([...assignedTo, user.id])
                      } else {
                        setAssignedTo(assignedTo.filter((id) => id !== user.id))
                      }
                    }}
                  />
                  <label htmlFor={`user-${user.id}`} className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    {user.username}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">התקדמות (0-10)</label>
            <Input
              type="number"
              min="0"
              max="10"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">עדיפות</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">גבוהה</SelectItem>
                <SelectItem value="Mid">בינונית</SelectItem>
                <SelectItem value="Low">נמוכה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">גרסה</label>
            <Input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="לדוגמה: 1.0.0"
              className="w-full"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">קבצים מצורפים</label>
              <FileUpload
                onFileSelect={(file) => setAttachedFile(file)}
                onFileRemove={() => setAttachedFile(null)}
                selectedFile={attachedFile}
              />
            </div>

            {attachedFile && renderAttachmentPreview()}

            <div className="space-y-2">
              <label className="text-sm font-medium">הערה קולית</label>
              <AudioRecorder onRecordingComplete={(blob) => setAudioBlob(blob)} />
            </div>
          </div>

          <div className="flex justify-start gap-2 pt-4 border-t">
            <Button type="submit">{task ? "שמור שינויים" : "צור משימה"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

