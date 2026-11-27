"use client"

export function RowOverlayButton({
  onClick,
  ariaLabel,
}: Readonly<{
  onClick: () => void
  ariaLabel: string
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="absolute inset-0 z-10 cursor-pointer appearance-none border-0 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
    />
  )
}
