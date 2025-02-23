"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: string
  username: string
  password: string
}

const users: User[] = [
  { id: "1", username: "user1", password: "password1" },
  { id: "2", username: "user2", password: "password2" },
  { id: "3", username: "user3", password: "password3" },
]

interface AuthProps {
  onLogin: (user: User) => void
}

export function Auth({ onLogin }: AuthProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    const user = users.find((u) => u.username === username && u.password === password)
    if (user) {
      onLogin(user)
    } else {
      setError("שם משתמש או סיסמה שגויים")
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-right">התחברות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="שם משתמש"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-right"
          />
          <Input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-right"
          />
          <Button onClick={handleLogin} className="w-full">
            התחבר
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

