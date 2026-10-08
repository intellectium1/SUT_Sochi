import { StudentProfile } from '../types';

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // studentIds
}

export interface ChatMessage {
  id: string;
  channelId: string; // 'general' | 'robotics' | 'programming' | 'it' | 'aeroclub' | 'maritime' | string
  senderId: string;
  senderName: string;
  senderCallsign: string;
  senderAvatar: string;
  senderDepartment?: string;
  senderRole?: 'student' | 'teacher' | 'assistant';
  text: string;
  codeSnippet?: string;
  reactions?: Record<string, string[]>; // emoji -> array of studentIds
  createdAt: string;
  timestamp: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  department?: string;
}

export const CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'general',
    name: 'Главный эфир СЮТ',
    description: 'Общий канал связи всех отделений Станции Юных Техников г. Сочи',
    icon: '⚡',
    badge: 'Все 15',
  },
  {
    id: 'robotics',
    name: 'Робототехника & Сонары',
    description: 'Обсуждение микроконтроллеров ESP32/Arduino, датчиков и подводных роботов',
    icon: '🤖',
    department: 'Робототехника',
  },
  {
    id: 'programming',
    name: 'Программирование & Код',
    description: 'Песочница кода, Python, алгоритмические оптимизации и Canvas симуляторы',
    icon: '💻',
    department: 'Программирование',
  },
  {
    id: 'it',
    name: 'IT & Нейросети',
    description: 'BPE-токенизация, логиты, RCIO-матрица и устранение галлюцинаций ИИ',
    icon: '🧠',
    department: 'IT & ИИ',
  },
  {
    id: 'aeroclub',
    name: 'Аэроклуб & БПЛА',
    description: 'Полетные контроллеры, высотные датчики и аэроразведка горы Ахун',
    icon: '✈️',
    department: 'Аэроклуб',
  },
  {
    id: 'maritime',
    name: 'Судомоделирование & Флот',
    description: 'Автономные катамараны, батискафы и навигация в Черном море',
    icon: '⚓',
    department: 'Судомоделирование',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    channelId: 'general',
    senderId: 'byte-ai',
    senderName: 'Робот Байт',
    senderCallsign: 'Byte_Mentor',
    senderAvatar: '🤖',
    senderRole: 'assistant',
    text: '⚡ Приветствую всех инженеров СЮТ Сочи! Радиоканал связи запущен. Здесь можно обсуждать проекты, делиться кодом из песочницы, задавать вопросы товарищам и вызывать меня через упоминание @Байт!',
    createdAt: 'Сегодня, 10:00',
    timestamp: Date.now() - 3600000 * 4,
    reactions: { '⚡': ['sut-student-01', 'sut-student-02', 'sut-student-04'] },
  },
  {
    id: 'msg-02',
    channelId: 'general',
    senderId: 'sut-student-02',
    senderName: 'Алексей Мельников',
    senderCallsign: 'RoboChief_Sochi',
    senderAvatar: '🤖',
    senderDepartment: 'Робототехника',
    senderRole: 'student',
    text: 'Привет команде! Кто уже тестировал симулятор эхолота на Черноморском полигоне? Удалось засечь стаю дельфинов на дистанции 120 метров!',
    codeSnippet: `// Калибровка сонара на ESP32
float calculateDistance(int echoMicroseconds) {
  return (echoMicroseconds * 0.0343) / 2.0; // см в соленой воде
}`,
    createdAt: 'Сегодня, 10:15',
    timestamp: Date.now() - 3600000 * 3,
    reactions: { '🚀': ['sut-student-01', 'sut-student-05'], '👍': ['sut-student-03'] },
  },
  {
    id: 'msg-03',
    channelId: 'general',
    senderId: 'sut-student-04',
    senderName: 'София Калинина',
    senderCallsign: 'Neural_Craft',
    senderAvatar: '⚡',
    senderDepartment: 'Программирование',
    senderRole: 'student',
    text: 'Я только что сдала квест по BPE-токенизации! Оказывается, русские слова иногда делятся на 2-3 токена из-за байтовых префиксов UTF-8. Робот Байт оценил формулу промпта на 98 баллов!',
    createdAt: 'Сегодня, 10:45',
    timestamp: Date.now() - 3600000 * 2,
    reactions: { '💡': ['sut-student-02', 'sut-student-07'] },
  },
  {
    id: 'msg-04',
    channelId: 'robotics',
    senderId: 'sut-student-01',
    senderName: 'Артём Соколов',
    senderCallsign: 'TechnoExplorer_26',
    senderAvatar: '🚀',
    senderDepartment: 'Робототехника',
    senderRole: 'student',
    text: 'Собираю схему автономного катамарана с двойным Н-мостом L298N. Какой ШИМ лучше ставить на микроконтроллер для плавного старта винтов в волнах?',
    createdAt: 'Сегодня, 11:20',
    timestamp: Date.now() - 3600000,
    reactions: { '🔧': ['sut-student-02'] },
  },
  {
    id: 'msg-05',
    channelId: 'robotics',
    senderId: 'byte-ai',
    senderName: 'Робот Байт',
    senderCallsign: 'Byte_Mentor',
    senderAvatar: '🤖',
    senderRole: 'assistant',
    text: '💡 Артём, для винтовых двигателей катамарана СЮТ рекомендую плавный старт с ШИМ от 80 до 220 с инкрементом каждые 20 мс. Это защитит батарею от просадки напряжения при резком пуске в воде!',
    createdAt: 'Сегодня, 11:22',
    timestamp: Date.now() - 3500000,
    reactions: { '⚡': ['sut-student-01'] },
  },
  {
    id: 'msg-06',
    channelId: 'it',
    senderId: 'sut-student-07',
    senderName: 'Максим Романов',
    senderCallsign: 'CyberHawk_AI',
    senderAvatar: '🧠',
    senderDepartment: 'IT & ИИ',
    senderRole: 'student',
    text: 'В песочнице кода добавил перцептрон для распознавания морских препятствий. Веса сходятся уже за 8 эпох обучения! Кому нужен датасет — пишите в ЛС.',
    createdAt: 'Сегодня, 11:50',
    timestamp: Date.now() - 1800000,
    reactions: { '🔥': ['sut-student-08', 'sut-student-09'] },
  },
];

