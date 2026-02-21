import { useState, useRef, useEffect, useMemo } from 'react';
import useChatStore from '../store/chatStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { diffLines } from 'diff';

const API_BASE = 'http://127.0.0.1:8000';

// ─── Inline diff + apply panel (shown below each code block) ───────────────
function InlineCodeAction({ newCode, filename }: { newCode: string; filename: string }) {
  const [oldCode, setOldCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/read-file-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filename }),
    })
      .then(r => r.ok ? r.json() : { content: '' })
      .then(data => setOldCode(data.content ?? ''))
      .catch(() => setOldCode(''));
  }, [filename]);

  const diffLinesList = useMemo(() => {
    if (oldCode === null) return [];
    const parts = diffLines(oldCode, newCode);
    const result: { type: 'added' | 'removed' | 'unchanged'; content: string }[] = [];
    for (const part of parts) {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      for (const line of lines) {
        result.push({
          type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
          content: line,
        });
      }
    }
    return result;
  }, [oldCode, newCode]);

  const added   = diffLinesList.filter(l => l.type === 'added').length;
  const removed = diffLinesList.filter(l => l.type === 'removed').length;

  const handleApply = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${API_BASE}/save-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: newCode }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      setSaveError('Kaydetme başarısız');
      setTimeout(() => setSaveError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d1a]">
      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/30">
        <div className="flex items-center gap-3 text-xs font-mono">
          {oldCode === null ? (
            <span className="text-gray-500 animate-pulse">Yükleniyor...</span>
          ) : (
            <>
              <span className="text-gray-600 truncate max-w-[200px]">{filename}</span>
              {added   > 0 && <span className="text-green-400 font-bold">+{added}</span>}
              {removed > 0 && <span className="text-red-400   font-bold">-{removed}</span>}
              {added === 0 && removed === 0 && (
                <span className="text-gray-500 italic">değişiklik yok</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveError && <span className="text-red-400 text-xs">{saveError}</span>}
          {saved ? (
            <span className="text-green-400 text-xs font-semibold">✓ Kaydedildi</span>
          ) : (
            <button
              onClick={handleApply}
              disabled={saving || oldCode === null}
              className="px-3 py-1 bg-green-700/70 hover:bg-green-600 text-white text-xs rounded-md font-semibold transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              {saving
                ? <><span className="animate-spin inline-block">⏳</span> Kaydediliyor</>
                : <>✓ Uygula</>}
            </button>
          )}
        </div>
      </div>

      {/* Changed lines only */}
      {oldCode !== null && (added > 0 || removed > 0) && (
        <div className="flex-1 overflow-y-auto">
          {diffLinesList.map((line, i) => {
            if (line.type === 'unchanged') return null;
            return (
              <div
                key={i}
                className={`flex items-start px-4 py-px text-[11px] font-mono leading-5 ${
                  line.type === 'added'
                    ? 'bg-green-500/10 text-green-300 border-l-2 border-green-500'
                    : 'bg-red-500/10   text-red-400   border-l-2 border-red-500'
                }`}
              >
                <span className="mr-2 flex-shrink-0 select-none opacity-60">
                  {line.type === 'added' ? '+' : '-'}
                </span>
                <span className="break-all">{line.content || ' '}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ChatInterfaceProps{
  selectedFile?: any | null;
}

export default function ChatInterface({ selectedFile }: ChatInterfaceProps = {}) {
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

      let currentFileContent = "";
      const currentFileName = selectedFile?.path || "";
      console.log("Seçili Dosya Adı:", currentFileName);

      if(currentFileName){
        try{
          const res = await fetch(`${API_BASE}/read-file-content`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({path: currentFileName})
          });

          if(res.ok){
            const data = await res.json();
            currentFileContent = data.content;
          }
        }catch (err){
          console.error("Dosya içeriği okunamadı:", err);
        }
      }

      const ws = new WebSocket('ws://127.0.0.1:8000/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        // 3. KONTROL: WebSocket'e giden paket
        const payload = {
          message: userMessage,
          model: "qwen2.5-coder:7b",
          fileName: currentFileName,
          fileContent: currentFileContent
        };
        console.log("WebSocket'e Gönderilen Paket:", payload);
        
        ws.send(JSON.stringify(payload));
        resetTimeout();
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

  // --- KOPYALA BUTONU BİLEŞENİ ---
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
            <div className={`max-w-[95%] w-full px-4 py-3 rounded-2xl shadow-md overflow-hidden ${
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
                            <CopyButton text={codeText} />
                          </div>
                        </div>

                        {/* KOD + DIFF YAN YANA */}
                        <div className="flex items-stretch">
                          {/* Sol: Kod */}
                          <div className="flex-1 min-w-0">
                            {/* @ts-ignore */}
                            <SyntaxHighlighter
                              {...rest}
                              children={codeText}
                              style={dracula}
                              language={language}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: 'transparent',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                              }}
                              codeTagProps={{
                                style: { fontFamily: 'JetBrains Mono, monospace' }
                              }}
                            />
                          </div>
                          {/* Sağ: Diff paneli (sadece dosya adı varsa) */}
                          {filename && (
                            <div className="w-[500px] xl:w-[600px] flex-shrink-0 border-l border-gray-700/40">
                              <InlineCodeAction newCode={codeText} filename={filename} />
                            </div>
                          )}
                        </div>
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

      {/* Seçili dosya bağlam pill'i */}
      {selectedFile && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg bg-purple-primary/8 border border-purple-primary/20 text-[11px] font-mono">
          <span className="text-purple-primary/70">📎 Bağlam:</span>
          <span className="text-purple-primary font-semibold truncate">{selectedFile.name}</span>
          <span className="text-theme-text-faint truncate hidden sm:block">— {selectedFile.path}</span>
          {selectedFile.lines && (
            <span className="ml-auto text-theme-text-faint flex-shrink-0">{selectedFile.lines} satır</span>
          )}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-purple-primary/20">
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