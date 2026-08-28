export type ChangeType = "added" | "improved" | "fixed"

export type ChangelogChange = {
  type: ChangeType
  text: string
}

export type ChangelogRelease = {
  version: string
  date: string
  title: string
  changes: ChangelogChange[]
}
