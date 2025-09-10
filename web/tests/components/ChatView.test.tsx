import { render, screen } from '../setup/testUtils';
import ChatView from '../../components/common/ChatView';
import { ChatMessage } from '../../types/api';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ChatView', () => {
  const mockMessages: ChatMessage[] = [
    {
      role: 'user',
      parts: [{ text: 'こんにちは' }],
      timestamp: new Date('2024-01-01T12:00:00Z'),
    },
    {
      role: 'model',
      parts: [{ text: 'こんにちは！何か質問はありますか？' }],
      timestamp: new Date('2024-01-01T12:01:00Z'),
    },
  ];

  it('should render messages correctly', () => {
    render(<ChatView messages={mockMessages} />);

    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('こんにちは！何か質問はありますか？')).toBeInTheDocument();
  });

  it('should display welcome message when no messages exist', () => {
    render(<ChatView messages={[]} />);

    expect(screen.getByText('新しい学習セッションを開始しましょう！')).toBeInTheDocument();
    expect(
      screen.getByText('わからない問題や疑問を入力してください。AIがヒントを提供します。')
    ).toBeInTheDocument();
  });

  it('should display loading indicator when isLoading is true', () => {
    render(<ChatView messages={[]} isLoading={true} />);

    expect(screen.getByText('AIが考えています...')).toBeInTheDocument();
  });

  it('should not display welcome message when loading', () => {
    render(<ChatView messages={[]} isLoading={true} />);

    expect(screen.queryByText('新しい学習セッションを開始しましょう！')).not.toBeInTheDocument();
  });

  it('should render user messages with correct styling', () => {
    const userOnlyMessages: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: 'ユーザーメッセージ' }],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    render(<ChatView messages={userOnlyMessages} />);

    // Find the message bubble container (the div with bg-blue-500 class)
    const messageBubbles = screen.getAllByRole('generic', { hidden: true });
    const userMessageBubble = messageBubbles.find(bubble =>
      bubble.classList.contains('bg-blue-500') &&
      bubble.textContent?.includes('ユーザーメッセージ')
    );
    expect(userMessageBubble).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should render AI messages with correct styling', () => {
    const aiOnlyMessages: ChatMessage[] = [
      {
        role: 'model',
        parts: [{ text: 'AIメッセージ' }],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    render(<ChatView messages={aiOnlyMessages} />);

    // Find the message bubble container (the div with bg-gray-100 class)
    const messageBubbles = screen.getAllByRole('generic', { hidden: true });
    const aiMessageBubble = messageBubbles.find(bubble =>
      bubble.classList.contains('bg-gray-100') &&
      bubble.textContent?.includes('AIメッセージ')
    );
    expect(aiMessageBubble).toHaveClass('bg-gray-100', 'text-gray-800', 'border');
  });

  it('should display timestamp for messages', () => {
    const messagesWithTimestamp: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: 'テストメッセージ' }],
        timestamp: new Date('2024-01-01T15:30:00Z'),
      },
    ];

    render(<ChatView messages={messagesWithTimestamp} />);

    // Note: The exact time format might depend on locale/timezone in test environment
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    // Check if timestamp element exists by looking for any time format
    const timeText = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeText).toBeInTheDocument();
  });

  it('should handle messages with multiple parts', () => {
    const multiPartMessages: ChatMessage[] = [
      {
        role: 'model',
        parts: [
          { text: '最初の部分' },
          { text: '2番目の部分' },
        ],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    render(<ChatView messages={multiPartMessages} />);

    expect(screen.getByText('最初の部分')).toBeInTheDocument();
    expect(screen.getByText('2番目の部分')).toBeInTheDocument();
  });

  it('should handle messages without timestamp', () => {
    const messagesWithoutTimestamp: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: 'タイムスタンプなし' }],
      },
    ];

    render(<ChatView messages={messagesWithoutTimestamp} />);

    expect(screen.getByText('タイムスタンプなし')).toBeInTheDocument();
    // Verify no timestamp element is rendered
    const messageContainer = screen.getByText('タイムスタンプなし').parentElement;
    expect(messageContainer?.querySelector('.text-xs')).toBeNull();
  });

  it('should be accessible', () => {
    render(<ChatView messages={mockMessages} />);

    // Check that the component has proper structure for screen readers
    const chatContainer = screen.getByText('こんにちは').closest('.space-y-4');
    expect(chatContainer).toBeInTheDocument();
  });
});
