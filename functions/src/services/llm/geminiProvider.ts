import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, ChatMessage, LearningContext } from "./llmInterface";
import { getEnhancedPrompt } from "./enhancedPrompts";
import { googleSearchService } from "../googleSearchService";

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(history: ChatMessage[], newMessage: string, context?: LearningContext): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 高度なシステムプロンプトの使用
      const systemPrompt = getEnhancedPrompt(context?.subject);

      // 検索が必要かどうかを判断
      const shouldSearch = this.shouldPerformSearch(newMessage, history);
      let searchResults = '';

      if (shouldSearch && googleSearchService.isAvailable()) {
        console.log('Performing search for enhanced response...');
        const searchQuery = googleSearchService.generateSearchQuery(newMessage, context?.subject);
        const searchResponse = await googleSearchService.search(searchQuery, 3);
        
        if (searchResponse && searchResponse.results.length > 0) {
          searchResults = '\n\n' + googleSearchService.formatSearchResults(searchResponse);
        }
      }

      // 学習コンテキストの追加
      let contextualPrompt = systemPrompt;
      if (context) {
        contextualPrompt += `\n\n## 現在の学習コンテキスト\n`;
        if (context.subject) contextualPrompt += `- 学習分野: ${context.subject}\n`;
        if (context.topic) contextualPrompt += `- トピック: ${context.topic}\n`;
        if (context.difficulty) contextualPrompt += `- 難易度レベル: ${context.difficulty}/5\n`;
        if (context.userLevel) contextualPrompt += `- ユーザーレベル: ${context.userLevel}\n`;
      }

      // 対話履歴の構築
      const messages = [
        { role: 'user', parts: [{ text: contextualPrompt }] },
        ...history,
        { role: 'user', parts: [{ text: newMessage + searchResults }] }
      ];

      // Gemini APIでは履歴を含めた形でリクエストを送信
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.parts
        }))
      });

      const result = await chat.sendMessage(newMessage + searchResults);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('AI応答の生成に失敗しました');
    }
  }

  /**
   * 検索が必要かどうかを判断
   */
  private shouldPerformSearch(message: string, history: ChatMessage[]): boolean {
    // 検索が有用そうなキーワードやフレーズ
    const searchTriggers = [
      '最新', '最近', '現在', '今年', '2024', '2025',
      '例えば', '実例', '具体例', '実際', '現実',
      '詳しく', 'もっと', 'さらに', '深く',
      '参考', '資料', 'リンク', 'サイト', 'ウェブ',
      '調べ', '検索', '情報', 'データ',
      '応用', '実用', '活用', '使い方',
      '比較', '違い', '種類', '分類'
    ];

    // 質問が複雑で追加情報が有用そうな場合
    const complexQuestionIndicators = [
      'なぜ', 'どうして', 'どのように', 'どうやって',
      'なに', '何', 'いつ', 'どこ', 'だれ', '誰'
    ];

    const messageText = message.toLowerCase();
    
    // 基本的な計算や簡単な質問では検索しない
    const simpleTaskIndicators = [
      '計算', '足し算', '引き算', '掛け算', '割り算',
      '解いて', '答え', '結果', '値'
    ];

    // シンプルなタスクの場合は検索しない
    if (simpleTaskIndicators.some(indicator => messageText.includes(indicator))) {
      return false;
    }

    // 検索トリガーまたは複雑な質問の場合は検索する
    return searchTriggers.some(trigger => messageText.includes(trigger)) ||
           complexQuestionIndicators.some(indicator => messageText.includes(indicator));
  }
}
