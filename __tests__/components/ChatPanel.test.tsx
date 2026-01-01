import { render, screen, fireEvent } from '@testing-library/react';
import ChatPanel from '@/components/ChatPanel';

describe('ChatPanel', () => {
    const mockOnSendMessage = jest.fn();
    const mockOnStopGeneration = jest.fn();

    const defaultProps = {
        messages: [],
        isLoading: false,
        fileCount: 0,
        onSendMessage: mockOnSendMessage,
        onStopGeneration: mockOnStopGeneration,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render the chat header', () => {
            render(<ChatPanel {...defaultProps} />);

            expect(screen.getByText('ARC, The Dynamic RAG Assistant')).toBeInTheDocument();
        });

        it('should show empty state when no messages', () => {
            render(<ChatPanel {...defaultProps} />);

            expect(screen.getByText('Start a conversation')).toBeInTheDocument();
        });

        it('should show "No documents" status when fileCount is 0', () => {
            render(<ChatPanel {...defaultProps} />);

            expect(screen.getByText('No documents')).toBeInTheDocument();
        });

        it('should show document count when files are loaded', () => {
            render(<ChatPanel {...defaultProps} fileCount={3} />);

            expect(screen.getByText('3 docs loaded')).toBeInTheDocument();
        });

        it('should render messages correctly', () => {
            const messages = [
                { id: '1', role: 'user' as const, content: 'Hello AI', timestamp: new Date() },
                { id: '2', role: 'assistant' as const, content: 'Hello human!', timestamp: new Date() },
            ];

            render(<ChatPanel {...defaultProps} messages={messages} />);

            expect(screen.getByText('Hello AI')).toBeInTheDocument();
            expect(screen.getByText('Hello human!')).toBeInTheDocument();
        });
    });

    describe('user input', () => {
        it('should have a textarea for input', () => {
            render(<ChatPanel {...defaultProps} />);

            const textarea = screen.getByPlaceholderText('Ask about your documents...');
            expect(textarea).toBeInTheDocument();
        });

        it('should call onSendMessage when form is submitted with text', () => {
            render(<ChatPanel {...defaultProps} />);

            const textarea = screen.getByPlaceholderText('Ask about your documents...');
            const form = textarea.closest('form');

            fireEvent.change(textarea, { target: { value: 'Test message' } });
            fireEvent.submit(form!);

            expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
        });

        it('should not call onSendMessage when input is empty', () => {
            render(<ChatPanel {...defaultProps} />);

            const textarea = screen.getByPlaceholderText('Ask about your documents...');
            const form = textarea.closest('form');

            fireEvent.submit(form!);

            expect(mockOnSendMessage).not.toHaveBeenCalled();
        });

        it('should clear input after sending', () => {
            render(<ChatPanel {...defaultProps} />);

            const textarea = screen.getByPlaceholderText('Ask about your documents...') as HTMLTextAreaElement;
            const form = textarea.closest('form');

            fireEvent.change(textarea, { target: { value: 'Test message' } });
            fireEvent.submit(form!);

            expect(textarea.value).toBe('');
        });
    });

    describe('loading state', () => {
        it('should show stop button when loading', () => {
            render(<ChatPanel {...defaultProps} isLoading={true} />);

            const stopButton = screen.getByTitle('Stop generation');
            expect(stopButton).toBeInTheDocument();
        });

        it('should call onStopGeneration when stop button is clicked', () => {
            render(<ChatPanel {...defaultProps} isLoading={true} />);

            const stopButton = screen.getByTitle('Stop generation');
            fireEvent.click(stopButton);

            expect(mockOnStopGeneration).toHaveBeenCalled();
        });

        it('should disable textarea when loading', () => {
            render(<ChatPanel {...defaultProps} isLoading={true} />);

            const textarea = screen.getByPlaceholderText('Ask about your documents...');
            expect(textarea).toBeDisabled();
        });
    });

    describe('message avatars', () => {
        it('should show AI avatar for assistant messages', () => {
            const messages = [
                { id: '1', role: 'assistant' as const, content: 'Hi!', timestamp: new Date() },
            ];

            render(<ChatPanel {...defaultProps} messages={messages} />);

            expect(screen.getByText('AI')).toBeInTheDocument();
        });

        it('should show U avatar for user messages', () => {
            const messages = [
                { id: '1', role: 'user' as const, content: 'Hello', timestamp: new Date() },
            ];

            render(<ChatPanel {...defaultProps} messages={messages} />);

            expect(screen.getByText('U')).toBeInTheDocument();
        });
    });
});
