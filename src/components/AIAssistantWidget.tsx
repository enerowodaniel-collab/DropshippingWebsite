import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProducts } from '@/lib/hooks';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { products } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: userMsg, products }),
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();

      if (data.fallback) {
        // Local fallback matching
        const lower = userMsg.toLowerCase();
        let matches = products.filter((p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.short_description?.toLowerCase().includes(lower) ||
          p.benefits.some((b) => b.toLowerCase().includes(lower))
        );
        if (matches.length === 0) {
          const keywords = lower.split(/\s+/).filter((w) => w.length > 3);
          matches = products.filter((p) =>
            keywords.some((k) =>
              p.name.toLowerCase().includes(k) ||
              p.description.toLowerCase().includes(k) ||
              p.benefits.some((b) => b.toLowerCase().includes(k))
            )
          );
        }
        matches = matches.slice(0, 3);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: matches.length > 0
              ? `Here are some products that might match what you are looking for:`
              : `I could not find any products matching "${userMsg}". Try asking about audio, desk accessories, wearables, or charging products.`,
            products: matches.length > 0 ? matches : undefined,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply, products: data.products },
        ]);
      }
    } catch {
      // Fallback to local matching
      const lower = userMsg.toLowerCase();
      let matches = products.filter((p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.short_description?.toLowerCase().includes(lower)
      );
      if (matches.length === 0) {
        const keywords = lower.split(/\s+/).filter((w) => w.length > 3);
        matches = products.filter((p) =>
          keywords.some((k) =>
            p.name.toLowerCase().includes(k) ||
            p.description.toLowerCase().includes(k) ||
            p.benefits.some((b) => b.toLowerCase().includes(k))
          )
        );
      }
      matches = matches.slice(0, 3);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: matches.length > 0
            ? `Here are some products that match your request:`
            : `I could not find any products matching that. Try asking about audio, desk accessories, wearables, or charging products.`,
          products: matches.length > 0 ? matches : undefined,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 animate-fade-in"
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-5 w-5" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[500px] max-h-[80vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-400" />
          <div>
            <p className="text-sm font-semibold text-white">AI Shopping Assistant</p>
            <p className="text-xs text-neutral-400">Ask me about products</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="rounded p-1 text-neutral-400 hover:text-white" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sm text-neutral-500">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
            <p>Hi! I can help you find products, compare options, and answer questions about our catalog.</p>
            <div className="mt-4 space-y-2">
              {['What are your best sellers?', 'I need wireless earbuds under $100', 'Show me desk accessories'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-700 transition hover:bg-neutral-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-800'
            }`}>
              <p>{msg.content}</p>
              {msg.products && msg.products.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.products.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg bg-white p-2 transition hover:shadow-sm"
                    >
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-900 truncate">{p.name}</p>
                        <p className="text-xs text-primary-600">{formatPrice(Number(p.price))}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-neutral-100 px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about products..."
            className="input text-sm"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="rounded-lg bg-primary-600 p-2.5 text-white transition hover:bg-primary-700 disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
