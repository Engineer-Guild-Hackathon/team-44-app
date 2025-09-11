import { getEnhancedPrompt } from '../../../src/services/llm/enhancedPrompts';

describe('Enhanced Prompts', () => {
  test('should return basic enhanced prompt without subject', () => {
    const prompt = getEnhancedPrompt();
    expect(prompt).toContain('高度な学習サポートAIアシスタント');
    expect(prompt).toContain('Socratic Method');
    expect(prompt).toContain('認知科学と教育心理学');
  });

  test('should include mathematics-specific guidance', () => {
    const prompt = getEnhancedPrompt('mathematics');
    expect(prompt).toContain('数学学習支援の特別ガイドライン');
    expect(prompt).toContain('概念理解の重視');
    expect(prompt).toContain('数学的思考の育成');
  });

  test('should include science-specific guidance', () => {
    const prompt = getEnhancedPrompt('science');
    expect(prompt).toContain('科学学習支援の特別ガイドライン');
    expect(prompt).toContain('科学的思考の促進');
    expect(prompt).toContain('仮説→実験→結論');
  });

  test('should include language-specific guidance', () => {
    const prompt = getEnhancedPrompt('language');
    expect(prompt).toContain('言語学習支援の特別ガイドライン');
    expect(prompt).toContain('コミュニケーション重視');
    expect(prompt).toContain('段階的習得');
  });

  test('should handle unknown subject gracefully', () => {
    const prompt = getEnhancedPrompt('unknown_subject');
    expect(prompt).toContain('高度な学習サポートAIアシスタント');
    // Should not contain any subject-specific content
    expect(prompt).not.toContain('数学学習支援');
    expect(prompt).not.toContain('科学学習支援');
    expect(prompt).not.toContain('言語学習支援');
  });

  test('should contain all core pedagogical principles', () => {
    const prompt = getEnhancedPrompt();
    
    // Core principles
    expect(prompt).toContain('Scaffolding');
    expect(prompt).toContain('Active Learning');
    expect(prompt).toContain('メタ認知');
    expect(prompt).toContain('エラー分析');
    
    // Teaching strategies
    expect(prompt).toContain('段階的開示');
    expect(prompt).toContain('多角的視点');
    expect(prompt).toContain('個別化');
    expect(prompt).toContain('実践的応用');
  });
});