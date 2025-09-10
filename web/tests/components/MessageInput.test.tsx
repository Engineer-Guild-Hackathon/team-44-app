import { render, screen, fireEvent, waitFor } from '../setup/testUtils';
import userEvent from '@testing-library/user-event';
import MessageInput from '../../components/common/MessageInput';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('MessageInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default placeholder', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    expect(screen.getByPlaceholderText('メッセージを入力してください...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(
      <MessageInput 
        onSendMessage={mockOnSendMessage} 
        placeholder="質問を入力してください"
      />
    );

    expect(screen.getByPlaceholderText('質問を入力してください')).toBeInTheDocument();
  });

  it('should send message when form is submitted', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.type(textarea, 'テストメッセージ');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('テストメッセージ');
  });

  it('should send message when Enter key is pressed', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');

    await user.type(textarea, 'Enter キーテスト');
    await user.keyboard('{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Enter キーテスト');
  });

  it('should not send message when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');

    await user.type(textarea, 'Shift+Enter テスト');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    // Should not send message, should add newline instead
    expect(mockOnSendMessage).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Shift+Enter テスト\n');
  });

  it('should not send empty message', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const sendButton = screen.getByRole('button', { name: '送信' });

    // Try to send without typing anything
    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should not send whitespace-only message', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.type(textarea, '   ');
    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should clear input after sending message', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.type(textarea, 'クリアテスト');
    await user.click(sendButton);

    expect(textarea).toHaveValue('');
  });

  it('should trim whitespace from message', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.type(textarea, '  トリムテスト  ');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('トリムテスト');
  });

  it('should be disabled when disabled prop is true', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} disabled={true} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();

    // Try to interact while disabled
    await user.type(textarea, 'このメッセージは送信されません');
    await user.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should not send message when disabled even if Enter is pressed', async () => {
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={mockOnSendMessage} disabled={true} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');

    // Even though disabled, we can test the key handler
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should handle long messages', async () => {
    const user = userEvent.setup();
    const longMessage = 'あ'.repeat(1000);

    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    await user.type(textarea, longMessage);
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith(longMessage);
  });

  it('should be accessible', () => {
    render(<MessageInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力してください...');
    const sendButton = screen.getByRole('button', { name: '送信' });

    expect(textarea).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
    
    // Check that form has proper structure
    const form = textarea.closest('form');
    expect(form).toBeInTheDocument();
  });
});