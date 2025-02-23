"use client"

import { useState, useCallback, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Bell, Settings, Paperclip, Mic, Flag, LinkIcon, Trash2, Pencil, Printer } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TaskDialog } from "@/components/task-dialog"
import { Sidebar } from "@/components/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dashboard } from "@/components/dashboard"
import { cn } from "@/lib/utils"
import { GanttCalendar } from "@/components/gantt-calendar"
import { Calendar } from "@/components/ui/calendar"
import { FigmaPreview } from "@/components/figma-preview"
import { AvatarGroup } from "@/components/ui/avatar-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserManagement } from "@/components/user-management"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Login } from "@/components/login"
import { autoSaveService } from "@/services/autoSave"

const initialProjects = [
  {
    id: "project-1",
    name: "Project 1",
    columns: [
      {
        id: "todo",
        title: "Todo",
        tasks: [
          {
            id: "task-1",
            title: "Task 1",
            description: "Description 1",
            dueDate: "2024-03-15",
            progress: 2,
            assignedTo: "user-1",
            category: "Feature",
            priority: "High",
            version: "1.0",
            versionDate: "2024-03-10",
            assignees: [{ id: "user-1", name: "Alice", avatar: "/avatars/1.png" }],
          },
          {
            id: "task-2",
            title: "Task 2",
            description: "Description 2",
            dueDate: "2024-03-20",
            progress: 5,
            assignedTo: "user-2",
            category: "Bug",
            priority: "Mid",
            version: "1.1",
            versionDate: "2024-03-15",
            assignees: [{ id: "user-2", name: "Bob", avatar: "/avatars/2.png" }],
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "task-3",
            title: "Task 3",
            description: "Description 3",
            dueDate: "2024-03-25",
            progress: 7,
            assignedTo: "user-1",
            category: "Enhancement",
            priority: "Low",
            version: "1.2",
            versionDate: "2024-03-20",
            assignees: [{ id: "user-1", name: "Alice", avatar: "/avatars/1.png" }],
          },
        ],
      },
      {
        id: "done",
        title: "Done",
        tasks: [
          {
            id: "task-4",
            title: "Task 4",
            description: "Description 4",
            dueDate: "2024-03-30",
            progress: 10,
            assignedTo: "user-2",
            category: "Feature",
            priority: "High",
            version: "1.3",
            versionDate: "2024-03-25",
            assignees: [{ id: "user-2", name: "Bob", avatar: "/avatars/2.png" }],
          },
        ],
      },
    ],
    figmaUrl: "https://www.figma.com/file/your_figma_file_id",
  },
]

const users = [
  { id: "user-1", username: "Alice", avatar: "/avatars/1.png" },
  { id: "user-2", username: "Bob", avatar: "/avatars/2.png" },
]

type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  progress: number
  assignedTo: string
  category: string
  priority: "High" | "Mid" | "Low"
  version?: string
  versionDate?: string
  attachment?: {
    name: string
    data: string
  }
  audioRecording?: string
  assignees: { id: string; name: string; avatar: string }[]
}

type Column = {
  id: string
  title: string
  tasks: Task[]
}

type Project = {
  id: string
  name: string
  columns: Column[]
  figmaUrl?: string
}

type Notification = {
  id: string
  title: string
  description: string
  timestamp: string
  taskId: string
  projectId: string
  userId: string
}

