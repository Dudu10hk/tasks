"use client"

import * as React from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile?: File | null
}

export function FileUpload({ onFileSelect, onFileRemove, selectedFile }: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        {selectedFile ? "Change File" : "Upload File"}
      </Button>
      {selectedFile && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onFileRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

