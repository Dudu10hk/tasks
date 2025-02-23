"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TodoList } from "@/components/todo-list"
import { ActivityHistory } from "@/components/activity-history"
import { Eye, CheckCircle, GripVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PencilIcon, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Project {
  id: string
  name: string
  columns: {
    id: string
    title: string
    tasks: any[]
  }[]
  dueDate?: string
  version?: string
}

interface DashboardProps {
  projects: Project[]
  onProjectClick: (projectId: string) => void
  activityLogs: any[]
  onDeleteProject: (projectId: string) => void
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function Dashboard({ projects, onProjectClick, activityLogs, onDeleteProject }: DashboardProps) {
  const projectStats = projects.reduce(
    (acc, project) => {
      const todoTasks = project.columns.find((col) => col.id === "todo")?.tasks.length || 0
      const inProgressTasks = project.columns.find((col) => col.id === "in-progress")?.tasks.length || 0
      const doneTasks = project.columns.find((col) => col.id === "done")?.tasks.length || 0

      acc.todo += todoTasks
      acc.inProgress += inProgressTasks
      acc.done += doneTasks

      return acc
    },
    { todo: 0, inProgress: 0, done: 0 },
  )

  const pieChartData = [
    { name: "לביצוע", value: projectStats.todo },
    { name: "בתהליך", value: projectStats.inProgress },
    { name: "הושלם", value: projectStats.done },
  ]

  const barChartData = projects.map((project) => ({
    name: project.name,
    todo: project.columns.find((col) => col.id === "todo")?.tasks.length || 0,
    inProgress: project.columns.find((col) => col.id === "in-progress")?.tasks.length || 0,
    done: project.columns.find((col) => col.id === "done")?.tasks.length || 0,
  }))

  const totalTasks = projectStats.todo + projectStats.inProgress + projectStats.done
  const completionRate = totalTasks > 0 ? (projectStats.done / totalTasks) * 100 : 0

  const recentActivity = activityLogs.slice(0, 5) // Get the 5 most recent activities

  // Collect all completed tasks from all projects
  const completedTasks = projects
    .flatMap(
      (project) =>
        project.columns
          .find((col) => col.id === "done")
          ?.tasks.map((task) => ({
            ...task,
            projectName: project.name,
            completionDate: task.completionDate || task.dueDate || new Date().toISOString(), // Fallback to dueDate or current date
          })) || [],
    )
    .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime())

  const [sections, setSections] = useState([
    { id: "summary", title: "סיכום", component: SummarySection },
    { id: "charts", title: "תרשימים", component: ChartsSection },
    { id: "todoAndActivity", title: "מטלות ופעילות", component: TodoAndActivitySection },
    { id: "completedTasks", title: "משימות שהסתיימו", component: CompletedTasksSection },
    { id: "projectsList", title: "רשימת פרויקטים", component: ProjectsListSection },
  ])

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const newSections = Array.from(sections)
    const [reorderedItem] = newSections.splice(result.source.index, 1)
    newSections.splice(result.destination.index, 0, reorderedItem)

    setSections(newSections)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="dashboard">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
            {sections.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="bg-background rounded-lg shadow-md"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="text-gray-400" />
                      </div>
                    </div>
                    <section.component
                      projects={projects}
                      onProjectClick={onProjectClick}
                      activityLogs={activityLogs}
                      onDeleteProject={onDeleteProject}
                      completedTasks={completedTasks}
                      projectStats={projectStats}
                      pieChartData={pieChartData}
                      barChartData={barChartData}
                      totalTasks={totalTasks}
                      completionRate={completionRate}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

function SummarySection({ projectStats, totalTasks, completionRate, projects }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">סך הכל משימות</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-muted-foreground">+20.1% מהחודש שעבר</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">משימות שהושלמו</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats.done}</div>
          <p className="text-xs text-muted-foreground">+180.1% מהחודש שעבר</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">שיעור השלמה</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">+19% מהחודש שעבר</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">פרויקטים פעילים</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projects.length}</div>
          <p className="text-xs text-muted-foreground">+7 פרויקטים חדשים</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ChartsSection({ pieChartData, barChartData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 p-4">
      <Card>
        <CardHeader>
          <CardTitle>סטטוס משימות</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = (percent * 100).toFixed(0)
                  return (
                    <text
                      x={percent < 0.1 ? 0 : percent > 0.9 ? 100 : 50}
                      y={0}
                      fill="#ffffff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        textShadow: "0px 0px 3px rgba(0,0,0,0.75)",
                      }}
                    >
                      {`${name} ${percentage}%`}
                    </text>
                  )
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "4px" }} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry, index) => (
                  <span style={{ color: COLORS[index % COLORS.length] }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>משימות לפי פרויקט</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="todo" name="לביצוע" fill="#0088FE" />
              <Bar dataKey="inProgress" name="בתהליך" fill="#00C49F" />
              <Bar dataKey="done" name="הושלם" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function TodoAndActivitySection({ activityLogs }) {
  const recentActivity = activityLogs.slice(0, 5)
  return (
    <div className="grid gap-4 md:grid-cols-2 p-4">
      <Card>
        <CardHeader>
          <CardTitle>רשימת מטלות</CardTitle>
        </CardHeader>
        <CardContent>
          <TodoList />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>פעילות אחרונה</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHistory activityLogs={recentActivity} />
        </CardContent>
      </Card>
    </div>
  )
}

function CompletedTasksSection({ completedTasks }) {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>משימות שהסתיימו</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם המשימה</TableHead>
              <TableHead>פרויקט</TableHead>
              <TableHead>הוקצה ל</TableHead>
              <TableHead>תאריך סיום</TableHead>
              <TableHead>קטגוריה</TableHead>
              <TableHead>תצוגה מקדימה</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedTasks.slice(0, 5).map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.projectName}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={task.assignees[0]?.avatar} />
                      <AvatarFallback>{task.assignees[0]?.name[0]}</AvatarFallback>
                    </Avatar>
                    {task.assignees[0]?.name}
                  </div>
                </TableCell>
                <TableCell>
                  {task.completionDate ? format(new Date(task.completionDate), "dd/MM/yyyy") : "תאריך לא זמין"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    {task.category}
                  </span>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" align="center" className="w-72 p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          <p className="text-sm">{task.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <p>קטגוריה: {task.category}</p>
                            <p>עדיפות: {task.priority}</p>
                            <p>התקדמות: {task.progress}%</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ProjectsListSection({ projects, onProjectClick, onDeleteProject }) {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>פרויקטים</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">שם הפרויקט</TableHead>
              <TableHead className="w-[15%]">משימות שהושלמו</TableHead>
              <TableHead className="w-[15%]">תאריך סיום</TableHead>
              <TableHead className="w-[15%]">גרסה</TableHead>
              <TableHead className="w-[30%]">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const doneColumn = project.columns.find((col) => col.id === "done")
              const completedTasksCount = doneColumn ? doneColumn.tasks.length : 0
              const totalTasks = project.columns.reduce((sum, col) => sum + col.tasks.length, 0)
              const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0

              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Progress value={progress} className="w-[60px] mr-2" />
                      <span>
                        {completedTasksCount}/{totalTasks}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{project.dueDate || "לא נקבע"}</TableCell>
                  <TableCell>{project.version || "אין גרסה"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            צפה במשימות
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>משימות שהושלמו ב-{project.name}</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[300px] overflow-y-auto">
                            {doneColumn && doneColumn.tasks.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1">
                                {doneColumn.tasks.map((task) => (
                                  <li key={task.id} className="text-sm">
                                    {task.title}
                                    {task.description && (
                                      <span className="text-muted-foreground ml-2">- {task.description}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground">אין משימות שהושלמו בפרויקט זה.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => onProjectClick(project.id)}>
                        <PencilIcon className="w-4 h-4 mr-1" />
                        ערוך
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            מחק
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את הפרויקט?</AlertDialogTitle>
                            <AlertDialogDescription>
                              פעולה זו תמחק את הפרויקט "{project.name}" ואת כל המשימות הקשורות אליו. פעולה זו היא בלתי
                              הפיכה.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteProject(project.id)}>
                              כן, מחק פרויקט
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

