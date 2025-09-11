import { GoogleSearchService } from '../../../src/services/googleSearchService';

// Mock fetch globally
global.fetch = jest.fn();

describe('GoogleSearchService', () => {
  let service: GoogleSearchService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.resetAllMocks();
    // Mock environment variables
    process.env.GOOGLE_SEARCH_API_KEY = 'test-api-key';
    process.env.GOOGLE_SEARCH_ENGINE_ID = 'test-engine-id';
    service = new GoogleSearchService();
  });

  afterEach(() => {
    delete process.env.GOOGLE_SEARCH_API_KEY;
    delete process.env.GOOGLE_SEARCH_ENGINE_ID;
  });

  describe('isAvailable', () => {
    test('should return true when API credentials are configured', () => {
      expect(service.isAvailable()).toBe(true);
    });

    test('should return false when API key is missing', () => {
      delete process.env.GOOGLE_SEARCH_API_KEY;
      const newService = new GoogleSearchService();
      expect(newService.isAvailable()).toBe(false);
    });

    test('should return false when search engine ID is missing', () => {
      delete process.env.GOOGLE_SEARCH_ENGINE_ID;
      const newService = new GoogleSearchService();
      expect(newService.isAvailable()).toBe(false);
    });
  });

  describe('search', () => {
    test('should return null when API is not configured', async () => {
      delete process.env.GOOGLE_SEARCH_API_KEY;
      const newService = new GoogleSearchService();
      const result = await newService.search('test query');
      expect(result).toBeNull();
    });

    test('should perform search and return formatted results', async () => {
      const mockResponse = {
        items: [
          {
            title: 'Test Result 1',
            link: 'https://example.com/1',
            snippet: 'This is test snippet 1',
            displayLink: 'example.com'
          },
          {
            title: 'Test Result 2',
            link: 'https://example.com/2',
            snippet: 'This is test snippet 2',
            displayLink: 'example.com'
          }
        ],
        searchInformation: {
          searchTime: '0.5',
          totalResults: '100'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await service.search('test query', 2);

      expect(result).toEqual({
        results: [
          {
            title: 'Test Result 1',
            link: 'https://example.com/1',
            snippet: 'This is test snippet 1',
            displayLink: 'example.com'
          },
          {
            title: 'Test Result 2',
            link: 'https://example.com/2',
            snippet: 'This is test snippet 2',
            displayLink: 'example.com'
          }
        ],
        searchTime: '0.5',
        totalResults: '100'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/customsearch/v1')
      );
    });

    test('should return empty results when no items found', async () => {
      const mockResponse = {
        searchInformation: {
          searchTime: '0.3',
          totalResults: '0'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await service.search('test query');

      expect(result).toEqual({
        results: [],
        searchTime: '0.3',
        totalResults: '0'
      });
    });

    test('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response);

      const result = await service.search('test query');
      expect(result).toBeNull();
    });

    test('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.search('test query');
      expect(result).toBeNull();
    });
  });

  describe('formatSearchResults', () => {
    test('should format search results for AI response', () => {
      const searchResponse = {
        results: [
          {
            title: 'Test Result',
            link: 'https://example.com',
            snippet: 'This is a test snippet',
            displayLink: 'example.com'
          }
        ],
        searchTime: '0.5',
        totalResults: '100'
      };

      const formatted = service.formatSearchResults(searchResponse);

      expect(formatted).toContain('🔍 **関連する情報を検索しました：**');
      expect(formatted).toContain('**1. Test Result**');
      expect(formatted).toContain('📝 This is a test snippet');
      expect(formatted).toContain('🔗 [詳細を見る](https://example.com)');
      expect(formatted).toContain('*検索結果: 100件 (0.5秒)*');
    });

    test('should handle empty results', () => {
      const searchResponse = {
        results: [],
        searchTime: '0.2',
        totalResults: '0'
      };

      const formatted = service.formatSearchResults(searchResponse);
      expect(formatted).toBe('検索結果が見つかりませんでした。');
    });
  });

  describe('generateSearchQuery', () => {
    test('should generate search query from user message', () => {
      const query = service.generateSearchQuery('二次関数の解き方を教えて？');
      expect(query).toContain('二次関数の解き方を教えて');
      expect(query).toContain('学習 解説');
    });

    test('should include context when provided', () => {
      const query = service.generateSearchQuery('解き方を教えて', '数学');
      expect(query).toContain('数学');
      expect(query).toContain('解き方を教えて');
      expect(query).toContain('学習 解説');
    });

    test('should clean punctuation from query', () => {
      const query = service.generateSearchQuery('これは、何ですか？！');
      expect(query).not.toContain('、');
      expect(query).not.toContain('？');
      expect(query).not.toContain('！');
    });
  });
});