const STORAGE_KEY_LOCAL_MESSAGES = 'sut_sochi_chat_messages_v2';

export function getLocalChatMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_MESSAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load chat from localStorage:', err);
  }
  saveLocalChatMessages(INITIAL_CHAT_MESSAGES);
  return INITIAL_CHAT_MESSAGES;
}

export function saveLocalChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL_MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save chat to localStorage:', err);
  }
}

// Fetch messages from backend API with fallback
export async function fetchServerChatMessages(): Promise<ChatMessage[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/chat/messages', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalChatMessages(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Server chat API fetch error, using local cached messages:', err);
  }
  return getLocalChatMessages();
}

// Send message via HTTP API with fallback
export async function sendServerChatMessage(
  message: Omit<ChatMessage, 'id' | 'createdAt' | 'timestamp'>
): Promise<ChatMessage> {
  const localMsg: ChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    reactions: {},
  };

  try {
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localMsg),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (err) {
    console.warn('Failed to send message to server API, saved locally:', err);
  }

  // Local persistence fallback
  const current = getLocalChatMessages();
  const next = [...current, localMsg];
  saveLocalChatMessages(next);
  return localMsg;
}

// Add reaction via HTTP API with fallback
export async function toggleServerChatReaction(
  messageId: string,
  emoji: string,
  studentId: string
): Promise<ChatMessage | null> {
  try {
    const res = await fetch(`/api/chat/messages/${messageId}/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, studentId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Reaction API error, applying locally:', err);
  }

  // Local fallback
  const current = getLocalChatMessages();
  let updatedMsg: ChatMessage | null = null;
  const next = current.map((m) => {
    if (m.id === messageId) {
      const reactions = { ...(m.reactions || {}) };
      const users = reactions[emoji] || [];
      if (users.includes(studentId)) {
        reactions[emoji] = users.filter((u) => u !== studentId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        reactions[emoji] = [...users, studentId];
      }
      updatedMsg = { ...m, reactions };
      return updatedMsg;
    }
    return m;
  });

  saveLocalChatMessages(next);
  return updatedMsg;
}
