/** Generate a CSV file from headers and rows, then trigger a browser download.
 *  Null/undefined cells are rendered as empty strings. */
export function downloadCSV(
  filename: string,
  headers: (string | number)[],
  rows: (string | number | null | undefined)[][],
): void {
  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "")
          return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(","),
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
