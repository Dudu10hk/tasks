"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MessageSquare, Paperclip, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as React from "react"

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    category: string
    progress: number
    priority: "High" | "Mid" | "Low"
    dueDate: string
    assignees: { avatar: string; name: string }[]
    timeSpent?: number
    timeEstimate?: number
    audioRecording?: string
    attachment?: { data: string; name: string }
    comments?: number
  }
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const getCategoryStyle = (category: string) => {
    const categories: Record<string, string> = {
      Design: "design",
      Copywriting: "copywriting",
      Illustration: "illustration",
      "UI Design": "ui",
      Research: "research",
    }
    return `category-badge ${categories[category] || "design"}`
  }

  const toggleAudio = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [])

  const renderAttachmentPreview = () => {
    if (!task.attachment) return null

    const isImage = task.attachment.name.match(/\.(jpeg|jpg|gif|png)$/i)

    return (
      <div className="mt-2">
        {isImage ? (
          <img
            src={task.attachment.data || "/placeholder.svg"}
            alt={task.attachment.name}
            className="max-w-full h-auto rounded-md"
            style={{ maxHeight: "100px" }}
          />
        ) : (
          <div className="bg-gray-100 p-2 rounded-md text-sm">
            <Paperclip className="h-4 w-4 inline-block mr-2" />
            {task.attachment.name}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="task-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className={getCategoryStyle(task.category)}>{task.category}</div>
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {task.assignees.map((assignee, i) => (
              <Avatar key={i} className="border-2 border-background h-7 w-7">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback>{assignee.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{task.description}</p>

        <div className="space-y-6">
          <Progress value={task.progress * 10} className="h-2" />

          <div className="flex items-center justify-between gap-4">
            <div className="task-metadata">
              <Calendar className="task-metadata-icon" />
              <span>{task.dueDate}</span>
            </div>

            {task.comments && (
              <div className="task-metadata">
                <MessageSquare className="task-metadata-icon" />
                <span>{task.comments}</span>
              </div>
            )}

            {(task.audioRecording || task.attachment) && (
              <div className="task-metadata">
                <Paperclip className="task-metadata-icon" />
                <span>{Number(!!task.audioRecording) + Number(!!task.attachment)}</span>
              </div>
            )}
          </div>

          {(task.audioRecording || task.attachment) && (
            <div className="flex items-center gap-4 pt-4 border-t">
              {task.audioRecording && (
                <div className="flex items-center gap-2">
                  <audio ref={audioRef} src={task.audioRecording} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAudio()
                    }}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: audioRef.current
                          ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              )}
              {task.attachment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement("a")
                    link.href = task.attachment!.data
                    link.download = task.attachment!.name
                    link.click()
                  }}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  {task.attachment.name}
                </Button>
              )}
            </div>
          )}
        </div>
        {task.attachment && renderAttachmentPreview()}
      </CardContent>
    </Card>
  )
}

