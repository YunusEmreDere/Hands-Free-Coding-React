import { useState, useRef, useEffect } from 'react';
import useChatStore from '../store/chatStore';

export default function ChatInterface() {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    addMessage({ role: 'user', content: input });

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `Received your message: '${input}'. Processing analysis...`
      });
    }, 500);

    setInput('');
  };

  return (
    <div
      className="w-full bg-[#0f0f1a]/60 backdrop-blur-xl border border-purple-primary/15 rounded-2xl p-4 h-full flex flex-col"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-gradient-purple-cyan'
                  : 'bg-[#1a1a2e] border border-purple-primary/30'
              }`}
            >
              {message.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Message Content */}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-dark-bg border border-purple-primary/60 text-white rounded-tr-sm text-right'
                  : 'bg-dark-bg border border-gray-600/50 text-gray-300 rounded-tl-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-purple-primary/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-dark-bg border border-purple-primary/40 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-purple-cyan text-white rounded-xl hover:opacity-80 transition-opacity font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
