import { render, screen } from '../setup/testUtils';
import ChatView from '../../app/chat/components/ChatView';
import { ChatMessage } from '../../types/api';

// Mock scrollIntoView since JSDOM doesn't support it
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

describe('ChatView Scrolling', () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it('should call scrollIntoView when messages are added', () => {
    const initialMessages: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: '最初のメッセージ' }],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    const { rerender } = render(<ChatView messages={initialMessages} />);

    // Initial render should trigger scroll
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Clear the mock
    mockScrollIntoView.mockClear();

    // Add new message
    const updatedMessages: ChatMessage[] = [
      ...initialMessages,
      {
        role: 'model',
        parts: [{ text: '新しいメッセージ' }],
        timestamp: new Date('2024-01-01T12:01:00Z'),
      },
    ];

    rerender(<ChatView messages={updatedMessages} />);

    // Should scroll again when new message is added
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should call scrollIntoView when loading state changes', () => {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: 'テストメッセージ' }],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    const { rerender } = render(<ChatView messages={messages} isLoading={false} />);

    // Clear initial scroll call
    mockScrollIntoView.mockClear();

    // Change loading state
    rerender(<ChatView messages={messages} isLoading={true} />);

    // Should scroll when loading state changes
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should render scroll target element at the bottom', () => {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: 'テストメッセージ' }],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    const { container } = render(<ChatView messages={messages} />);

    // Check that there's a div at the end that can be used for scrolling
    const scrollTargets = container.querySelectorAll('div[class="flex-1 overflow-y-auto p-4 space-y-6"] > div:last-child');
    expect(scrollTargets.length).toBeGreaterThan(0);
  });

  it('should not crash when scrollIntoView behavior is tested', () => {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        parts: [{ text: 'テストメッセージ' }],
        timestamp: new Date('2024-01-01T12:00:00Z'),
      },
    ];

    // Should render without errors - the component handles missing scrollIntoView gracefully
    expect(() => {
      render(<ChatView messages={messages} />);
    }).not.toThrow();

    // Verify the component renders correctly
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
  });
});
