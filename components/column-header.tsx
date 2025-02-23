interface ColumnHeaderProps {
  title: string
  count: number
  color?: string
}

export function ColumnHeader({ title, count, color = "bg-gray-100" }: ColumnHeaderProps) {
  return (
    <div className="column-header">
      <h2 className="column-title">
        {title}
        <span className="column-count">{count}</span>
      </h2>
    </div>
  )
}

