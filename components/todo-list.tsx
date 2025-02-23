"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export function TodoList({ className }: { className?: string }) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState("")

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now().toString(), text: newTodo, completed: false }])
      setNewTodo("")
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <div className={className}>
      <h3 className="font-semibold mb-2">רשימת משימות</h3>
      <div className="flex mb-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="הוסף משימה חדשה"
          className="flex-grow"
        />
        <Button onClick={addTodo} className="mr-2">
          הוסף
        </Button>
      </div>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox id={todo.id} checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
              <label htmlFor={todo.id} className={`mr-2 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.text}
              </label>
            </div>
            <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

