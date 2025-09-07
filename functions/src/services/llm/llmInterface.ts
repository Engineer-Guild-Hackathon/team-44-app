export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface LLMProvider {
  generateResponse(history: ChatMessage[], newMessage: string): Promise<string>;
}
