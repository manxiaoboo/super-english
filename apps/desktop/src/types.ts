export type ReviewResult = 'forgot' | 'hard' | 'good' | 'easy'

export interface DueItem {
  type: string
  id: string
  nextReview: string
  reviewCount: number
  lastResult: string
  summary: string
  cues: string
}

export interface Settings {
  projectPath: string
  model: string
  reminderMinutes: number
  launchAtLogin: boolean
  alwaysOnTop: boolean
  opacity: number
  token: string
}

export interface Evaluation {
  correct: boolean
  feedback: string
  idealAnswer: string
  suggestedResult: ReviewResult
}

declare global {
  interface Window {
    reviewApp: {
      getSettings(): Promise<Settings>
      saveSettings(settings: Settings): Promise<Settings>
      chooseProject(): Promise<string | null>
      getDueItems(limit?: number): Promise<{ date: string; count: number; items: DueItem[] }>
      evaluate(payload: { item: DueItem; answer: string }): Promise<Evaluation>
      updateReview(payload: { item: DueItem; result: ReviewResult; note: string }): Promise<unknown>
      minimize(): void
      close(): void
      setPinned(pinned: boolean): void
      onNavigate(callback: (view: 'review' | 'settings') => void): void
      onSettingsChanged(callback: (settings: Settings) => void): void
    }
  }
}