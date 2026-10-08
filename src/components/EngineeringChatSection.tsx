import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import {
  CHAT_CHANNELS,
  ChatMessage,
  ChatChannel,
  fetchServerChatMessages,
  sendServerChatMessage,
  toggleServerChatReaction,
} from '../data/chatData';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Sparkles,
  Bot,
  Copy,
  Check,
  Code2,
  Smile,
  Zap,
  Search,
  ChevronRight,
  Shield,
  Circle,
  Radio,
  Flame,
  ThumbsUp,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { playByteSound } from '../utils/byteAudio';

interface EngineeringChatSectionProps {
  currentStudent: StudentProfile;
  students: StudentProfile[];
}

export const EngineeringChatSection: React.FC<EngineeringChatSectionProps> = ({
  currentStudent,
  students,
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [activeDmStudentId, setActiveDmStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [codeSnippetText, setCodeSnippetText] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set([currentStudent.id, 'sut-student-02', 'sut-student-04', 'sut-student-07']));
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and poll or WebSocket connect
  useEffect(() => {
    // 1. Initial REST fetch
    fetchServerChatMessages().then((data) => {
      setMessages(data);
    });

    // 2. Establish real-time WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        // Announce presence
        ws.send(
          JSON.stringify({
            type: 'chat:join',
            student: {
              id: currentStudent.id,
              name: currentStudent.name,
              callsign: currentStudent.callsign,
              avatar: currentStudent.avatar,
              department: currentStudent.department,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat:history') {
            setMessages(data.messages);
          } else if (data.type === 'chat:message') {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            playByteSound('beep');
          } else if (data.type === 'presence:update') {
            const ids = new Set<string>(data.onlineUsers.map((u: any) => u.id));
            ids.add(currentStudent.id);
            setOnlineUserIds(ids);
          } else if (data.type === 'chat:typing') {
            if (data.isTyping && data.user?.name) {
              setIsTyping(data.user.name);
            } else {
              setIsTyping(null);
            }
          } else if (data.type === 'chat:reaction') {
            setMessages((prev) =>
              prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
            );
          }
        } catch (e) {
          console.warn('WS message error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch (e) {
      // WebSocket gracefully handled, falling back to polling
    }

    // 3. Fallback auto-sync polling every 4 seconds to guarantee updates in all environments
    const pollInterval = setInterval(() => {
      fetchServerChatMessages().then((data) => {
        if (data && data.length > 0) {
          setMessages((prev) => {
            if (data.length !== prev.length || (data[data.length - 1]?.id !== prev[prev.length - 1]?.id)) {
              return data;
            }
            return prev;
          });
        }
      });
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [currentStudent.id, currentStudent.name, currentStudent.callsign, currentStudent.avatar, currentStudent.department]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId, activeDmStudentId]);

  // Current Target Channel Key
  const currentTargetChannel = activeDmStudentId ? `dm_${[currentStudent.id, activeDmStudentId].sort().join('_')}` : activeChannelId;

  // Filter messages by channel or DM
  const currentMessages = messages.filter((m) => {
    const matchesChannel = m.channelId === currentTargetChannel;
    if (!searchQuery.trim()) return matchesChannel;
    const q = searchQuery.toLowerCase();
    return (
      matchesChannel &&
      (m.text.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.senderCallsign.toLowerCase().includes(q) ||
        (m.codeSnippet && m.codeSnippet.toLowerCase().includes(q)))
    );
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !codeSnippetText.trim()) return;

    const textToSend = inputText.trim();
    const snippetToSend = codeSnippetText.trim() || undefined;

    setInputText('');
    setCodeSnippetText('');
    setShowCodeInput(false);

    const payload = {
      channelId: currentTargetChannel,
      senderId: currentStudent.id,
      senderName: currentStudent.name,
      senderCallsign: currentStudent.callsign,
      senderAvatar: currentStudent.avatar,
      senderDepartment: currentStudent.department,
      senderRole: 'student' as const,
      text: textToSend,
      codeSnippet: snippetToSend,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat:message',
          message: payload,
        })
      );
    } else {
      const saved = await sendServerChatMessage(payload);
      setMessages((prev) => [...prev, saved]);
    }

    playByteSound('beep');
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat:reaction',
          messageId,
          emoji,
          studentId: currentStudent.id,
        })
      );
    } else {
      const updated = await toggleServerChatReaction(messageId, emoji, currentStudent.id);
      if (updated) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
      }
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat:typing',
          user: { name: currentStudent.name, channelId: currentTargetChannel },
          isTyping: true,
        })
      );

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'chat:typing',
              user: { name: currentStudent.name, channelId: currentTargetChannel },
              isTyping: false,
            })
          );
        }
      }, 1500);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const activeDmPartner = activeDmStudentId ? students.find((s) => s.id === activeDmStudentId) : null;
  const currentChannelMeta = CHAT_CHANNELS.find((c) => c.id === activeChannelId) || CHAT_CHANNELS[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[780px] max-h-[85vh] animate-fadeIn">
      {/* ================= LEFT SIDEBAR: CHANNELS & 15 STUDENTS ================= */}
      <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Header / Network Status */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Эфир СЮТ Сочи</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{wsConnected ? 'WebSocket онлайн' : 'Синхронизация'}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
            {onlineUserIds.size} онлайн
          </div>
        </div>

        {/* Scrollable channels & DM list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Section 1: Public Engineering Channels */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2.5 font-bold flex items-center justify-between">
              <span>Каналы лабораторий</span>
              <span>{CHAT_CHANNELS.length}</span>
            </div>

            {CHAT_CHANNELS.map((ch) => {
              const isActive = !activeDmStudentId && activeChannelId === ch.id;
              const unreadCount = messages.filter((m) => m.channelId === ch.id).length;

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannelId(ch.id);
                    setActiveDmStudentId(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm">{ch.icon}</span>
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {ch.badge ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {ch.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section 2: Direct Messages with the 15 Students */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2.5 font-bold flex items-center justify-between">
              <span>Ученики СЮТ (ЛС)</span>
              <span>15 учащихся</span>
            </div>

            {/* Robot Byte as permanent AI participant */}
            <button
              onClick={() => {
                setActiveDmStudentId('byte-ai');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeDmStudentId === 'byte-ai'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base p-1 bg-purple-950/80 rounded-lg border border-purple-500/30">🤖</span>
                <div>
                  <div className="text-white text-xs leading-tight">Робот Байт</div>
                  <div className="text-[10px] font-mono text-purple-400">ИИ-наставник СЮТ</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* All Students Roster */}
            {students.map((st) => {
              if (st.id === currentStudent.id) return null; // don't DM self
              const isOnline = onlineUserIds.has(st.id);
              const isSelectedDm = activeDmStudentId === st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setActiveDmStudentId(st.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelectedDm
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{st.avatar}</span>
                    <div className="truncate">
                      <div className="text-white text-xs truncate leading-tight">{st.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">@{st.callsign}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-700'}`}
                      title={isOnline ? 'Онлайн' : 'Не в сети'}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Student Profile bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl p-1 bg-slate-950 rounded-lg border border-slate-800">{currentStudent.avatar}</span>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate leading-tight">{currentStudent.name}</div>
              <div className="text-[10px] font-mono text-cyan-400 truncate">@{currentStudent.callsign}</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            Вы
          </span>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: MAIN CHAT FEED & INPUT ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60">
        {/* Chat Feed Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {activeDmPartner ? (
              <>
                <span className="text-2xl">{activeDmPartner.avatar}</span>
                <div className="truncate">
                  <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                    <span>{activeDmPartner.name}</span>
                    <span className="text-xs font-mono text-cyan-400">(@{activeDmPartner.callsign})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Личный диалог · {activeDmPartner.department} ({activeDmPartner.grade})
                  </div>
                </div>
              </>
            ) : activeDmStudentId === 'byte-ai' ? (
              <>
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Робот Байт</span>
                    <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40">ИИ-наставник</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Прямой диалог с виртуальным наставником СЮТ</div>
                </div>
              </>
            ) : (
              <>
                <span className="text-xl">{currentChannelMeta.icon}</span>
                <div className="truncate">
                  <div className="text-sm font-bold text-white truncate">
                    #{currentChannelMeta.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentChannelMeta.description}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search bar in chat */}
          <div className="relative w-44 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по сообщениям..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-2xl">
                💬
              </div>
              <div className="text-sm font-bold text-slate-300">В этом канале пока нет сообщений</div>
              <div className="text-xs max-w-sm text-slate-400">
                Напишите первое сообщение или задайте технический вопрос коллегам по кружку СЮТ!
              </div>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isMine = msg.senderId === currentStudent.id;
              const isByte = msg.senderId === 'byte-ai';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group animate-fadeIn ${
                    isMine ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                      isByte
                        ? 'bg-purple-950 border-purple-500/50 shadow-md shadow-purple-500/20'
                        : isMine
                        ? 'bg-cyan-950 border-cyan-500/40'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    {msg.senderAvatar}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-xl space-y-1.5 ${
                      isMine ? 'items-end text-right' : 'text-left'
                    }`}
                  >
                    {/* Header: Name, Callsign, Time */}
                    <div
                      className={`flex items-center gap-2 text-[11px] font-mono ${
                        isMine ? 'justify-end' : ''
                      }`}
                    >
                      <span className="font-bold text-white">{msg.senderName}</span>
                      <span className="text-slate-500">@{msg.senderCallsign}</span>
                      {msg.senderDepartment && (
                        <span className="text-[10px] text-cyan-400 px-1 py-0.2 rounded bg-slate-850 border border-cyan-500/20">
                          {msg.senderDepartment}
                        </span>
                      )}
                      <span className="text-slate-500">{msg.createdAt}</span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 border ${
                        isMine
                          ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-100 rounded-tr-none'
                          : isByte
                          ? 'bg-purple-950/50 border-purple-500/50 text-purple-100 rounded-tl-none shadow-lg'
                          : 'bg-slate-800/90 border-slate-700 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Code Snippet Box if present */}
                      {msg.codeSnippet && (
                        <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-left">
                          <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Code2 className="w-3 h-3 text-cyan-400" />
                              <span>Инженерный код</span>
                            </span>
                            <button
                              onClick={() => copyCode(msg.codeSnippet!, msg.id)}
                              className="hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedCodeId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Скопировано</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Копировать</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                            <code>{msg.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Reactions Bar */}
                    <div
                      className={`flex flex-wrap items-center gap-1 pt-0.5 ${
                        isMine ? 'justify-end' : ''
                      }`}
                    >
                      {msg.reactions &&
                        Object.entries(msg.reactions).map(([emoji, users]) => {
                          const hasReacted = users.includes(currentStudent.id);
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-mono border flex items-center gap-1 transition-colors cursor-pointer ${
                                hasReacted
                                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="font-bold">{users.length}</span>
                            </button>
                          );
                        })}

                      {/* Quick Add Reaction Popover triggers */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        {['👍', '🚀', '💡', '⚡', '🔥'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="p-1 text-xs hover:scale-125 transition-transform cursor-pointer"
                            title={`Поставить ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 italic animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{isTyping} печатает...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2.5">
          {/* Quick Mention chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Быстрое обращение:</span>
            <button
              onClick={() => handleTyping(`${inputText} @Байт `)}
              className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              @Байт
            </button>
            <button
              onClick={() => handleTyping(`${inputText} @все `)}
              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              @все
            </button>
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`px-2 py-0.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                showCodeInput
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>{showCodeInput ? 'Скрыть код' : '+ Вставить код'}</span>
            </button>
          </div>

          {/* Expandable Code Snippet Input */}
          {showCodeInput && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-cyan-400">Вставка фрагмента программы (Python / C++ / JS):</div>
              <textarea
                value={codeSnippetText}
                onChange={(e) => setCodeSnippetText(e.target.value)}
                placeholder="Вставьте исходный код или математическую формулу сюда..."
                rows={3}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-2.5 text-xs text-cyan-200 font-mono focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Text Input Row */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder={
                activeDmPartner
                  ? `Сообщение для @${activeDmPartner.callsign}...`
                  : `Сообщение в #${currentChannelMeta.name} (упомяните @Байт для ответа ИИ)...`
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !codeSnippetText.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Отправить</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
