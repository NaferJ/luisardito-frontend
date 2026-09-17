import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import {
  getMyCanjes,
  MY_CANJES_PAGE_SIZE,
  type CanjesSort,
  type CanjesStatus,
} from '@/lib/canjes'
import { CanjesList } from '@/components/shop/canjes-list'
import { dictionaries, getDictionary, hasLocale, type Locale } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return {
    title: dictionaries[locale].canjes.metaTitle,
    description: dictionaries[locale].canjes.metaDescription,
  }
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
  const dictionary = await getDictionary()
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
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.canjes.title}</h1>
        <p className="text-[15px] text-muted-foreground">
          {dictionary.canjes.subtitle}
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
