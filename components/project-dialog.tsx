"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogDescription } from "@/components/ui/dialog"

interface ProjectDialogProps {
  children: React.ReactNode
  onSave: (project: any) => void
}

export function ProjectDialog({ children, onSave }: ProjectDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [projectName, setProjectName] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: Date.now().toString(),
      name: projectName,
      columns: [
        { id: "todo", title: "לביצוע", tasks: [] },
        { id: "in-progress", title: "בתהליך", tasks: [] },
        { id: "done", title: "הושלם", tasks: [] },
      ],
    })
    setOpen(false)
    setProjectName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>צור פרויקט חדש</DialogTitle>
          <DialogDescription>הזן את פרטי הפרויקט החדש שלך.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">שם הפרויקט</label>
            <Input
              placeholder="הכנס שם פרויקט"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit">צור פרויקט</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

