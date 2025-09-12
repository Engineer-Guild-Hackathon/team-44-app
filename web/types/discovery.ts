// 発見機能関連の型定義

export interface KnowledgeItem {
  id: string;
  category: string;
  content: string;
  googleSearchQuery?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  relatedTopics: string[];
  mermaidDiagram?: string;
  createdAt: Date;
  views: number;
}

export interface QuizItem {
  id: string;
  primaryCategory: string;
  secondaryCategory: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  googleSearchQuery?: string;
  createdAt: Date;
}

export interface QuizResult {
  quizId: string;
  selectedOption: number;
  isCorrect: boolean;
  submittedAt: Date;
}

export interface MapNode {
  id: string;
  category: string;
  level: number;
  itemsViewed: number;
}

export interface MapEdge {
  source: string;
  target: string;
  strength: number;
}

export interface InterestMapData {
  hasData: boolean;
  nodes: MapNode[];
  edges: MapEdge[];
  suggestions?: {
    category: string;
    reason: string;
  }[];
  placeholderMessage?: string;
}

export interface UntappedKnowledgeItem {
  category: string;
  content: string;
  appeal: string;
  googleSearchQuery?: string;
  nextAvailable: Date;
}

export interface DiscoveryState {
  todayKnowledge: KnowledgeItem | null;
  currentQuiz: QuizItem | null;
  quizResults: QuizResult[];
  interestMapData: InterestMapData | null;
  untappedKnowledge: UntappedKnowledgeItem | null;
  isLoading: boolean;
  error: string | null;
}
