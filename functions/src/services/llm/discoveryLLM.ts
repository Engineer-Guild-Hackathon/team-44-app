import { LLMProvider } from "./llmInterface";

interface KnowledgeItem {
  category: string;
  content: string;
  googleSearchQuery?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  relatedTopics: string[];
}

interface QuizItem {
  primaryCategory: string;
  secondaryCategory: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  googleSearchQuery?: string;
}

export class DiscoveryLLM {
  private llmProvider: LLMProvider;

  constructor() {
    // デフォルトでGeminiを使用（実際のプロバイダーは設定から取得）
    const { GeminiProvider } = require('./geminiProvider');
    this.llmProvider = new GeminiProvider(process.env.GEMINI_API_KEY || '');
  }

  /**
   * ユーザーの学習分野から豆知識を生成
   */
  async generateKnowledge(subjects: string[], topics: string[]): Promise<KnowledgeItem> {
    const prompt = `
ユーザーの学習分野: ${subjects.join(', ')}
学習トピック: ${topics.join(', ')}

以下の条件で豆知識を1つ生成してください：
1. 10-30文字以内
2. 学習分野に関連する興味深い事実
3. Google検索用キーワード1つ
4. 専門用語は避け、分かりやすく
5. 関連分野タグを3つ以内

出力形式:
{
  "content": "豆知識の内容",
  "googleSearchQuery": "検索キーワード",
  "category": "カテゴリ",
  "tags": ["タグ1", "タグ2"],
  "relatedTopics": ["関連トピック1"],
  "difficulty": "beginner"
}
`;

    try {
      const response = await this.llmProvider.generateResponse([], prompt);

      // LLMレスポンスからJSONを抽出（```json ブロックを考慮）
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(jsonString);

      return {
        category: parsed.category || 'general',
        content: parsed.content,
        googleSearchQuery: parsed.googleSearchQuery,
        difficulty: parsed.difficulty || 'beginner',
        tags: parsed.tags || [],
        relatedTopics: parsed.relatedTopics || []
      };
    } catch (error) {
      console.error('Error generating knowledge:', error);
      return {
        category: 'general',
        content: '学びは人生を豊かにします。今日も新しいことを発見しましょう！',
        difficulty: 'beginner',
        tags: ['motivation'],
        relatedTopics: []
      };
    }
  }

  /**
   * ユーザーの興味分野からクイズを生成
   */
  async generateQuiz(subjects: string[]): Promise<QuizItem> {
    const prompt = `
ユーザーの学習分野: ${subjects.join(', ')}

基礎レベルの3択問題を生成してください：
1. 分野横断的な内容
2. 選択肢は明確に区別可能
3. 解説は50文字以内
4. Google検索用キーワード

出力形式:
{
  "primaryCategory": "主要分野",
  "secondaryCategory": "副次分野",
  "question": "問題文",
  "options": ["選択肢1", "選択肢2", "選択肢3"],
  "correctAnswer": 0,
  "explanation": "解説文",
  "googleSearchQuery": "検索キーワード"
}
`;

    try {
      const response = await this.llmProvider.generateResponse([], prompt);

      // LLMレスポンスからJSONを抽出（```json ブロックを考慮）
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(jsonString);

      return {
        primaryCategory: parsed.primaryCategory || 'general',
        secondaryCategory: parsed.secondaryCategory || 'learning',
        question: parsed.question,
        options: parsed.options || [],
        correctAnswer: parsed.correctAnswer || 0,
        explanation: parsed.explanation,
        googleSearchQuery: parsed.googleSearchQuery
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      return {
        primaryCategory: 'general',
        secondaryCategory: 'learning',
        question: '学習の楽しさは何でしょうか？',
        options: ['知識が増える', '新しい発見がある', '成長を感じる', '全て正解'],
        correctAnswer: 3,
        explanation: '学習には多くの喜びがあります'
      };
    }
  }

  /**
   * 新領域の提案を生成
   */
  async generateSuggestions(currentSubjects: string[]): Promise<{ category: string; reason: string }[]> {
    const prompt = `
現在の学習分野: ${currentSubjects.join(', ')}

これらの分野に関連する新しい学習分野を3つ提案してください。
各提案には理由を簡潔に説明。

出力形式:
[
  {"category": "提案分野1", "reason": "理由1"},
  {"category": "提案分野2", "reason": "理由2"}
]
`;

    try {
      const response = await this.llmProvider.generateResponse([], prompt);

      // LLMレスポンスからJSONを抽出（```json ブロックを考慮）
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [
        { category: '哲学', reason: '根本的な思考力を養う' },
        { category: '歴史', reason: '背景知識を深める' },
        { category: '芸術', reason: '創造性を高める' }
      ];
    }
  }

  /**
   * 未開拓ジャンルの魅力を説明
   */
  async generateCategoryAppeal(category: string, learnedSubjects: string[]): Promise<{ content: string; appeal: string }> {
    const prompt = `
学習済み分野: ${learnedSubjects.join(', ')}
提案ジャンル: ${category}

${category}の魅力を、学習済み分野との関連を踏まえて説明してください。
出力は以下の形式で：
{
  "content": "${category}は、[学習済み分野]の理解を深める上で重要な分野です。",
  "appeal": "${category}を学ぶことで得られる3つのメリットを簡潔に説明"
}
`;

    try {
      const response = await this.llmProvider.generateResponse([], prompt);

      // LLMレスポンスからJSONを抽出
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error generating category appeal:', error);
      return {
        content: `${category}は新しい視点を提供する興味深い分野です。`,
        appeal: `${category}を学ぶことで、視野が広がり、新しい発見が待っています。`
      };
    }
  }
}
