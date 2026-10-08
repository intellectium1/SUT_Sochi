import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import {
  CHAT_CHANNELS,
  ChatMessage,
  fetchServerChatMessages,
  sendServerChatMessage,
} from '../data/chatData';
import {
  MessageSquare,
  Send,
  X,
  Maximize2,
  Users,
  Code2,
  Radio,
  Sparkles
} from 'lucide-react';
import { playByteSound } from '../utils/byteAudio';

interface FloatingChatDrawerProps {
  currentStudent: StudentProfile;
  onOpenFullChat: () => void;
}

export const FloatingChatDrawer: React.FC<FloatingChatDrawerProps> = ({
  currentStudent,
  onOpenFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [channelId, setChannelId] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchServerChatMessages().then((data) => {
      setMessages(data);
    });

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat:message') {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            if (!isOpen) {
              setUnreadCount((c) => c + 1);
            }
          } else if (data.type === 'chat:history') {
            setMessages(data.messages);
          }
        } catch (e) {
          // ignore
        }
      };
      ws.onerror = () => {
        // Handled silently
      };
    } catch (e) {
      // ignore
    }

    return () => {
      if (ws) {
        try {
          ws.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, channelId]);

  const channelMessages = messages.filter((m) => m.channelId === channelId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textToSend = input.trim();
    setInput('');

    const saved = await sendServerChatMessage({
      channelId,
      senderId: currentStudent.id,
      senderName: currentStudent.name,
      senderCallsign: currentStudent.callsign,
      senderAvatar: currentStudent.avatar,
      senderDepartment: currentStudent.department,
      senderRole: 'student',
      text: textToSend,
    });

    setMessages((prev) => [...prev, saved]);
    playByteSound('beep');
  };

  return (
    <>
      {/* Floating Trigger Button on bottom right (above LivingByte) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
            playByteSound('beep');
          }}
          className="fixed bottom-20 right-5 z-40 bg-slate-900/90 hover:bg-slate-850 text-cyan-300 hover:text-white px-3.5 py-2.5 rounded-full border border-cyan-500/40 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
          title="Открыть чат учащихся СЮТ Сочи"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>Чат СЮТ</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
              +{unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Compact Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 h-[480px] max-h-[80vh] bg-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Чат СЮТ Сочи</div>
                <div className="text-[10px] font-mono text-cyan-400">15 учеников онлайн</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullChat();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Развернуть на весь экран"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Свернуть"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Channel Selector Pills */}
          <div className="p-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[11px] scrollbar-none">
            {CHAT_CHANNELS.slice(0, 4).map((ch) => (
              <button
                key={ch.id}
                onClick={() => setChannelId(ch.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  channelId === ch.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch.icon} {ch.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {channelMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs">
                Пока нет сообщений в этом канале
              </div>
            ) : (
              channelMessages.map((m) => {
                const isMine = m.senderId === currentStudent.id;
                const isByte = m.senderId === 'byte-ai';

                return (
                  <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mb-0.5">
                      <span className="font-bold text-white">{m.senderName}</span>
                      <span>@{m.senderCallsign}</span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                        isMine
                          ? 'bg-cyan-600/30 border border-cyan-500/40 text-cyan-100 rounded-tr-none'
                          : isByte
                          ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200 rounded-tl-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{m.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Написать (назовите @Байт)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
