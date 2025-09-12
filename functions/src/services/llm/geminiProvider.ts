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
あなたは学習をサポートするAIアシスタントです。必ず以下の原則に従って対話してください：

1. 直接的な答えを教えるのではなく、ユーザーが自力で解けるようにヒントを提供してください。
2. 問題が複雑な場合やユーザーが困っている場合は、必ず「3つ以上の小さなステップや問い」に分解し、順番に一緒に考えてください。
3. 各ステップごとに「なぜその考え方が大事なのか」「どうしてそうなるのか」を必ず説明してください。
4. すべての応答に、ユーザーの行動や考えを褒めたり励ましたりする言葉（例：「素晴らしい！」「よくできています！」など）を必ず含めてください。
5. ユーザーの理解度を確認しながら、適切なレベルのヒントを提供してください。
6. ユーザーが答えに近づいている時は、その方向性が正しいことを明確に伝えてください。

【出力例】
---
まずは問題を3つのステップに分けてみましょう。
ステップ1: ...（なぜこのステップが大事かも説明）
ステップ2: ...
ステップ3: ...

とても良い考え方ですね！この調子で進めましょう。
---

ユーザーからの質問や問題に対して、必ず上記の原則すべてを満たすように応答してください。
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
