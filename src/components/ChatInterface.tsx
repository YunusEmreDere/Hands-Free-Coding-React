import { useState, useRef, useEffect } from 'react';
import useChatStore from '../store/chatStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatInterface() {
  const { messages, addMessage, updateLastMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Buffer for incoming WebSocket tokens to reduce re-renders
  const bufferRef = useRef('');
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushBuffer = () => {
    if (bufferRef.current) {
      updateLastMessage(bufferRef.current);
      bufferRef.current = '';
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // 30 saniye boyunca veri gelmezse bağlantıyı kes
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    }, 30_000);
  };

  const handleCancel = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    flushBuffer();
    if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage({ role: 'user', content: userMessage });
    addMessage({ role: 'assistant', content: '' });

    try {
      const ws = new WebSocket('ws://127.0.0.1:8000/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          message: userMessage,
          model: "qwen2.5-coder:7b"
        }));
        resetTimeout();

        // Buffer'ı her 50ms'de flush et (re-render sayısını azaltır)
        flushTimerRef.current = setInterval(flushBuffer, 50);
      };

      // Backend'den her harf geldiğinde buffer'a ekle
      ws.onmessage = (event) => {
        bufferRef.current += event.data;
        resetTimeout();
      };

      ws.onclose = () => {
        // Kalan buffer'ı flush et
        flushBuffer();
        if (flushTimerRef.current) clearInterval(flushTimerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsLoading(false);
      };

      ws.onerror = (error) => {
        console.error("WebSocket Hatası:", error);
        flushBuffer();
        if (flushTimerRef.current) clearInterval(flushTimerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        updateLastMessage("\n\nBağlantı hatası oluştu. Backend açık mı?");
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Hata:", error);
      setIsLoading(false);
    }
  };

  // --- 1. KAYDET BUTONU BİLEŞENİ ---
  const SaveButton = ({ text, filename }: { text: string, filename: string }) => {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleSave = async () => {
      setStatus('saving');
      try {
        const response = await fetch('http://127.0.0.1:8000/save-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: filename || `script_${Date.now()}.py`,
            content: text
          })
        });

        if (!response.ok) throw new Error('Sunucu hatası');
        
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error(error);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    };

    return (
      <button
        onClick={handleSave}
        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 border flex items-center gap-1 ${
          status === 'saved' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
          status === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
          'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'
        }`}
      >
        {status === 'saving' ? '⏳' : status === 'saved' ? '✅' : '💾'} {filename || 'Kaydet'}
      </button>
    );
  };

  // --- 2. KOPYALA BUTONU BİLEŞENİ ---
  const CopyButton = ({ text }: { text: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
      if (!navigator.clipboard) return;
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Kopyalama başarısız:', err);
      }
    };

    return (
      <button
        onClick={handleCopy}
        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 border ${
          isCopied 
            ? 'bg-green-500/20 text-green-400 border-green-500/50' 
            : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-600 hover:text-white'
        }`}
      >
        {isCopied ? 'Kopyalandı!' : 'Kopyala'}
      </button>
    );
  };

  return (
    <div
      className="w-full bg-theme-panel/60 backdrop-blur-xl border border-purple-primary/15 rounded-2xl p-4 h-full flex flex-col"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-primary/20">
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
                  : 'bg-theme-border border border-purple-primary/30'
              }`}
            >
              {message.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Mesaj İçeriği + MARKDOWN RENDERER */}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-md overflow-hidden ${
                message.role === 'user' 
                  ? 'bg-purple-900/40 border border-purple-500/30 text-white rounded-tr-sm text-right' 
                  : 'bg-theme-border/90 border border-gray-700/50 text-gray-200 rounded-tl-sm'
            }`}>

              <ReactMarkdown
                components={{
                  code(props) {
                    const {children, className, node, ...rest} = props
                    
                    // 1. Regex ile "language-python:main.py" formatını yakala
                    // \S+ boşluk olmayan her şeyi alır (nokta ve iki nokta dahil)
                    const match = /language-(\S+)/.exec(className || '')
                    
                    // Kod içeriğini temizle (sondaki boşlukları at)
                    const codeText = String(children).replace(/\n$/, '');

                    // 2. Dil ve Dosya Adı Ayrıştırması
                    const fullLangString = match ? match[1] : '';
                    let language = fullLangString; // Varsayılan: python
                    let filename = '';             // Varsayılan: boş
                    
                    // Eğer iki nokta varsa (python:main.py) parçala
                    if (fullLangString.includes(':')) {
                      const parts = fullLangString.split(':');
                      language = parts[0]; // "python"
                      filename = parts[1]; // "main.py"
                    }

                    // 3. Kod Bloğu (Block) mu, Satır İçi (Inline) mi?
                    return match ? (
                      // --- BLOK KOD (```) ---
                      <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700/50 shadow-lg bg-[#151520]">
                        
                        {/* ÜST BİLGİ ÇUBUĞU (HEADER) */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-gray-700/30">
                          
                          {/* Sol Taraf: Dil ve Dosya Adı */}
                          <div className="flex items-center gap-2 text-xs font-mono select-none">
                            <span className="text-purple-400 font-bold uppercase">{language}</span>
                            {filename ? (
                               <span className="text-gray-400 opacity-70">/ {filename}</span>
                            ) : (
                               <span className="text-gray-600 italic">/ (İsimsiz)</span>
                            )}
                          </div>

                          {/* Sağ Taraf: Butonlar */}
                          <div className="flex items-center gap-2">
                            {/* Dosya adı olsa da olmasa da butonu gösteriyoruz */}
                            <SaveButton text={codeText} filename={filename} />
                            <CopyButton text={codeText} />
                          </div>
                        </div>

                        {/* KOD GÖSTERİM ALANI */}
                        {/* @ts-ignore */}
                        <SyntaxHighlighter
                          {...rest}
                          children={codeText}
                          style={dracula}
                          language={language} // "python:main.py" değil sadece "python" veriyoruz
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: '1rem',      // Header olduğu için padding'i azalttık
                            background: 'transparent', // Arkaplanı container'dan alsın
                            fontSize: '0.9rem',
                            lineHeight: '1.5'
                          }}
                          codeTagProps={{
                            style: { fontFamily: 'JetBrains Mono, monospace' }
                          }}
                        />
                      </div>
                    ) : (
                      // --- SATIR İÇİ KOD (`) ---
                      <code {...rest} className="bg-gray-700/50 px-1.5 py-0.5 rounded text-purple-300 font-mono text-sm border border-gray-600/30">
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>

            </div>
          </div>
        ))}

        {/* Yükleniyor Animasyonu */}
        {isLoading && (
            <div className="flex items-center gap-2 text-purple-400 text-sm ml-4 mt-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                Thinking...
                <button onClick={handleCancel} className="ml-2 px-2 py-0.5 rounded border border-red-500/50 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                  Durdur
                </button>
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-purple-primary/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message here..."
            className="flex-1 bg-theme-bg border border-purple-primary/40 rounded-xl px-4 py-3 text-theme-text placeholder-theme-text-faint focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-purple-cyan text-white rounded-xl hover:opacity-80 transition-opacity font-medium"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}