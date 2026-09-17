export type ChangeType = "added" | "improved" | "fixed"

export type LocalizedText = { en: string; es: string }

export type ChangelogChange = {
  type: ChangeType
  text: LocalizedText
}

export type ChangelogRelease = {
  version: string
  date: string
  title: LocalizedText
  changes: ChangelogChange[]
}
