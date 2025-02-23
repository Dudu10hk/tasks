"\"use client"
import { format, addDays, startOfWeek, endOfWeek } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  startDate: Date
  endDate: Date
  progress: number
  status: "draft" | "in-progress" | "editing" | "done"
  assignee: {
    name: string
    avatar: string
  }
}

interface GanttCalendarProps {
  tasks: Task[]
}

export function GanttCalendar({ tasks }: GanttCalendarProps) {
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "draft":
        return "bg-blue-500"
      case "in-progress":
        return "bg-purple-500"
      case "editing":
        return "bg-pink-500"
      case "done":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEfficiencyColor = (progress: number) => {
    if (progress >= 80) return "text-green-500"
    if (progress >= 60) return "text-blue-500"
    if (progress >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = []
      }
      acc.status.push(task)
      return acc
    },
    { draft: [], "in-progress": [], editing: [], done: [] } as Record<Task["status"], Task[]>,
  )

  const completedTasks = tasks.filter((task) => task.status === "done")
  const totalEfficiency = Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
      <div className="md:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-7 gap-px">
                {days.map((day) => (
                  <div key={day.toString()} className="text-center p-2 text-sm font-medium">
                    {format(day, "dd")}
                  </div>
                ))}
              </div>
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div key={status} className="space-y-2">
                  {statusTasks.map((task) => (
                    <div key={task.id} className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">
                          {status.replace("-", " ")}
                        </Badge>
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <div className="h-8 relative">
                        <div
                          className={cn(
                            "absolute h-full rounded-full opacity-90 transition-all",
                            getStatusColor(task.status),
                          )}
                          style={{
                            width: `${task.progress}%`,
                            left: "0",
                          }}
                        >
                          <div className="flex items-center h-full px-3">
                            <span className="text-white text-sm font-medium">{task.progress}%</span>
                          </div>
                        </div>
                        <Avatar className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksByStatus.draft?.map((task) => (
                <div key={task.id} className="p-2 bg-blue-50 rounded-lg mb-2">
                  <div className="text-sm font-medium mb-1">{task.title}</div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksByStatus["in-progress"]?.map((task) => (
                <div key={task.id} className="p-2 bg-purple-50 rounded-lg mb-2">
                  <div className="text-sm font-medium mb-1">{task.title}</div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Editing</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksByStatus.editing?.map((task) => (
                <div key={task.id} className="p-2 bg-pink-50 rounded-lg mb-2">
                  <div className="text-sm font-medium mb-1">{task.title}</div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Done</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksByStatus.done?.map((task) => (
                <div key={task.id} className="p-2 bg-yellow-50 rounded-lg mb-2">
                  <div className="text-sm font-medium mb-1">{task.title}</div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
                const efficiency =
                  Math.round(statusTasks.reduce((sum, task) => sum + task.progress, 0) / statusTasks.length) || 0
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status.replace("-", " ")}</span>
                      <span className={getEfficiencyColor(efficiency)}>{efficiency}%</span>
                    </div>
                    <Progress value={efficiency} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={cn("h-8 w-2 rounded-full", getStatusColor(status as Task["status"]))} />
                  <div>
                    <div className="text-sm font-medium capitalize">{status.replace("-", " ")}</div>
                    <div className="text-2xl font-bold">{statusTasks.length}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
\
"

