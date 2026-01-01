import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';

describe('useChat', () => {
    describe('addMessage', () => {
        it('should add a user message', () => {
            const { result } = renderHook(() => useChat());

            act(() => {
                result.current.addMessage('user', 'Hello AI');
            });

            expect(result.current.messages).toHaveLength(1);
            expect(result.current.messages[0].role).toBe('user');
            expect(result.current.messages[0].content).toBe('Hello AI');
        });

        it('should add an assistant message', () => {
            const { result } = renderHook(() => useChat());

            act(() => {
                result.current.addMessage('assistant', 'Hello Human');
            });

            expect(result.current.messages).toHaveLength(1);
            expect(result.current.messages[0].role).toBe('assistant');
        });

        it('should add messages with unique IDs', () => {
            const { result } = renderHook(() => useChat());

            act(() => {
                result.current.addMessage('user', 'Message 1');
                result.current.addMessage('user', 'Message 2');
            });

            expect(result.current.messages[0].id).not.toBe(result.current.messages[1].id);
        });
    });

    describe('sendMessage', () => {
        it('should not send empty messages', async () => {
            const { result } = renderHook(() => useChat());

            await act(async () => {
                await result.current.sendMessage('   ', { files: [] });
            });

            expect(result.current.messages).toHaveLength(0);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should not send while already loading', async () => {
            // Mock a slow response
            (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));

            const { result } = renderHook(() => useChat());

            // First call starts loading
            act(() => {
                result.current.sendMessage('Hello', { files: [] });
            });

            // While loading, another call should be ignored
            await act(async () => {
                await result.current.sendMessage('World', { files: [] });
            });

            // Should only have messages from first call
            expect(result.current.messages.filter(m => m.role === 'user')).toHaveLength(1);
        });
    });

    describe('clearChat', () => {
        it('should clear all messages', () => {
            const { result } = renderHook(() => useChat());

            act(() => {
                result.current.addMessage('user', 'Message 1');
                result.current.addMessage('assistant', 'Response 1');
                result.current.addMessage('user', 'Message 2');
            });

            expect(result.current.messages).toHaveLength(3);

            act(() => {
                result.current.clearChat();
            });

            expect(result.current.messages).toHaveLength(0);
        });
    });

    describe('isLoading', () => {
        it('should be false initially', () => {
            const { result } = renderHook(() => useChat());
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('stopGeneration', () => {
        it('should be a callable function', () => {
            const { result } = renderHook(() => useChat());
            expect(typeof result.current.stopGeneration).toBe('function');
        });
    });
});
