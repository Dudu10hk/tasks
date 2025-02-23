import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) => {
  return <img ref={ref} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium", className)}
        {...props}
      />
    )
  },
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
export type { AvatarImageProps as AvatarProps }

