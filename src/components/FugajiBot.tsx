import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') || 'http://127.0.0.1:8000/api/v1';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
}

interface ChatResponse {
    response: string;
    session_id: string;
    suggestions?: string[];
}

const FugajiBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [language, setLanguage] = useState<'sw' | 'en'>('sw');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Welcome message
    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessage: Message = {
                id: 'welcome',
                role: 'assistant',
                content: language === 'sw'
                    ? 'Habari! Mimi ni FugajiBot 🐔. Naweza kukusaidia na ushauri wa kufuga kuku. Uliza chochote!'
                    : 'Hello! I am FugajiBot 🐔. I can help you with poultry farming advice. Ask me anything!',
            };
            setMessages([welcomeMessage]);
        }
    }, [language]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        // Add user message to UI
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/ai/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: textToSend,
                    session_id: sessionId,
                    language: language,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data: ChatResponse = await response.json();

            // Add bot response to UI
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
            };
            setMessages(prev => [...prev, botMessage]);

            // Update session ID
            if (data.session_id) {
                setSessionId(data.session_id);
            }

            // Update suggestions
            if (data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: language === 'sw'
                    ? 'Samahani, nimepata tatizo. Tafadhali jaribu tena.'
                    : 'Sorry, I encountered an error. Please try again.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'sw' ? 'en' : 'sw');
        // Reset conversation when changing language
        setMessages([]);
        setSessionId(null);
        setSuggestions([]);
    };

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
                    aria-label="Open FugajiBot"
                >
                    <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">FugajiBot</h3>
                                <p className="text-xs text-blue-100">
                                    {language === 'sw' ? 'Msaidizi wako wa kufuga' : 'Your farming assistant'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleLanguage}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title={language === 'sw' ? 'Switch to English' : 'Badili kwa Kiswahili'}
                            >
                                <Languages className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    {/* Message bubble */}
                                    <div className={`p-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-sm text-gray-600">
                                        {language === 'sw' ? 'Inafikiri...' : 'Thinking...'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && !isLoading && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-white">
                            <p className="text-xs text-gray-500 mb-2">
                                {language === 'sw' ? 'Maswali yanayopendekezwa:' : 'Suggested questions:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => sendMessage(suggestion)}
                                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex space-x-2">
                            <Input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={language === 'sw' ? 'Andika ujumbe...' : 'Type a message...'}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 px-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            {language === 'sw'
                                ? 'Imeundwa na AI - Thibitisha ushauri muhimu'
                                : 'Powered by AI - Verify important advice'}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default FugajiBot;
