import { GeminiProvider } from '../../../src/services/llm/geminiProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai');

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockModel: any;
  let mockChat: any;

  beforeEach(() => {
    mockChat = {
      sendMessage: jest.fn(),
    };

    mockModel = {
      startChat: jest.fn().mockReturnValue(mockChat),
    };

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    }));

    provider = new GeminiProvider('test-api-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should generate AI response successfully', async () => {
      const mockResponse = {
        response: {
          text: () => 'これは数学の基本概念です。まず、方程式とは何かを考えてみましょう。',
        },
      };

      mockChat.sendMessage.mockResolvedValue(mockResponse);

      const result = await provider.generateResponse([], '数学の二次方程式について教えてください');

      expect(result).toBe('これは数学の基本概念です。まず、方程式とは何かを考えてみましょう。');
      expect(mockChat.sendMessage).toHaveBeenCalledWith('数学の二次方程式について教えてください');
    });

    it('should handle chat history correctly', async () => {
      const mockResponse = {
        response: {
          text: () => 'さらに詳しく説明すると...',
        },
      };

      mockChat.sendMessage.mockResolvedValue(mockResponse);

      const history = [
        {
          role: 'user' as const,
          parts: [{ text: '二次方程式とは何ですか？' }],
        },
        {
          role: 'model' as const,
          parts: [{ text: 'それは良い質問ですね。まず、変数について考えてみましょう。' }],
        },
      ];

      const result = await provider.generateResponse(history, 'もう少し詳しく教えてください');

      expect(result).toBe('さらに詳しく説明すると...');
      expect(mockModel.startChat).toHaveBeenCalledWith({
        history: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            parts: [{ text: expect.stringContaining('学習をサポートするAI') }],
          }),
        ]),
      });
    });

    it('should handle API errors gracefully', async () => {
      mockChat.sendMessage.mockRejectedValue(new Error('API Error'));

      await expect(
        provider.generateResponse([], 'テスト質問')
      ).rejects.toThrow('AI応答の生成に失敗しました');
    });

    it('should return empty response if API returns empty text', async () => {
      const mockResponse = {
        response: {
          text: () => '',
        },
      };

      mockChat.sendMessage.mockResolvedValue(mockResponse);

      const result = await provider.generateResponse([], 'テスト質問');
      expect(result).toBe('');
    });

    it('should handle network timeout', async () => {
      mockChat.sendMessage.mockRejectedValue(new Error('Request timeout'));

      await expect(
        provider.generateResponse([], 'テスト質問')
      ).rejects.toThrow('AI応答の生成に失敗しました');
    });
  });
});