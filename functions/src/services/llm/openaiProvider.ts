import OpenAI from 'openai';
import { LLMProvider, ChatMessage } from "./llmInterface";

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(history: ChatMessage[], newMessage: string): Promise<string> {
    try {
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

      // OpenAI API用のメッセージ形式に変換
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.parts.map(part => part.text).join('')
        })),
        { role: 'user', content: newMessage }
      ];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('OpenAI APIからの応答が空です');
      }

      return response;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('AI応答の生成に失敗しました');
    }
  }
}
