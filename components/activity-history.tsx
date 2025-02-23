import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ActivityLog {
  id: string
  title: string
  description: string
  timestamp: string
}

interface ActivityHistoryProps {
  activityLogs: ActivityLog[]
}

export function ActivityHistory({ activityLogs }: ActivityHistoryProps) {
  if (!activityLogs || activityLogs.length === 0) {
    return <div>אין פעילות להצגה</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">תאריך</TableHead>
          <TableHead>פעולה</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activityLogs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.timestamp}</TableCell>
            <TableCell>
              <div className="font-semibold">{log.title}</div>
              <div className="text-sm text-muted-foreground">{log.description}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

