// データモデルと型定義
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
