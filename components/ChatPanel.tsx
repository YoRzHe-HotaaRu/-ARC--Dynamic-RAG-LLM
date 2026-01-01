'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Square, MessageCircle, LogOut } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/hooks/useChat';

interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    fileCount: number;
    onSendMessage: (message: string) => void;
    onStopGeneration: () => void;
    user?: string | null;
    onLogout?: () => void;
}

export default function ChatPanel({
    messages,
    isLoading,
    fileCount,
    onSendMessage,
    onStopGeneration,
    user,
    onLogout,
}: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    }, [input, isLoading, onSendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    return (
        <div className="chat-panel">
            {/* Header */}
            <div className="chat-header">
                <h2>
                    <Image src="/logo.png" alt="" width={24} height={24} className="rounded" />
                    ARC, The Dynamic RAG Assistant
                </h2>
                <div className="header-right">
                    <div className={`status-badge ${fileCount > 0 ? 'connected' : 'disconnected'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {fileCount > 0 ? `${fileCount} doc${fileCount !== 1 ? 's' : ''} loaded` : 'No documents'}
                    </div>
                    {user && onLogout && (
                        <button className="logout-btn" onClick={onLogout} title={`Logged in as ${user}`}>
                            <LogOut size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <MessageCircle className="empty-state-icon" />
                        <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">
                            Start a conversation
                        </h3>
                        <p className="text-sm max-w-sm">
                            Upload documents to the left panel and ask me anything about them.
                            I&apos;ll help you analyze, summarize, or answer questions.
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <ChatMessage key={message.id} message={message} isLoading={isLoading} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your documents..."
                        className="chat-input"
                        rows={1}
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <button
                            type="button"
                            onClick={onStopGeneration}
                            className="send-button"
                            title="Stop generation"
                        >
                            <Square size={20} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="send-button"
                            title="Send message"
                        >
                            <Send size={20} />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

interface ChatMessageProps {
    message: Message;
    isLoading: boolean;
}

function ChatMessage({ message, isLoading }: ChatMessageProps) {
    const isAssistant = message.role === 'assistant';
    const isLastAssistantMessage = isAssistant && message.content === '' && isLoading;

    return (
        <div className={`message ${message.role}`}>
            <div className="message-avatar">
                {isAssistant ? 'AI' : 'U'}
            </div>
            <div className="message-content">
                {isLastAssistantMessage ? (
                    <TypingIndicator />
                ) : (
                    <MessageContent content={message.content} isUser={message.role === 'user'} />
                )}
            </div>
        </div>
    );
}

function cleanupMarkdown(text: string): string {
    let cleaned = text;

    // Fix unclosed bold markers - find ** without closing pair
    // Count ** occurrences, if odd number, remove the last one
    const boldMatches = cleaned.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 !== 0) {
        // Remove the last ** 
        const lastIndex = cleaned.lastIndexOf('**');
        cleaned = cleaned.slice(0, lastIndex) + cleaned.slice(lastIndex + 2);
    }

    // Fix ** at start of line without closing (like "**Title - content")
    cleaned = cleaned.replace(/^\*\*([^*\n]+)$/gm, '$1');
    cleaned = cleaned.replace(/^\*\*([^*]+)\*\*([^*]+)$/gm, '**$1** $2');

    // Fix dangling ** in middle of text
    cleaned = cleaned.replace(/\*\*([^*]+)(?!\*\*)/g, (match, content) => {
        // Only fix if there's no closing ** in the rest of the line
        if (!content.includes('**')) {
            return content;
        }
        return match;
    });

    // Fix numbers that run together with text (like "4.2.3Event")
    cleaned = cleaned.replace(/(\d+\.\d+(?:\.\d+)?)\s*([A-Z])/g, '$1 $2');

    // Fix missing line breaks before numbered items
    cleaned = cleaned.replace(/([^\n])(\d+\.\s)/g, '$1\n$2');

    // Fix missing line breaks before section headers
    cleaned = cleaned.replace(/([a-z])(\d+\.\d+)/gi, '$1\n$2');

    // Clean up multiple consecutive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
}

function TypingIndicator() {
    return (
        <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
        </div>
    );
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
    // For user messages, just show plain text
    if (isUser) {
        return <span>{content}</span>;
    }

    // Clean up malformed markdown from LLM
    const cleanedContent = cleanupMarkdown(content);

    // For assistant messages, render as markdown
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,

                    // Paragraphs
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

                    // Lists
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,

                    // Code
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded text-sm font-mono">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-[var(--bg-secondary)] rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono">
                            {children}
                        </pre>
                    ),

                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-3">
                            <table className="min-w-full border-collapse border border-[var(--border-light)]">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-[var(--bg-secondary)]">{children}</thead>
                    ),
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => (
                        <tr className="border-b border-[var(--border-light)]">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left font-semibold text-sm border border-[var(--border-light)]">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-sm border border-[var(--border-light)]">
                            {children}
                        </td>
                    ),

                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[var(--accent-lavender)] pl-4 my-2 italic text-[var(--text-secondary)]">
                            {children}
                        </blockquote>
                    ),

                    // Horizontal rule
                    hr: () => <hr className="my-4 border-[var(--border-light)]" />,

                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-lavender)] hover:underline"
                        >
                            {children}
                        </a>
                    ),

                    // Bold and italic
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                }}
            >
                {cleanedContent}
            </ReactMarkdown>
        </div>
    );
}

