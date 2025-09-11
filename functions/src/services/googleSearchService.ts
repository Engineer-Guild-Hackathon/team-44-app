/**
 * Google Search Service for agent capabilities
 * Provides web search functionality to bridge knowledge gaps
 */

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface SearchResponse {
  results: SearchResult[];
  searchTime: string; // Changed from number to string to match Google API
  totalResults: string;
}

export class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    
    if (!this.apiKey || !this.searchEngineId) {
      console.warn('Google Search API credentials not configured. Search functionality will be disabled.');
    }
  }

  /**
   * Perform a Google search and return formatted results
   */
  async search(query: string, maxResults: number = 5): Promise<SearchResponse | null> {
    if (!this.apiKey || !this.searchEngineId) {
      console.log('Google Search API not configured, skipping search');
      return null;
    }

    try {
      const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
      searchUrl.searchParams.append('key', this.apiKey);
      searchUrl.searchParams.append('cx', this.searchEngineId);
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('num', Math.min(maxResults, 10).toString());
      searchUrl.searchParams.append('safe', 'active');
      searchUrl.searchParams.append('lr', 'lang_ja'); // Japanese language preference

      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        console.error('Google Search API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      if (!data.items) {
        console.log('No search results found for query:', query);
        return {
          results: [],
          searchTime: data.searchInformation?.searchTime || '0',
          totalResults: data.searchInformation?.totalResults || '0'
        };
      }

      const results: SearchResult[] = data.items.map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
        displayLink: item.displayLink || ''
      }));

      return {
        results,
        searchTime: data.searchInformation?.searchTime || '0',
        totalResults: data.searchInformation?.totalResults || '0'
      };

    } catch (error) {
      console.error('Error performing Google search:', error);
      return null;
    }
  }

  /**
   * Check if search functionality is available
   */
  isAvailable(): boolean {
    return !!(this.apiKey && this.searchEngineId);
  }

  /**
   * Format search results for AI response
   */
  formatSearchResults(searchResponse: SearchResponse): string {
    if (!searchResponse.results.length) {
      return '検索結果が見つかりませんでした。';
    }

    let formatted = '🔍 **関連する情報を検索しました：**\n\n';
    
    searchResponse.results.forEach((result, index) => {
      formatted += `**${index + 1}. ${result.title}**\n`;
      formatted += `📝 ${result.snippet}\n`;
      formatted += `🔗 [詳細を見る](${result.link})\n\n`;
    });

    formatted += `*検索結果: ${searchResponse.totalResults}件 (${searchResponse.searchTime}秒)*\n\n`;
    formatted += 'これらの情報を参考に、さらに詳しく学習を進めましょう！';

    return formatted;
  }

  /**
   * Generate search query based on user message and context
   */
  generateSearchQuery(userMessage: string, context?: string): string {
    // Remove common Japanese particles and focus on key terms
    let query = userMessage
      .replace(/[？！。、]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Add context if available
    if (context) {
      query = `${context} ${query}`;
    }

    // Add Japanese educational content preference
    query += ' 学習 解説';

    return query;
  }
}

export const googleSearchService = new GoogleSearchService();