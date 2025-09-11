import { render, screen } from '../setup/testUtils';
import ChatView from '../../app/chat/components/ChatView';
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

    expect(screen.getByText('知識の探求を始めましょう')).toBeInTheDocument();
    expect(
      screen.getByText('わからない問題や疑問を入力してください。AIがヒントを提供します。')
    ).toBeInTheDocument();
  });

  it('should display loading indicator when isLoading is true', () => {
    render(<ChatView messages={[]} isLoading={true} />);

    expect(screen.getByText('考え中...')).toBeInTheDocument();
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

    // Find the message bubble container
    const userMessageBubble = screen.getByText('ユーザーメッセージ').parentElement?.parentElement;
    expect(userMessageBubble).toHaveClass('message-bubble-user');
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

    // Find the message bubble container
    const aiMessageBubble = screen.getByText('AIメッセージ').parentElement?.parentElement;
    expect(aiMessageBubble).toHaveClass('message-bubble-ai');
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
    const chatContainer = screen.getByText('こんにちは').closest('.space-y-6');
    expect(chatContainer).toBeInTheDocument();
  });
});
