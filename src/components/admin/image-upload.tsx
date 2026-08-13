"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  /** Initial image URL (edit mode). */
  value?: string | null
  /** Called when upload completes with URL + real dimensions from Cloudinary. */
  onChange: (result: { imagen_url: string; imagen_width: number; imagen_height: number } | null) => void
  folder?: string
  maxSizeMB?: number
}

interface CloudinaryUploadResult {
  secure_url: string
  url: string
  width: number
  height: number
  [key: string]: unknown
}

export function ImageUpload({
  value,
  onChange,
  folder = "luisardito-shop/productos",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
    if (!validTypes.includes(file.type)) {
      setError("Use JPG, PNG, WEBP, GIF, or AVIF")
      return false
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Max size: ${maxSizeMB}MB`)
      return false
    }
    setError(null)
    return true
  }

  const startUpload = async (file: File) => {
    if (!validateFile(file)) return
    setIsUploading(true)
    setProgress(0)
    setError(null)

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary not configured")
      setIsUploading(false)
      return
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", folder)

    try {
      // Use XHR for progress tracking
      const res = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", endpoint)
        xhr.onload = () => {
          try {
            resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult)
          } catch {
            reject(new Error("Invalid Cloudinary response"))
          }
        }
        xhr.onerror = () => reject(new Error("Upload failed"))
        if (xhr.upload) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100))
            }
          }
        }
        xhr.send(formData)
      })

      const url = res.secure_url || res.url
      setPreview(url)
      // Capture real dimensions from Cloudinary's response — this is the key
      // piece the legacy frontend threw away.
      onChange({
        imagen_url: url,
        imagen_width: res.width,
        imagen_height: res.height,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) startUpload(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUploading) setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) startUpload(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onChange(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className="flex items-center gap-3">
          {/* Compact thumbnail — the live preview on the right shows the full image */}
          <div className="size-12 shrink-0 overflow-hidden rounded-sm border border-border bg-secondary">
            <Image
              src={preview}
              alt="Uploaded"
              width={48}
              height={48}
              className="size-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 rounded-full border border-border bg-secondary px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <X className="size-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border-2 border-dashed p-5 text-center transition-colors",
            isDragging ? "border-gold bg-gold/5" : "border-border bg-secondary hover:border-muted-foreground",
            isUploading && "cursor-not-allowed opacity-60",
          )}
        >
          <Upload className="size-5 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">Click to upload</span>
          <span className="text-[12px] text-muted-foreground">or drag and drop</span>
          <span className="text-[11px] text-muted-foreground">
            JPG, PNG, WEBP, GIF, AVIF. Max {maxSizeMB}MB
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />

      {isUploading && (
        <div className="pt-1">
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">{progress}%</p>
        </div>
      )}

      {error && (
        <p className="text-[12px] text-destructive">{error}</p>
      )}
    </div>
  )
}
