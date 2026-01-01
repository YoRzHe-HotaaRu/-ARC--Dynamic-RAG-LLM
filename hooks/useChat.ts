'use client';

import { useState, useCallback, useRef } from 'react';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

interface ChatContext {
    files: Array<{ name: string; content: string }>;
}

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const addMessage = useCallback((role: Message['role'], content: string): Message => {
        const message: Message = {
            id: crypto.randomUUID(),
            role,
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, message]);
        return message;
    }, []);

    const updateLastAssistantMessage = useCallback((content: string) => {
        setMessages(prev => {
            const lastIndex = prev.length - 1;
            if (lastIndex >= 0 && prev[lastIndex].role === 'assistant') {
                const updated = [...prev];
                updated[lastIndex] = { ...updated[lastIndex], content };
                return updated;
            }
            return prev;
        });
    }, []);

    const sendMessage = useCallback(async (
        userMessage: string,
        context: ChatContext
    ): Promise<void> => {
        if (!userMessage.trim() || isLoading) return;

        // Add user message
        addMessage('user', userMessage);

        // Add placeholder for assistant response
        addMessage('assistant', '');

        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages
                        .filter(m => m.role !== 'system')
                        .map(m => ({ role: m.role, content: m.content }))
                        .concat([{ role: 'user', content: userMessage }]),
                    context,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullContent += content;
                                updateLastAssistantMessage(fullContent);
                            }
                        } catch {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Request was aborted, do nothing
            } else {
                console.error('Chat error:', error);
                updateLastAssistantMessage('Sorry, I encountered an error. Please try again.');
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [messages, isLoading, addMessage, updateLastAssistantMessage]);

    const acknowledgeNewFiles = useCallback(async (
        fileNames: string[],
        context: ChatContext
    ): Promise<void> => {
        if (fileNames.length === 0 || isLoading) return;

        const fileList = fileNames.join(', ');
        const prompt = fileNames.length === 1
            ? `The user just added a file called "${fileList}". Briefly acknowledge it and mention what you can help with regarding its contents.`
            : `The user just added these files: ${fileList}. Briefly acknowledge them and mention what you can help with regarding their contents.`;

        // Add a system-like message that will trigger the AI
        addMessage('assistant', '');

        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    context,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullContent += content;
                                updateLastAssistantMessage(fullContent);
                            }
                        } catch {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Request was aborted
            } else {
                console.error('Acknowledgment error:', error);
                updateLastAssistantMessage(`I've received ${fileNames.length === 1 ? 'the file' : 'the files'}: ${fileList}. How can I help you with ${fileNames.length === 1 ? 'it' : 'them'}?`);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [isLoading, addMessage, updateLastAssistantMessage]);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        acknowledgeNewFiles,
        stopGeneration,
        clearChat,
        addMessage,
    };
}
