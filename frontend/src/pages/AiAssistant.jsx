import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I can help you analyze team reports. Ask me about blockers, team activity, or request a summary.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role !== 'system').slice(-6);
      const { data } = await api.post('/ai/chat', { message: userMsg, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, source: data.source }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/summary');
      setSummary(data.summary);
    } catch {
      setSummary('Unable to generate summary at this time.');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What blockers does the team have?',
    'Give me a team activity summary',
    'What did Alice work on recently?',
    'Which projects have the most activity?',
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-slate-500 text-sm mt-1">Ask questions about team reports and activity</p>
        </div>
        <button onClick={generateSummary} className="btn-primary" disabled={loading}>
          <Sparkles size={16} /> Generate Team Summary
        </button>
      </div>

      {summary && (
        <div className="card p-5 mb-6 bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-primary-700 mb-2">AI Team Summary</h3>
          <p className="text-sm text-slate-700 whitespace-pre-line">{summary}</p>
        </div>
      )}

      <div className="card flex flex-col h-[calc(100vh-220px)]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.source === 'fallback' && (
                  <p className="text-xs mt-1 opacity-60">(Rule-based fallback — Ollama not available)</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Bot size={16} className="text-slate-600" />
              </div>
              <div className="bg-slate-100 rounded-xl px-4 py-3 text-sm text-slate-400">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about team activity..."
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
