// データモデルと型定義
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  learningRecordId?: string;          // LearningRecordへの参照
  title?: string;
  status: "draft" | "active" | "completed";
  startedAt: Date;
  completedAt?: Date;
  duration: number;                  // このセッションの時間（分）
  messageCount: number;
  sessionSummary?: string;           // このセッション固有のサマリー
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface CreateSessionRequest {
  userId: string;
  title?: string;
  learningRecordId?: string;
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

// Learning continuation support feature types - Updated to 1:N relationship
export interface LearningRecord {
  id: string;
  userId: string;
  subject: string;                    // 例: "数学"
  topic: string;                      // 例: "二次関数"
  status: "active" | "completed" | "paused";
  totalDuration: number;              // 累計学習時間（分）
  sessionCount: number;               // 関連セッション数
  difficulty: 1 | 2 | 3 | 4 | 5;
  lastStudiedAt: Date;               // 最後に学習した日時
  summary?: string;                   // 学習テーマ全体のサマリー
  keyPoints?: string[];              // 重要ポイント
  isManuallyCreated?: boolean;       // 手動作成フラグ（将来機能）
  estimatedSubject?: string;         // LLM推定subject
  estimatedTopic?: string;           // LLM推定topic
  estimationConfidence?: number;     // LLM推定confidence
  estimationMethod?: string;         // 推定方法（例: "llm_session_metadata"）
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

// Smart session creation types
export interface SubjectTopicEstimation {
  subject: string;
  topic: string;
  confidence: number;
}

export interface SmartSessionResult {
  sessionId: string;
  learningRecordId: string;
  isNewLearningRecord: boolean;
}

export interface SessionStateResult {
  aiResponse: string;
  sessionStatus: string;
  learningRecordUpdated: boolean;
}
