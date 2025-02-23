"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
}

interface Project {
  id: string
  name: string
  supplierId: string
  totalAmount: number
  startDate: Date
  endDate: Date
  status: "active" | "completed" | "suspended"
}

interface Invoice {
  id: string
  projectId: string
  invoiceNumber: string
  amount: number
  stage: string
  issueDate: Date
  dueDate: Date
  paymentDate: Date | null
  status: "pending" | "paid" | "approved"
}

export default function SupplierPaymentManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const [newSupplier, setNewSupplier] = useState<Supplier>({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
  })

  const [newProject, setNewProject] = useState<Project>({
    id: "",
    name: "",
    supplierId: "",
    totalAmount: 0,
    startDate: new Date(),
    endDate: new Date(),
    status: "active",
  })

  const [newInvoice, setNewInvoice] = useState<Invoice>({
    id: "",
    projectId: "",
    invoiceNumber: "",
    amount: 0,
    stage: "",
    issueDate: new Date(),
    dueDate: new Date(),
    paymentDate: null,
    status: "pending",
  })

  const addSupplier = () => {
    setSuppliers([...suppliers, { ...newSupplier, id: Date.now().toString() }])
    setNewSupplier({ id: "", name: "", contactPerson: "", email: "", phone: "" })
  }

  const addProject = () => {
    setProjects([...projects, { ...newProject, id: Date.now().toString() }])
    setNewProject({
      id: "",
      name: "",
      supplierId: "",
      totalAmount: 0,
      startDate: new Date(),
      endDate: new Date(),
      status: "active",
    })
  }

  const addInvoice = () => {
    setInvoices([...invoices, { ...newInvoice, id: Date.now().toString() }])
    setNewInvoice({
      id: "",
      projectId: "",
      invoiceNumber: "",
      amount: 0,
      stage: "",
      issueDate: new Date(),
      dueDate: new Date(),
      paymentDate: null,
      status: "pending",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ניהול תשלומים לספקים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">ספקים</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>הוסף ספק חדש</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף ספק חדש</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="supplierName">שם הספק</Label>
                      <Input
                        id="supplierName"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">איש קשר</Label>
                      <Input
                        id="contactPerson"
                        value={newSupplier.contactPerson}
                        onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">טלפון</Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      />
                    </div>
                    <Button onClick={addSupplier}>הוסף ספק</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם הספק</TableHead>
                    <TableHead>איש קשר</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>טלפון</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">פרויקטים</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>הוסף פרויקט חדש</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף פרויקט חדש</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">שם הפרויקט</Label>
                      <Input
                        id="projectName"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectSupplier">ספק</Label>
                      <Select
                        value={newProject.supplierId}
                        onValueChange={(value) => setNewProject({ ...newProject, supplierId: value })}
                      >
                        <SelectTrigger id="projectSupplier">
                          <SelectValue placeholder="בחר ספק" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="totalAmount">סכום כולל</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        value={newProject.totalAmount}
                        onChange={(e) => setNewProject({ ...newProject, totalAmount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>תאריך התחלה</Label>
                      <Calendar
                        mode="single"
                        selected={newProject.startDate}
                        onSelect={(date) => date && setNewProject({ ...newProject, startDate: date })}
                      />
                    </div>
                    <div>
                      <Label>תאריך סיום</Label>
                      <Calendar
                        mode="single"
                        selected={newProject.endDate}
                        onSelect={(date) => date && setNewProject({ ...newProject, endDate: date })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectStatus">סטטוס</Label>
                      <Select
                        value={newProject.status}
                        onValueChange={(value: "active" | "completed" | "suspended") =>
                          setNewProject({ ...newProject, status: value })
                        }
                      >
                        <SelectTrigger id="projectStatus">
                          <SelectValue placeholder="בחר סטטוס" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">פעיל</SelectItem>
                          <SelectItem value="completed">הושלם</SelectItem>
                          <SelectItem value="suspended">מוקפא</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addProject}>הוסף פרויקט</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם הפרויקט</TableHead>
                    <TableHead>ספק</TableHead>
                    <TableHead>סכום כולל</TableHead>
                    <TableHead>תאריך התחלה</TableHead>
                    <TableHead>תאריך סיום</TableHead>
                    <TableHead>סטטוס</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{suppliers.find((s) => s.id === project.supplierId)?.name}</TableCell>
                      <TableCell>{project.totalAmount}</TableCell>
                      <TableCell>{format(project.startDate, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(project.endDate, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{project.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">חשבוניות</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>הוסף חשבונית חדשה</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>הוסף חשבונית חדשה</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invoiceProject">פרויקט</Label>
                      <Select
                        value={newInvoice.projectId}
                        onValueChange={(value) => setNewInvoice({ ...newInvoice, projectId: value })}
                      >
                        <SelectTrigger id="invoiceProject">
                          <SelectValue placeholder="בחר פרויקט" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="invoiceNumber">מספר חשבונית</Label>
                      <Input
                        id="invoiceNumber"
                        value={newInvoice.invoiceNumber}
                        onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoiceAmount">סכום</Label>
                      <Input
                        id="invoiceAmount"
                        type="number"
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoiceStage">שלב בפרויקט</Label>
                      <Input
                        id="invoiceStage"
                        value={newInvoice.stage}
                        onChange={(e) => setNewInvoice({ ...newInvoice, stage: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>תאריך הוצאה</Label>
                      <Calendar
                        mode="single"
                        selected={newInvoice.issueDate}
                        onSelect={(date) => date && setNewInvoice({ ...newInvoice, issueDate: date })}
                      />
                    </div>
                    <div>
                      <Label>תאריך תשלום נדרש</Label>
                      <Calendar
                        mode="single"
                        selected={newInvoice.dueDate}
                        onSelect={(date) => date && setNewInvoice({ ...newInvoice, dueDate: date })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoiceStatus">סטטוס</Label>
                      <Select
                        value={newInvoice.status}
                        onValueChange={(value: "pending" | "paid" | "approved") =>
                          setNewInvoice({ ...newInvoice, status: value })
                        }
                      >
                        <SelectTrigger id="invoiceStatus">
                          <SelectValue placeholder="בחר סטטוס" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">ממתין</SelectItem>
                          <SelectItem value="paid">שולם</SelectItem>
                          <SelectItem value="approved">מאושר</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addInvoice}>הוסף חשבונית</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר חשבונית</TableHead>
                    <TableHead>פרויקט</TableHead>
                    <TableHead>סכום</TableHead>
                    <TableHead>שלב</TableHead>
                    <TableHead>תאריך הוצאה</TableHead>
                    <TableHead>תאריך תשלום נדרש</TableHead>
                    <TableHead>תאריך תשלום בפועל</TableHead>
                    <TableHead>סטטוס</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{projects.find((p) => p.id === invoice.projectId)?.name}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>{invoice.stage}</TableCell>
                      <TableCell>{format(invoice.issueDate, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(invoice.dueDate, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{invoice.paymentDate ? format(invoice.paymentDate, "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

