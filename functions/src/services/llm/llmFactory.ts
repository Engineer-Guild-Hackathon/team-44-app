import { LLMProvider } from "./llmInterface";
import { GeminiProvider } from "./geminiProvider";
import { OpenAIProvider } from "./openaiProvider";

export const getLLMProvider = (): LLMProvider => {
  const providerType = process.env.LLM_PROVIDER;

  switch (providerType) {
    case 'gemini':
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
      }
      return new GeminiProvider(process.env.GEMINI_API_KEY);

    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      return new OpenAIProvider(process.env.OPENAI_API_KEY);

    default:
      throw new Error(`Unsupported LLM provider: ${providerType}`);
  }
};
