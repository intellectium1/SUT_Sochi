import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Volume2, VolumeX, X, Zap, Cpu, BatteryCharging, ArrowDownRight, RefreshCw, MessageSquare, Shield } from 'lucide-react';
import { playByteSound, speakByteMessage, stopByteSpeech } from '../utils/byteAudio';
import { BYTE_SKINS, ByteSkin } from '../data/themeCustomizationData';

interface LivingByteProps {
  tokenBalance: number;
  byteSkinId?: string;
  onConsumeTokens: (amount: number) => void;
  onEarnXp: (amount: number, reason?: string) => void;
  onIncrementQuestionCount: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'byte';
  text: string;
  time: string;
  tokensUsed?: number;
}

export const LivingByte: React.FC<LivingByteProps> = ({
  tokenBalance,
  byteSkinId = 'skin-classic',
  onConsumeTokens,
  onEarnXp,
  onIncrementQuestionCount,
}) => {
  const activeSkin = BYTE_SKINS.find((s) => s.id === byteSkinId) || BYTE_SKINS[0];
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'tokens' | 'voice'>('chat');
  const [byteMood, setByteMood] = useState<'idle' | 'thinking' | 'talking' | 'celebrating'>('idle');

  // Audio settings
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Chat state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'byte',
      text: 'Привет, юный инженер! Я Байт — живой робот-наставник СЮТ Сочи. У меня есть доступ к нейро-токенам! Задавай любые технические вопросы, и я покажу, сколько вычислительных токенов мы тратим на ответ!',
      time: '12:00',
      tokensUsed: 42,
    },
  ]);

  // Token Workshop state
  const [promptToOptimize, setPromptToOptimize] = useState(
    'Пожалуйста, если тебе не сложно, напиши мне подробный код для робота на Arduino'
  );
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<{
    originalTokens: number;
    optimizedTokens: number;
    tokensSaved: number;
    optimizedPrompt: string;
    explanation: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastOptimizedPromptRef = useRef<string>('');

  useEffect(() => {
    if (isOpen && activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeSubTab]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Validate token balance: No free compute when balance depleted
    if (tokenBalance <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'user',
          text: userText,
          time: now,
        },
        {
          id: String(Date.now() + 1),
          sender: 'byte',
          text: '⚡ Запас вычислительных токенов исчерпан! Самостоятельное начисление токенов учеником отключено правилами СЮТ. Обратитесь к преподавателю-наставнику для выделения лимита токенов в панели управления.',
          time: now,
        },
      ]);
      setByteMood('idle');
      return;
    }

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
    setByteMood('thinking');
    if (soundEnabled) playByteSound('thinking');
    onIncrementQuestionCount();

    try {
      const res = await fetch('/api/ai/ask-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          topic: 'Консультация с живым роботом Байтом',
        }),
      });
      const data = await res.json();
      const answerText = data.answer || 'Отличный инженерный вопрос! Продолжай исследовать в лаборатории СЮТ!';
      const tokensCount = data.tokens?.totalTokens || Math.ceil((userText.length + answerText.length) / 3.4);

      // Consume tokens and award XP
      onConsumeTokens(tokensCount);
      onEarnXp(15, 'Вопрос роботу-наставнику Байту');

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'byte',
          text: answerText,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          tokensUsed: tokensCount,
        },
      ]);

      setByteMood('talking');
      if (soundEnabled) playByteSound('token');

      if (voiceEnabled) {
        speakByteMessage(answerText);
      }

      setTimeout(() => setByteMood('idle'), 3500);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'byte',
          text: 'В робототехнике главное — пробовать снова! Экспериментируй в песочнице кода!',
          time: now,
          tokensUsed: 25,
        },
      ]);
      setByteMood('idle');
    } finally {
      setLoading(false);
    }
  };

  // Optimize prompt with Byte
  const handleOptimizePrompt = async () => {
    if (!promptToOptimize.trim() || optimizing) return;
    setOptimizing(true);
    setByteMood('thinking');
    if (soundEnabled) playByteSound('thinking');

    try {
      const res = await fetch('/api/ai/byte-optimize-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: promptToOptimize }),
      });
      const data = await res.json();
      setOptimizeResult(data);
      setByteMood('celebrating');
      if (soundEnabled) playByteSound('success');

      if (data.tokensSaved > 0 && promptToOptimize.trim() !== lastOptimizedPromptRef.current) {
        lastOptimizedPromptRef.current = promptToOptimize.trim();
        onEarnXp(20, `Сэкономлено ${data.tokensSaved} токенов при оптимизации!`);
      }
      setTimeout(() => setByteMood('idle'), 3000);
    } catch (err) {
      // Fallback
      setOptimizeResult({
        originalTokens: 28,
        optimizedTokens: 16,
        tokensSaved: 12,
        optimizedPrompt: 'Arduino: напиши код управления роботом с 2 моторами.',
        explanation: 'Убраны вводные слова, сжата формулировка.',
      });
      if (promptToOptimize.trim() !== lastOptimizedPromptRef.current) {
        lastOptimizedPromptRef.current = promptToOptimize.trim();
        onEarnXp(15, 'Оптимизация структуры запроса');
      }
      setByteMood('idle');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <>
      {/* Floating Animated Robot Byte Action Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (soundEnabled) playByteSound('beep');
          }}
          className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-300 hover:scale-105 text-slate-950 p-3 rounded-full shadow-2xl flex items-center gap-3 transition-transform cursor-pointer font-bold text-xs border-2 border-white/20"
          title="Открыть живого робота Байта"
        >
          {/* Animated Pixel Eye Frame */}
          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden border border-cyan-400/50">
            <span className="text-base animate-pulse">{activeSkin.emoji}</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="font-extrabold text-[12px] leading-tight flex items-center gap-1">
              <span>{activeSkin.name}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-900 font-semibold flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>{tokenBalance} токенов</span>
            </span>
          </div>
        </button>
      )}

      {/* Expanded Interactive Byte Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md bg-slate-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[560px] max-h-[90vh] animate-fadeIn">
          {/* Interactive Robot Face Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-3.5 border-b border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Byte's Animated Face Screen */}
              <div className="w-11 h-11 rounded-xl bg-slate-950 border-2 border-cyan-400/80 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20 relative">
                {/* Expressive Pixel Eyes */}
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    byteMood === 'thinking'
                      ? 'bg-amber-400 scale-125 animate-ping'
                      : byteMood === 'celebrating'
                      ? 'bg-emerald-400 scale-125'
                      : 'bg-cyan-400 animate-pulse'
                  }`} />
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    byteMood === 'thinking'
                      ? 'bg-amber-400 scale-125 animate-ping'
                      : byteMood === 'celebrating'
                      ? 'bg-emerald-400 scale-125'
                      : 'bg-cyan-400 animate-pulse'
                  }`} />
                </div>
                {/* Animated Mouth */}
                <div className={`h-0.5 rounded transition-all ${
                  byteMood === 'talking'
                    ? 'w-4 bg-emerald-400 animate-bounce'
                    : byteMood === 'celebrating'
                    ? 'w-5 bg-amber-400'
                    : 'w-3 bg-cyan-400/60'
                }`} />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{activeSkin.emoji}</span>
                    <span>{activeSkin.name}</span>
                  </h3>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    byteMood === 'thinking'
                      ? 'bg-amber-500/20 text-amber-300'
                      : byteMood === 'talking'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {byteMood === 'thinking' ? 'ДУМАЕТ...' : byteMood === 'talking' ? 'ГОВОРИТ' : 'ONLINE'}
                  </span>
                </div>
                {/* Token battery meter & hat */}
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono mt-0.5">
                  <span className="text-cyan-400 font-semibold">{activeSkin.hatTitle}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3 text-cyan-400" />
                    <span><strong className="text-amber-300 tabular-nums">{tokenBalance}</strong> токенов</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls: Audio mute, Voice, Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const next = !voiceEnabled;
                  setVoiceEnabled(next);
                  if (next) speakByteMessage('Голосовой модуль активирован!');
                  else stopByteSpeech();
                }}
                title={voiceEnabled ? 'Выключить голос Байта' : 'Включить голосовой синтез Байта'}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  voiceEnabled ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  stopByteSpeech();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtabs: Chat vs Token Workshop */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-2 py-1 text-[11px] font-semibold">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'chat'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Диалог и советы</span>
            </button>
            <button
              onClick={() => setActiveSubTab('tokens')}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'tokens'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Токен-Лаборатория ({tokenBalance})</span>
            </button>
          </div>

          {/* SUBTAB 1: LIVE CHAT */}
          {activeSubTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-950/70 text-xs">
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

                    <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-1 font-mono">
                      <span>{msg.time}</span>
                      {msg.tokensUsed && (
                        <span className="text-cyan-400 font-semibold">
                          ⚡ {msg.tokensUsed} токенов
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 p-2">
                    <span className="animate-spin text-base">⚙️</span>
                    <span>Байт считает токены и формулирует ответ...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Спроси Байта об ИИ, коде или роботах..."
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

          {/* SUBTAB 2: BYTE'S TOKEN WORKSHOP */}
          {activeSubTab === 'tokens' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/70 text-xs text-slate-200">
              {/* Token Balance Widget */}
              <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 p-4 rounded-xl border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Твой личный запас токенов:</div>
                    <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                      {tokenBalance.toLocaleString()} токенов
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 justify-end text-amber-400 font-semibold">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Лимит СЮТ</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      Контроль наставника
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="text-slate-200">Политика безопасности:</strong> Самостоятельное начисление токенов учеником отключено. Вычислительный баланс выделяется исключительно преподавателем-наставником СЮТ.
                  </p>
                </div>
              </div>

              {/* Token Compressor Tool */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Сжатие и оптимизация токенов Байтом</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Введи любой длинный промпт — Байт удалит «воду», сохранит инженерную задачу и рассчитает сэкономленные токены!
                </p>

                <textarea
                  rows={3}
                  value={promptToOptimize}
                  onChange={(e) => setPromptToOptimize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />

                <button
                  onClick={handleOptimizePrompt}
                  disabled={optimizing || !promptToOptimize.trim()}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {optimizing ? (
                    <span>Байт сжимает токены...</span>
                  ) : (
                    <>
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>Оптимизировать промпт</span>
                    </>
                  )}
                </button>

                {optimizeResult && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/40 space-y-2 animate-fadeIn text-[11px]">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400">Было: {optimizeResult.originalTokens} т.</span>
                      <span className="text-cyan-400 font-bold">Стало: {optimizeResult.optimizedTokens} т.</span>
                      <span className="text-emerald-400 font-bold">Сэкономлено: {optimizeResult.tokensSaved} т.</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-slate-200">
                      {optimizeResult.optimizedPrompt}
                    </div>
                    <p className="text-slate-400 italic">
                      {optimizeResult.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
