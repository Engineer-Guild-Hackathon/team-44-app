import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, ChatMessage } from "./llmInterface";

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(history: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // システムプロンプトの定義
  const systemPrompt = `
あなたは学習をサポートするAIアシスタントです。以下の原則に従って対話してください：

1. 直接的な答えを教えるのではなく、ユーザーが自力で解けるようにヒントを提供してください
2. 問題が複雑な場合は、小さな問題に分解して段階的に進めてください
3. ユーザーの理解度を確認しながら、適切なレベルのヒントを提供してください
4. 励ましとポジティブなフィードバックを心がけてください
5. ユーザーが答えに近づいている時は、その方向性が正しいことを伝えてください

ユーザーからの質問や問題に対して、上記の原則に従って応答してください。
`;

      // 対話履歴の構築
      const messages = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...history,
        { role: 'user', parts: [{ text: newMessage }] }
      ];

      // Gemini APIでは履歴を含めた形でリクエストを送信
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.parts
        }))
      });

      const result = await chat.sendMessage(newMessage);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('AI応答の生成に失敗しました');
    }
  }
}
