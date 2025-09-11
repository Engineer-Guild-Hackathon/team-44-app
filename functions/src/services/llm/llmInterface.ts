export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface LearningContext {
  subject?: string;
  topic?: string;
  difficulty?: number;
  userLevel?: string;
}

export interface LLMProvider {
  generateResponse(history: ChatMessage[], newMessage: string, context?: LearningContext): Promise<string>;
}
