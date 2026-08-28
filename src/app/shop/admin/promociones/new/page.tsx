import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
import { PromocionForm } from "@/components/admin/promocion-form"

export const dynamic = "force-dynamic"

export default async function NewPromocionPage() {
  await requireAdmin()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Link href="/shop/admin/promociones" className="hover:text-foreground">
            Promotions
          </Link>
          <span>/</span>
          <span className="text-foreground">New</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">Create new promotion</h1>
      </div>

      <PromocionForm mode="create" />
    </div>
  )
}
