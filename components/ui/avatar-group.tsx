import * as React from "react"
import { Avatar, type AvatarProps } from "@/components/ui/avatar"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<AvatarProps>[]
  max?: number
}

export function AvatarGroup({ children, max = 3, ...props }: AvatarGroupProps) {
  const avatars = React.Children.toArray(children).slice(0, max)
  const excess = React.Children.count(children) - max

  return (
    <div {...props} className="flex -space-x-2 rtl:space-x-reverse">
      {avatars}
      {excess > 0 && (
        <Avatar>
          <span className="text-xs font-medium">+{excess}</span>
        </Avatar>
      )}
    </div>
  )
}

