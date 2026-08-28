import type { ChangelogRelease } from "./types"
import v2_0_0 from "./v2.0.0"
import v2_0_1 from "./v2.0.1"

const releases: ChangelogRelease[] = [v2_0_0, v2_0_1]

// Sort by version, newest first. Versions are expected to be semver-like
// (e.g. "v2.0.0"). Strip the leading "v" and compare numeric segments.
releases.sort((a, b) => {
  const parse = (v: string): number[] =>
    v
      .replace(/^v/, "")
      .split(".")
      .map((part) => Number.parseInt(part, 10) || 0)

  const aParts = parse(a.version)
  const bParts = parse(b.version)
  const maxLen = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < maxLen; i++) {
    const aVal = aParts[i] ?? 0
    const bVal = bParts[i] ?? 0
    if (aVal !== bVal) {
      return bVal - aVal
    }
  }

  return 0
})

export { releases }
export type { ChangelogRelease, ChangelogChange, ChangeType } from "./types"
