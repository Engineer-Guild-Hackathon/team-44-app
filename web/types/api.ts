// API関連の型定義
export interface ChatMessage {
  role: 'user' | 'model';
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
  message: string;
}

export interface PostMessageRequest {
  message: string;
}

export interface PostMessageResponse {
  response: string;
  sessionId: string;
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
