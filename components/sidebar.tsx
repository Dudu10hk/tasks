"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import {
  PlusCircle,
  Search,
  Home,
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Menu,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProjectDialog } from "@/components/project-dialog"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Notes } from "@/components/notes"
import { ChevronDown } from "lucide-react"

interface Project {
  id: string
  name: string
  columns: any[]
}

interface SidebarProps {
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project) => void
  addProject: (project: Project) => void
  setActiveView: (view: string) => void
  activeView: string
}

interface MenuItem {
  id: string
  title: string
  icon: React.ElementType
  onClick: () => void
}

export function Sidebar({
  projects,
  activeProject,
  setActiveProject,
  addProject: addProjectProp,
  setActiveView,
  activeView,
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const defaultMenuItems: MenuItem[] = [
    { id: "home", title: "דף הבית", icon: Home, onClick: () => setActiveView("home") },
    { id: "board", title: "המשימות שלי", icon: LayoutDashboard, onClick: () => setActiveView("board") },
    { id: "calendar", title: "לוח שנה", icon: Calendar, onClick: () => setActiveView("calendar") },
  ]

  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems)

  useEffect(() => {
    const savedMenuItems = localStorage.getItem("menuItems")
    if (savedMenuItems) {
      setMenuItems(JSON.parse(savedMenuItems))
    }

    // Set the initial active view to "home"
    setActiveView("home")
  }, [setActiveView])

  const saveMenuItems = (items: MenuItem[]) => {
    localStorage.setItem("menuItems", JSON.stringify(items))
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const newMenuItems = Array.from(menuItems)
    const [reorderedItem] = newMenuItems.splice(result.source.index, 1)
    newMenuItems.splice(result.destination.index, 0, reorderedItem)

    setMenuItems(newMenuItems)
    saveMenuItems(newMenuItems)
  }

  const addProject = useCallback(
    (newProject: Project) => {
      addProjectProp(newProject)
      setActiveProject(newProject)
    },
    [addProjectProp, setActiveProject],
  )

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg" />
          <span className={`font-semibold text-lg ${isCollapsed ? "hidden" : ""}`}>ניהול פרויקטים</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש"
            className="w-full pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="menu">
            {(provided) => (
              <nav {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 text-right">
                {menuItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center"
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            `sidebar-item text-sm ${isCollapsed ? "px-0" : ""} flex-grow justify-start`,
                            activeView === item.id && "active",
                          )}
                          onClick={() => {
                            item.onClick()
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <item.icon className="w-4 h-4 ml-2" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Button>
                        {!isCollapsed && <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </nav>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="mt-8 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isCollapsed ? "hidden" : ""}`}>פרויקטים</span>
          <ProjectDialog onSave={addProject}>
            <Button variant="ghost" size="sm">
              <PlusCircle className="w-4 h-4" />
            </Button>
          </ProjectDialog>
        </div>
        {filteredProjects.length === 0 && (
          <div className={`text-sm text-muted-foreground p-2 ${isCollapsed ? "hidden" : ""}`}>
            לא נמצאו פרויקטים תואמים
          </div>
        )}
        <div className="space-y-2">
          {filteredProjects.map((project) => (
            <div key={project.id} className="space-y-1">
              <Button
                variant={activeProject?.id === project.id ? "secondary" : "ghost"}
                className={`w-full justify-between items-center ${isCollapsed ? "px-2" : "px-4"} ${
                  activeProject?.id === project.id ? "bg-accent font-semibold" : ""
                }`}
                onClick={() => {
                  setActiveProject(project)
                  setActiveView("board")
                  if (activeProject?.id !== project.id) {
                    setExpandedProjects([...expandedProjects, project.id])
                  }
                  toggleProjectExpansion(project.id)
                  setIsMobileMenuOpen(false)
                }}
              >
                <span className="truncate flex-grow text-right" title={project.name}>
                  {project.name.length > 20 ? `${project.name.substring(0, 20)}...` : project.name}
                </span>
                {!isCollapsed &&
                  (expandedProjects.includes(project.id) ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  ))}
              </Button>
              {!isCollapsed && expandedProjects.includes(project.id) && (
                <div className="pl-4 space-y-1">
                  {project.columns.map((column) => (
                    <Button key={column.id} variant="ghost" size="sm" className="w-full justify-between text-sm">
                      <span>{column.title}</span>
                      <span className="text-muted-foreground">{column.tasks.length}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-8">
          <Notes />
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
          <div className="h-full overflow-y-auto py-6 px-4">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        } border-l bg-card p-4 flex-col lg:h-screen lg:overflow-y-auto`}
      >
        <SidebarContent />
      </div>
    </>
  )
}

