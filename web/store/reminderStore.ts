import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface ReminderSettings {
  id: string
  userId: string
  enabled: boolean
  notificationMethods: ('push' | 'email')[]
  reminderIntervals: number[] // days
  quietHours: {
    start: string // "HH:mm" format
    end: string   // "HH:mm" format
  }
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface Reminder {
  id: string
  userId: string
  learningRecordId: string
  scheduledAt: Date
  completed: boolean
  notificationSent: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface LearningRecord {
  id: string
  userId: string
  sessionId: string
  subject: string
  topic: string
  summary: string
  duration: number
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

interface ReminderStore {
  // State
  reminderSettings: ReminderSettings | null
  reminders: Reminder[]
  learningRecords: LearningRecord[]
  isLoading: boolean
  error: string | null

  // Actions
  setReminderSettings: (settings: ReminderSettings) => void
  setReminders: (reminders: Reminder[]) => void
  setLearningRecords: (records: LearningRecord[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Reminder settings actions
  updateReminderSettings: (settings: Partial<ReminderSettings>) => void

  // Reminder actions
  addReminder: (reminder: Reminder) => void
  updateReminder: (id: string, updates: Partial<Reminder>) => void
  removeReminder: (id: string) => void
  markReminderCompleted: (id: string) => void

  // Learning record actions
  addLearningRecord: (record: LearningRecord) => void
  updateLearningRecord: (id: string, updates: Partial<LearningRecord>) => void
  removeLearningRecord: (id: string) => void

  // Computed getters
  getPendingReminders: () => Reminder[]
  getCompletedReminders: () => Reminder[]
  getTodayReminders: () => Reminder[]
  getLearningRecordById: (id: string) => LearningRecord | undefined

  // Reset function
  reset: () => void
}

const initialState = {
  reminderSettings: null,
  reminders: [],
  learningRecords: [],
  isLoading: false,
  error: null,
}

export const useReminderStore = create<ReminderStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Basic setters
    setReminderSettings: (settings: ReminderSettings) =>
      set({ reminderSettings: settings }),

    setReminders: (reminders: Reminder[]) =>
      set({ reminders }),

    setLearningRecords: (records: LearningRecord[]) =>
      set({ learningRecords: records }),

    setIsLoading: (loading: boolean) =>
      set({ isLoading: loading }),

    setError: (error: string | null) =>
      set({ error }),

    // Reminder settings actions
    updateReminderSettings: (updates: Partial<ReminderSettings>) => {
      const current = get().reminderSettings
      if (current) {
        set({
          reminderSettings: {
            ...current,
            ...updates,
            updatedAt: new Date()
          }
        })
      }
    },

    // Reminder actions
    addReminder: (reminder: Reminder) => {
      set(state => ({
        reminders: [...state.reminders, reminder]
      }))
    },

    updateReminder: (id: string, updates: Partial<Reminder>) => {
      set(state => ({
        reminders: state.reminders.map(reminder =>
          reminder.id === id
            ? { ...reminder, ...updates, updatedAt: new Date() }
            : reminder
        )
      }))
    },

    removeReminder: (id: string) => {
      set(state => ({
        reminders: state.reminders.filter(reminder => reminder.id !== id)
      }))
    },

    markReminderCompleted: (id: string) => {
      set(state => ({
        reminders: state.reminders.map(reminder =>
          reminder.id === id
            ? {
                ...reminder,
                completed: true,
                completedAt: new Date(),
                updatedAt: new Date()
              }
            : reminder
        )
      }))
    },

    // Learning record actions
    addLearningRecord: (record: LearningRecord) => {
      set(state => ({
        learningRecords: [...state.learningRecords, record]
      }))
    },

    updateLearningRecord: (id: string, updates: Partial<LearningRecord>) => {
      set(state => ({
        learningRecords: state.learningRecords.map(record =>
          record.id === id
            ? { ...record, ...updates, updatedAt: new Date() }
            : record
        )
      }))
    },

    removeLearningRecord: (id: string) => {
      set(state => ({
        learningRecords: state.learningRecords.filter(record => record.id !== id)
      }))
    },

    // Computed getters
    getPendingReminders: () => {
      const now = new Date()
      return get().reminders.filter(reminder =>
        !reminder.completed && reminder.scheduledAt <= now
      )
    },

    getCompletedReminders: () => {
      return get().reminders.filter(reminder => reminder.completed)
    },

    getTodayReminders: () => {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

      return get().reminders.filter(reminder =>
        reminder.scheduledAt >= startOfDay && reminder.scheduledAt < endOfDay
      )
    },

    getLearningRecordById: (id: string) => {
      return get().learningRecords.find(record => record.id === id)
    },

    // Reset function
    reset: () => set(initialState),
  }))
)

// Selector hooks for better performance
export const useReminderSettings = () => useReminderStore(state => state.reminderSettings)
export const useReminders = () => useReminderStore(state => state.reminders)
export const useLearningRecords = () => useReminderStore(state => state.learningRecords)
export const useReminderLoading = () => useReminderStore(state => state.isLoading)
export const useReminderError = () => useReminderStore(state => state.error)

// Action selectors
export const useReminderActions = () => useReminderStore(state => ({
  setReminderSettings: state.setReminderSettings,
  setReminders: state.setReminders,
  setLearningRecords: state.setLearningRecords,
  setIsLoading: state.setIsLoading,
  setError: state.setError,
  updateReminderSettings: state.updateReminderSettings,
  addReminder: state.addReminder,
  updateReminder: state.updateReminder,
  removeReminder: state.removeReminder,
  markReminderCompleted: state.markReminderCompleted,
  addLearningRecord: state.addLearningRecord,
  updateLearningRecord: state.updateLearningRecord,
  removeLearningRecord: state.removeLearningRecord,
  reset: state.reset,
}))

// Computed selectors
export const usePendingReminders = () => useReminderStore(state => state.getPendingReminders())
export const useCompletedReminders = () => useReminderStore(state => state.getCompletedReminders())
export const useTodayReminders = () => useReminderStore(state => state.getTodayReminders())
