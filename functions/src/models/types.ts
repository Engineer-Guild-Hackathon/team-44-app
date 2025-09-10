// データモデルと型定義
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface CreateSessionRequest {
  userId: string;
  title?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface PostMessageRequest {
  message: string;
}

export interface PostMessageResponse {
  response: string;
  sessionId: string;
}

export interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

// Learning continuation support feature types
export interface LearningRecord {
  id: string;
  userId: string;
  sessionId: string;
  subject: string;
  topic: string;
  summary: string;
  duration: number; // minutes
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  recordId: string;
  scheduledAt: Date;
  status: "pending" | "sent" | "completed";
  type: "review" | "practice";
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  userId: string;
  enabled: boolean;
  notificationMethods: ("push" | "email")[];
  reviewIntervals: number[]; // days
  lastUpdated: Date;
  createdAt: Date;
}