interface CalendarProps {
  mode: "single"
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

function CalendarComponent({ mode, selected, onSelect }: CalendarProps) {
  return <Calendar mode={mode} selected={selected} onSelect={onSelect} />
}

function getColumnBorderColor(columnId: string) {
  switch (columnId) {
    case "todo":
      return "border-red-500"
    case "in-progress":
      return "border-yellow-500"
    case "done":
      return "border-green-500"
    default:
      return "border-gray-500"
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Feature":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Bug":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "Enhancement":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const initialUsers = [
  {
    id: "user-1",
    username: "Alice",
    avatar: "/avatars/1.png",
    email: "alice@example.com",
    phone: "+972123456789",
    preferredNotification: "email",
  },
  {
    id: "user-2",
    username: "Bob",
    avatar: "/avatars/2.png",
    email: "bob@example.com",
    phone: "+972987654321",
    preferredNotification: "whatsapp",
  },
]

type User = {
  id: string
  username: string
  avatar: string
}

export default function App() {
  const [activeView, setActiveView] = useState<"home" | "board" | "calendar">("home")
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [figmaUrl, setFigmaUrl] = useState("")
  const [user, setUser] = useState<User | null>(null)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotificationsTable, setShowNotificationsTable] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)

  const [users, setUsers] = useState(initialUsers)

  const [isEditing, setIsEditing] = useState(false)
  const [editedProjectName, setEditedProjectName] = useState(activeProject?.name || "")

  const { toast } = useToast()

  useEffect(() => {
    setProjects(initialProjects)
    setActiveProject(initialProjects[0])
  }, [])

  useEffect(() => {
    if (notifications.length > 0) {
      setHasNewNotification(true)
    }
  }, [notifications])

  useEffect(() => {
    // הפעלת שמירה אוטומטית כל 5 דקות
    autoSaveService.startAutoSave(5);

    // ניקוי בעת סגירת האפליקציה
    return () => {
      autoSaveService.stopAutoSave();
    };
  }, []);

  const handleEditProjectName = () => {
    if (isEditing) {
      // Save the edited name
      if (activeProject) {
        const updatedProjects = projects.map((p) => (p.id === activeProject.id ? { ...p, name: editedProjectName } : p))
        setProjects(updatedProjects)
        setActiveProject({ ...activeProject, name: editedProjectName })
      }
    }
    setIsEditing(!isEditing)
  }

  const addNotification = (title: string, taskId: string, projectId: string, userId: string) => {
    const newNotification = {
      id: Math.random().toString(36).substring(7),
      title: title,
      description: `משימה חדשה הוקצתה לך`,
      timestamp: new Date().toISOString(),
      taskId: taskId,
      projectId: projectId,
      userId: userId,
    }
    setNotifications((prevNotifications) => [...prevNotifications, newNotification])
    setHasNewNotification(true)

    // Show a toast notification
    toast({
      title: "התראה חדשה",
      description: title,
    })
  }

  const handleNotify = (userId: string, taskTitle: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      addNotification(`משימה חדשה הוקצתה לך: ${taskTitle}`, "", activeProject?.id || "", userId)
    }
  }

  const handleNotificationClick = () => {
    setShowNotificationsTable(true)
    setHasNewNotification(false)
  }

  const clearNotifications = () => {
    setNotifications([])
    setHasNewNotification(false)
  }

