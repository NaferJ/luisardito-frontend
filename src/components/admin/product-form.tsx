"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/admin/image-upload"
import { DesignCard } from "@/components/design-card"
import type { DesignCardData } from "@/components/design-card"
import { createProduct, updateProduct, type ProductFormData } from "@/app/shop/admin/products/actions"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"

interface ProductFormProps {
  mode: "create" | "edit"
  initialData?: Producto
}

/** Generate a URL-safe slug from a name (matches backend logic). */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const AVATAR_COLORS = ["bg-gold-highlight", "bg-gold-bright", "bg-gold-deep", "bg-gray-medium"]

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState(initialData?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? "")
  const [precio, setPrecio] = useState(initialData?.precio ?? 100)
  const [stock, setStock] = useState(initialData?.stock ?? 0)
  const [estado, setEstado] = useState<"publicado" | "borrador">(initialData?.estado ?? "borrador")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug)
  const [imageData, setImageData] = useState<{
    imagen_url: string
    imagen_width: number
    imagen_height: number
  } | null>(
    initialData?.imagen_url
      ? {
          imagen_url: initialData.imagen_url,
          imagen_width: initialData.imagen_width ?? 0,
          imagen_height: initialData.imagen_height ?? 0,
        }
      : null,
  )

  const handleNombreChange = (value: string) => {
    setNombre(value)
    if (autoSlug) setSlug(generateSlug(value))
  }

  // Build a live DesignCardData from the current form state so the preview
  // updates instantly as the admin types.
  const previewCard = useMemo<DesignCardData>(() => {
    const hasDiscount = initialData?.descuento?.tieneDescuento ?? false
    const hasRealDimensions =
      imageData?.imagen_width && imageData?.imagen_height &&
      imageData.imagen_width > 0 && imageData.imagen_height > 0

    return {
      id: "preview",
      image: imageData?.imagen_url ?? "/placeholder.svg",
      alt: nombre || "Product preview",
      aspect: "aspect-[4/3]",
      aspectStyle: hasRealDimensions && imageData
        ? { aspectRatio: `${imageData.imagen_width} / ${imageData.imagen_height}` }
        : undefined,
      avatarColor: AVATAR_COLORS[0],
      badge: hasDiscount ? "star" : undefined,
      tag: hasDiscount ? "Sale" : "Product",
      title: nombre || "Product name",
      author: `${(precio || 0).toLocaleString()} pts`,
      description: descripcion || "Product description",
      timeAgo: stock > 0 ? `${stock} in stock` : "Out of stock",
      impressions: (precio || 0).toLocaleString(),
      outbound: stock,
      source: "Shop",
      category: hasDiscount ? "On Sale" : "Product",
      style: estado,
      color: hasDiscount ? `${initialData?.descuento?.porcentajeDescuento ?? "0"} off` : "—",
      interaction: [`${(precio || 0).toLocaleString()} points`],
      lastRedeemer: null,
    }
  }, [nombre, descripcion, precio, stock, estado, imageData, initialData])

  const submit = (saveAsDraft?: boolean) => {
    setError(null)

    if (!nombre.trim()) {
      setError("Product name is required.")
      return
    }
    if (!descripcion.trim()) {
      setError("Description is required.")
      return
    }
    if (precio <= 0) {
      setError("Price must be greater than 0.")
      return
    }

    const data: ProductFormData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio,
      stock,
      estado: saveAsDraft ? "borrador" : estado,
      slug: slug || undefined,
      ...(imageData?.imagen_url ? {
        imagen_url: imageData.imagen_url,
        imagen_width: imageData.imagen_width,
        imagen_height: imageData.imagen_height,
      } : {}),
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProduct(data)
        } else if (initialData) {
          await updateProduct(String(initialData.id), data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.")
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(false)
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-card px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
  const labelClass = "text-[13px] text-muted-foreground"

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Left: form */}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="flex min-w-0 flex-1 flex-col gap-3"
      >
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        {/* Basic info — full width on top */}
        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4">
          <h2 className="text-[14px] font-medium text-foreground">Basic info</h2>

          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className={labelClass}>
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              placeholder="Official T-shirt"
              maxLength={100}
              required
              className={inputClass}
            />
            <span className={cn(
              "text-[12px]",
              nombre.length > 80 ? "text-gold-bright" : "text-muted-foreground",
            )}>
              {nombre.length}/100
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="descripcion" className={labelClass}>
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detailed product description..."
              rows={3}
              maxLength={500}
              required
              className={cn(inputClass, "h-auto resize-none py-2")}
            />
            <span className={cn(
              "text-[12px]",
              descripcion.length > 400 ? "text-gold-bright" : "text-muted-foreground",
            )}>
              {descripcion.length}/500
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-[13px] text-muted-foreground">/shop/</span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setAutoSlug(false)
                }}
                placeholder="official-t-shirt"
                disabled={autoSlug}
                className={cn(inputClass, "min-w-0 flex-1 disabled:opacity-50")}
              />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => {
                  setAutoSlug(e.target.checked)
                  if (e.target.checked) setSlug(generateSlug(nombre))
                }}
                className="size-3.5 accent-gold"
              />
              Auto-generate from name
            </label>
          </div>
        </section>

        {/* Pricing & stock + Product image — side by side below */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Pricing & stock */}
          <section className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4">
            <h2 className="text-[14px] font-medium text-foreground">Pricing & stock</h2>

            <div className="flex flex-col gap-1">
              <label htmlFor="precio" className="text-[13px] font-medium text-foreground">
                Price
              </label>
              <div className="relative flex h-10 items-center rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-gold">
                <input
                  id="precio"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={precio === 0 ? "" : precio.toLocaleString()}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^\d]/g, "")
                    setPrecio(digits ? Number(digits) : 0)
                  }}
                  min={1}
                  required
                  placeholder="0"
                  className="h-full w-full rounded-lg bg-transparent px-3 text-[16px] font-medium tabular-nums text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 text-[12px] text-muted-foreground">
                  pts
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="stock" className="text-[13px] font-medium text-foreground">
                Stock
              </label>
              <div className="relative flex h-10 items-center rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-gold">
                <input
                  id="stock"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={stock === 0 ? "" : stock.toLocaleString()}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^\d]/g, "")
                    setStock(digits ? Number(digits) : 0)
                  }}
                  min={0}
                  placeholder="0"
                  className="h-full w-full rounded-lg bg-transparent px-3 text-[16px] font-medium tabular-nums text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 text-[12px] text-muted-foreground">
                  units
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-foreground">Status</label>
              <div className="flex h-10 gap-1">
                <button
                  type="button"
                  onClick={() => setEstado("borrador")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-medium transition-colors",
                    estado === "borrador"
                      ? "border-border bg-secondary text-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <span className={cn(
                    "size-1.5 rounded-full",
                    estado === "borrador" ? "bg-muted-foreground" : "bg-muted-foreground/40",
                  )} />
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setEstado("publicado")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-medium transition-colors",
                    estado === "publicado"
                      ? "border-gold/40 bg-gold/10 text-gold-bright"
                      : "border-border bg-transparent text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <span className={cn(
                    "size-1.5 rounded-full",
                    estado === "publicado" ? "bg-gold-bright" : "bg-muted-foreground/40",
                  )} />
                  Live
                </button>
              </div>
            </div>
          </section>

          {/* Product image */}
          <section className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4">
            <h2 className="text-[14px] font-medium text-foreground">Product image</h2>
            <ImageUpload
              value={imageData?.imagen_url ?? null}
              onChange={(result) => {
                if (result) {
                  setImageData(result)
                } else {
                  setImageData(null)
                }
              }}
            />
            {imageData && imageData.imagen_width > 0 && (
              <p className="text-[12px] text-muted-foreground">
                {imageData.imagen_width} × {imageData.imagen_height}px
              </p>
            )}
          </section>
        </div>

        {/* Spacer so content doesn't hide behind sticky bar */}
        <div className="h-12" />
      </form>

      {/* Right: live preview (sticky) */}
      <div className="hidden lg:sticky lg:top-8 lg:flex lg:w-[340px] lg:shrink-0 lg:flex-col lg:gap-3">
        <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
          Live preview
        </span>
        <div className="rounded-lg border border-border bg-card/30 p-4">
          <DesignCard card={previewCard} onOpen={() => {}} />
        </div>
        <p className="text-[12px] text-muted-foreground">
          This is how the card will appear in the shop feed.
        </p>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-4 py-3 lg:pl-[236px]">
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={isPending}
            className="h-10 rounded-full bg-foreground px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {isPending ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={isPending}
            className="h-10 rounded-full border border-border bg-secondary px-6 text-[14px] font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => router.push("/shop/admin/products")}
            disabled={isPending}
            className="h-10 rounded-full px-4 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
