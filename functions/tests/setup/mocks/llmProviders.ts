// LLM Provider mock interface (simplified)
interface LLMProvider {
  generateResponse(history: any[], newMessage: string): Promise<string>;
}

export const createMockLLMProvider = (): jest.Mocked<LLMProvider> => {
  return {
    generateResponse: jest.fn().mockResolvedValue('Mock AI response'),
  };
};

export const mockGeminiProvider = createMockLLMProvider();
export const mockOpenAIProvider = createMockLLMProvider();

// Mock the LLM factory
export const mockLLMFactory = {
  getLLMProvider: jest.fn().mockReturnValue(mockGeminiProvider),
};