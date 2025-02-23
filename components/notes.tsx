"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Notes() {
  const [notes, setNotes] = useState<string[]>([""])

  const addNote = () => {
    setNotes([...notes, ""])
  }

  const updateNote = (index: number, value: string) => {
    const updatedNotes = [...notes]
    updatedNotes[index] = value
    setNotes(updatedNotes)
  }

  const deleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index)
    setNotes(updatedNotes.length > 0 ? updatedNotes : [""])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">הערות</span>
        <Button variant="ghost" size="sm" onClick={addNote}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {notes.map((note, index) => (
            <div key={index} className="bg-yellow-200 p-2 rounded-md shadow-sm relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 left-1 h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                onClick={() => deleteNote(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Textarea
                value={note}
                onChange={(e) => updateNote(index, e.target.value)}
                className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm p-1 text-right"
                dir="rtl"
                style={{ textAlign: "right" }}
                rows={3}
                placeholder="כתוב הערה..."
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