  const handleProjectClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setActiveProject(project)
      setActiveView("board")
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק פרויקט זה?")) {
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      setProjects(updatedProjects)
      setActiveProject(updatedProjects.length > 0 ? updatedProjects[0] : null)
    }
  }

  const addProject = (newProject: Project) => {
    setProjects([...projects, newProject])
  }

  const handleFigmaUrlSubmit = (e: any) => {
    e.preventDefault()
    if (activeProject) {
      const updatedProjects = projects.map((project) =>
        project.id === activeProject.id ? { ...project, figmaUrl: figmaUrl } : project,
      )
      setProjects(updatedProjects)
      setActiveProject({ ...activeProject, figmaUrl: figmaUrl })
    }
  }

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source, draggableId } = result

      if (!destination) {
        return
      }

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return
      }

      if (!activeProject) {
        return
      }

      const startColumn = activeProject.columns.find((column) => column.id === source.droppableId)
      const endColumn = activeProject.columns.find((column) => column.id === destination.droppableId)

      if (!startColumn || !endColumn) {
        return
      }

      const newProjects = [...projects]
      const projectIndex = newProjects.findIndex((p) => p.id === activeProject.id)
      const newProject = { ...newProjects[projectIndex] }
      const startColumnIndex = newProject.columns.findIndex((c) => c.id === startColumn.id)
      const endColumnIndex = newProject.columns.findIndex((c) => c.id === endColumn.id)
      const startTasks = Array.from(startColumn.tasks)
      const endTasks = Array.from(endColumn.tasks)
      const [removed] = startTasks.splice(source.index, 1)

      if (startColumn.id === endColumn.id) {
        endTasks.splice(destination.index, 0, removed)
      } else {
        endTasks.splice(destination.index, 0, removed)
      }

      newProject.columns[startColumnIndex] = { ...startColumn, tasks: startTasks }
      newProject.columns[endColumnIndex] = { ...endColumn, tasks: endTasks }
      newProjects[projectIndex] = newProject

      setProjects(newProjects)
      setActiveProject(newProject)
    },
    [projects, activeProject],
  )

  const HomePage = () => (
    <div>
      <Dashboard
        projects={projects}
        onProjectClick={handleProjectClick}
        onDeleteProject={handleDeleteProject}
        activityLogs={[
          {
            id: "1",
            title: "משימה חדשה",
            description: "נוספה משימה חדשה לפרויקט X",
            timestamp: "2023-06-01 10:00",
          },
          {
            id: "2",
            title: "עדכון סטטוס",
            description: "המשימה Y הועברה לסטטוס 'הושלם'",
            timestamp: "2023-06-02 14:30",
          },
          { id: "3", title: "פרויקט חדש", description: "נוצר פרויקט חדש: Z", timestamp: "2023-06-03 09:15" },
        ]}
      />
    </div>
  )

  const BoardPage = () =>
    activeProject ? (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 overflow-x-auto">
            {activeProject ? (
              <div className="flex flex-col md:flex-row gap-6 min-w-[768px] md:min-w-0">
                {activeProject.columns.map((column) => (
                  <div key={column.id} className="flex-1 min-w-[250px] md:min-w-[300px]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold">
                        {column.title} <span className="mr-2 text-sm text-muted-foreground">{column.tasks.length}</span>
                      </h2>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {column.tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <TaskDialog
                                    columnId={column.id}
                                    task={task}
                                    onSave={(updatedTask) => {
                                      const updatedProjects = [...projects]
                                      const projectIndex = updatedProjects.findIndex((p) => p.id === activeProject.id)
                                      const updatedProject = {
                                        ...updatedProjects[projectIndex],
                                      }
                                      const updatedColumns = updatedProject.columns.map((col) => {
                                        if (col.id === column.id) {
                                          return {
                                            ...col,
                                            tasks: col.tasks.map((t) => {
                                              if (t.id === task.id) {
                                                return {
                                                  ...updatedTask,
                                                  assignees: updatedTask.assignedTo
                                                    .map((userId) => {
                                                      const user = users.find((u) => u.id === userId)
                                                      return user
                                                        ? {
                                                            id: user.id,
                                                            name: user.username,
                                                            avatar: user.avatar,
                                                          }
                                                        : null
                                                    })
                                                    .filter(Boolean),
                                                }
                                              }
                                              return t
                                            }),
                                          }
                                        }
                                        return col
                                      })
                                      updatedProject.columns = updatedColumns
                                      updatedProjects[projectIndex] = updatedProject
                                      setProjects(updatedProjects)
                                      setActiveProject(updatedProject)
                                    }}
                                    users={users}
                                    currentUser={user}
                                    onNotify={handleNotify}
                                    trigger={
                                      <Card className={`cursor-pointer border-2 ${getColumnBorderColor(column.id)}`}>
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start mb-4">
                                            <Badge className={`${getCategoryColor(task.category)} text-xs`}>
                                              {task.category}
                                            </Badge>
                                            <div className="flex items-center space-x-2">
                                              {task.attachment && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Paperclip className="h-4 w-4 cursor-help text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                      {task.attachment.name.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                        <img
                                                          src={task.attachment.data || "/placeholder.svg"}
                                                          alt={task.attachment.name}
                                                          className="max-w-[200px] max-h-32 object-contain"
                                                        />
                                                      ) : (
                                                        <span>{task.attachment.name}</span>
                                                      )}
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                              {task.audioRecording && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Mic className="h-4 w-4 cursor-help text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                      <audio
                                                        controls
                                                        src={task.audioRecording}
                                                        className="max-w-[150px]"
                                                      >
                                                        הדפדפן שלך אינו תומך בתג האודיו.
                                                      </audio>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  if (confirm("האם תרצה למחוק?")) {
                                                    const updatedProjects = projects.map((p) =>
                                                      p.id === activeProject?.id
                                                        ? {
                                                            ...p,
                                                            columns: p.columns.map((col) =>
                                                              col.id === column.id
                                                                ? {
                                                                    ...col,
                                                                    tasks: col.tasks.filter((t) => t.id !== task.id),
                                                                  }
                                                                : col,
                                                            ),
                                                          }
                                                        : p,
                                                    )
                                                    setProjects(updatedProjects)
                                                    if (activeProject) {
                                                      setActiveProject(
                                                        updatedProjects.find((p) => p.id === activeProject.id) || null,
                                                      )
                                                    }
                                                  }
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                              </Button>
                                            </div>
                                          </div>
                                          <h3 className="font-medium text-base mb-2 line-clamp-2">{task.title}</h3>
                                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {task.description}
                                          </p>
                                          <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2">
                                              <AvatarGroup>
                                                {task.assignees.slice(0, 3).map((assignee, index) => (
                                                  <Avatar key={index} className="w-6 h-6 border-2 border-background">
                                                    <AvatarImage
                                                      src={assignee.avatar || `/api/avatar/${assignee.id}`}
                                                      alt={`Avatar of ${assignee.name}`}
                                                    />
                                                    <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                                                  </Avatar>
                                                ))}
                                                {task.assignees.length > 3 && (
                                                  <Avatar className="w-6 h-6 border-2 border-background">
                                                    <AvatarFallback>+{task.assignees.length - 3}</AvatarFallback>
                                                  </Avatar>
                                                )}
                                              </AvatarGroup>
                                              <span className="text-muted-foreground">
                                                {task.assignees.length}{" "}
                                                {task.assignees.length === 1 ? "משתמש" : "משתמשים"}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-muted-foreground">
                                              <Flag
                                                className={cn(
                                                  "h-4 w-4",
                                                  task.priority === "High"
                                                    ? "text-red-500"
                                                    : task.priority === "Mid"
                                                      ? "text-yellow-500"
                                                      : "text-green-500",
                                                )}
                                              />
                                              <span>{task.dueDate}</span>
                                            </div>
                                          </div>
                                          <div className="flex justify-between items-center text-xs mt-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <span className="cursor-help text-muted-foreground">
                                                    {task.version ? `v${task.version}` : "No version"}
                                                  </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>גרסה: {task.version}</p>
                                                  <p>תאריך: {task.versionDate}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            <Badge
                                              variant={
                                                task.priority === "High"
                                                  ? "destructive"
                                                  : task.priority === "Mid"
                                                    ? "default"
                                                    : "secondary"
                                              }
                                            >
                                              {task.priority}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <TaskDialog
                            columnId={column.id}
                            onSave={(newTask) => {
                              const updatedProjects = [...projects]
                              const projectIndex = updatedProjects.findIndex((p) => p.id === activeProject.id)
                              const updatedProject = { ...updatedProjects[projectIndex] }
                              const updatedColumns = updatedProject.columns.map((col) => {
                                if (col.id === column.id) {
                                  return {
                                    ...col,
                                    tasks: [...col.tasks, newTask],
                                  }
                                }
                                return col
                              })
                              updatedProject.columns = updatedColumns
                              updatedProjects[projectIndex] = updatedProject
                              setProjects(updatedProjects)
                              setActiveProject(updatedProject)
                            }}
                            users={users}
                            currentUser={user}
                            onNotify={handleNotify}
                          />
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg text-muted-foreground">בחר פרויקט או צור פרויקט חדש כדי להתחיל</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleFigmaUrlSubmit} className="mt-6 mb-4 flex flex-col sm:flex-row gap-2">
          <Input
            type="url"
            placeholder="הכנס קישור Figma"
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="w-full sm:w-auto">
            <LinkIcon className="w-4 h-4 mr-2" />
            טען Figma
          </Button>
        </form>

        {activeProject.figmaUrl && (
          <div className="mt-6">
            <FigmaPreview url={activeProject.figmaUrl} />
          </div>
        )}
      </DragDropContext>
    ) : (
      <div>No active project selected.</div>
    )

  const CalendarPage = () => (
    <GanttCalendar
      tasks={projects.flatMap((project) =>
        project.columns.flatMap((column) =>
          column.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            startDate: new Date(),
            endDate: new Date(task.dueDate),
            progress: task.progress * 10,
            status:
              column.id === "todo"
                ? "draft"
                : column.id === "in-progress"
                  ? "in-progress"
                  : column.id === "done"
                    ? "done"
                    : "editing",
            assignee: {
              name: users.find((u) => u.id === task.assignedTo)?.username || "Unassigned",
              avatar: `/api/avatar/${task.assignedTo}`,
            },
          })),
        ),
      )}
    />
  )

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    // כאן אתה יכול להוסיף לוגיקה נוספת שתתבצע לאחר ההתחברות
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-background overflow-hidden print:block print:overflow-visible"
      dir="rtl"
    >
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        addProject={addProject}
        setActiveView={setActiveView}
        activeView={activeView}
        className="print:hidden"
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 print:overflow-visible print:bg-white">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center">
            {activeView === "board" && activeProject ? (
              <>
                {isEditing ? (
                  <Input
                    value={editedProjectName}
                    onChange={(e) => setEditedProjectName(e.target.value)}
                    className="text-2xl font-bold mr-2"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-2xl font-bold mr-2">{activeProject.name}</h1>
                )}
                <Button variant="ghost" size="sm" onClick={handleEditProjectName} className="p-1">
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <h1 className="text-2xl font-bold">{activeView === "home" ? "דף הבית" : "לוח שנה"}</h1>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => window.print()} title="הדפס את המסך הנוכחי">
              <Printer className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
                  <Bell className="h-5 w-5" />
                  {hasNewNotification && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>התראות</span>
                  <Button variant="ghost" size="sm" onClick={clearNotifications}>
                    נקה הכל
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">אין התראות חדשות</div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>הגדרות</DialogTitle>
                </DialogHeader>
                <UserManagement
                  initialUsers={users}
                  onUpdateUsers={(updatedUsers) => {
                    setUsers(updatedUsers)
                  }}
                />
              </DialogContent>
            </Dialog>

            <Avatar>
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 md:p-6 h-[calc(100vh-4rem)] overflow-y-auto print:h-auto print:overflow-visible">
          {activeView === "home" && <HomePage />}
          {activeView === "board" && <BoardPage />}
          {activeView === "calendar" && <CalendarPage />}

          {showNotificationsTable && (
            <Dialog open={showNotificationsTable} onOpenChange={setShowNotificationsTable}>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>התראות</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>כותרת</TableHead>
                      <TableHead>תיאור</TableHead>
                      <TableHead>תאריך</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>{notification.title}</TableCell>
                        <TableCell>{notification.description}</TableCell>
                        <TableCell>{new Date(notification.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  )
}

