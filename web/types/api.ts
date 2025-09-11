// API関連の型定義
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  learningRecordId?: string;
  title?: string;
  status: "draft" | "active" | "completed";
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  messageCount: number;
  sessionSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface LearningRecord {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  status: "active" | "completed" | "paused";
  totalDuration: number;
  sessionCount: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  lastStudiedAt: Date;
  summary?: string;
  keyPoints?: string[];
  isManuallyCreated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionRequest {
  userId: string;
  title?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  message: string;
}

export interface SmartSessionResponse {
  success: boolean;
  sessionId: string;
  learningRecordId: string;
  isNewLearningRecord: boolean;
  estimation: {
    subject: string;
    topic: string;
    confidence: number;
  };
}

export interface PostMessageRequest {
  message: string;
}

export interface PostMessageResponse {
  response: string;
  sessionId: string;
  sessionStatus: string;
  learningRecordUpdated: boolean;
  message: string;
}

export interface ApiError {
  error: string;
}

export interface UserSessionsResponse {
  sessions: ChatSession[];
  message: string;
}

export interface GetSessionResponse {
  session: ChatSession;
  message: string;
}

export interface LearningRecordsResponse {
  success: boolean;
  records: LearningRecord[];
}
