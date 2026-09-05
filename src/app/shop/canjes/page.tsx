import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import {
  getMyCanjes,
  MY_CANJES_PAGE_SIZE,
  type CanjesSort,
  type CanjesStatus,
} from '@/lib/canjes'
import { CanjesList } from '@/components/shop/canjes-list'

export const metadata: Metadata = {
  title: 'My Redemptions — Luisardito Shop',
  description: 'Your redemption history and status.',
}

interface CanjesPageProps {
  readonly searchParams: Promise<{
    page?: string
    status?: string
    sort?: string
  }>
}

const VALID_STATUSES: ReadonlySet<CanjesStatus> = new Set([
  'pendiente',
  'entregado',
  'cancelado',
  'devuelto',
])

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function parseStatus(value: string | undefined): CanjesStatus | 'all' {
  return value && VALID_STATUSES.has(value as CanjesStatus)
    ? (value as CanjesStatus)
    : 'all'
}

function parseSort(value: string | undefined): CanjesSort {
  return value === 'date-asc' ? 'date-asc' : 'date-desc'
}

export default async function CanjesPage({ searchParams }: CanjesPageProps) {
  await requireAuth()
  const params = await searchParams
  const currentPage = parsePage(params.page)
  const statusFilter = parseStatus(params.status)
  const sortMode = parseSort(params.sort)
  const result = await getMyCanjes({
    limit: MY_CANJES_PAGE_SIZE,
    offset: (currentPage - 1) * MY_CANJES_PAGE_SIZE,
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    sort: sortMode,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">My Redemptions</h1>
        <p className="text-[15px] text-muted-foreground">
          Your rewards and their current status.
        </p>
      </div>

      <CanjesList
        canjes={result.data}
        pagination={result.pagination}
        summary={result.summary}
        currentPage={currentPage}
        statusFilter={statusFilter}
        sortMode={sortMode}
      />
    </div>
  )
}
