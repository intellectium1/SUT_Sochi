import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, MessageSquare } from 'lucide-react';

interface MascotMentorChatProps {
  onEarnXp: (xp: number, reason?: string) => void;
  onIncrementQuestionCount: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'byte';
  text: string;
  time: string;
}

export const MascotMentorChat: React.FC<MascotMentorChatProps> = ({
  onEarnXp,
  onIncrementQuestionCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'byte',
      text: 'Привет, юный инженер! Я Байт — твой робот-наставник в Станции Юных Техников Сочи. Задай мне любой вопрос об искусственном интеллекте, кодинге или роботах!',
      time: '12:00',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'user',
        text: userText,
        time: now,
      },
    ]);

    setLoading(true);
    onIncrementQuestionCount();

    try {
      const res = await fetch('/api/ai/ask-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          topic: 'Консультация ученика СЮТ',
        }),
      });
      const data = await res.json();
      const answerText = data.answer || 'Отличный инженерный вопрос! Продолжай исследовать в лаборатории СЮТ!';

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'byte',
          text: answerText,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      onEarnXp(15);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'byte',
          text: 'В ИИ самое интересное — это эксперименты! Попробуй протестировать эту идею в нашей песочнице кода!',
          time: now,
        },
      ]);
      onEarnXp(10);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Как нейросеть обучается на ошибках?',
    'Посоветуй датчик для робота в море',
    'Что такое галлюцинации у ИИ?',
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer font-bold text-xs"
          title="Спросить робота-наставника Байта"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline">Спросить робота Байта</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-lg">
                🤖
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Робот Байт</span>
                  <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Наставник СЮТ Сочи (Gemini 3.8 Flash)
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-850 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <span className="animate-spin text-cyan-400">⚙️</span>
                <span>Байт формулирует ответ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-500 whitespace-nowrap">Спросить:</span>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => setInput(qp)}
                className="whitespace-nowrap px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спроси у робота Байта..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
