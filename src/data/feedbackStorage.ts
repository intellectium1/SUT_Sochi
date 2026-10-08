export type FeedbackCategory = 'bug' | 'feature' | 'support' | 'tester_review';
export type FeedbackPriority = 'low' | 'normal' | 'high' | 'critical';
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved';

export interface FeedbackTicket {
  id: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  rating: number; // 1 to 5
  title: string;
  description: string;
  createdAt: string;
  studentId: string;
  studentName: string;
  studentCallsign: string;
  studentDepartment: string;
  status: FeedbackStatus;
  adminResponse?: string;
  browserInfo: string;
  currentTab: string;
  tokenBalance: number;
}

const STORAGE_KEY_FEEDBACK = 'sut_sochi_tester_feedback_v2';

const INITIAL_TESTER_FEEDBACK: FeedbackTicket[] = [
  {
    id: 'ticket-101',
    category: 'tester_review',
    priority: 'normal',
    rating: 5,
    title: 'Отличная визуализация BPE-токенизации и симулятор перцептрона!',
    description: 'Тестировал с ребятами из секции робототехники. Очень наглядно видно разбиение русских слов на морфемы и байты в BPE-счетчике. Робот Байт отлично объясняет концепцию логитов!',
    createdAt: '2026-10-06 14:20',
    studentId: 'sut-student-02',
    studentName: 'Алексей Мельников',
    studentCallsign: 'RoboChief_Sochi',
    studentDepartment: 'Робототехника',
    status: 'resolved',
    adminResponse: 'Спасибо за подробный отзыв! Добавили новые весовые коэффициенты в симулятор.',
    browserInfo: 'Chrome 130 / macOS / 1920x1080',
    currentTab: 'lab',
    tokenBalance: 8600,
  },
  {
    id: 'ticket-102',
    category: 'bug',
    priority: 'high',
    rating: 4,
    title: 'Датчик сонара ESP32 на симуляторе иногда реагирует с задержкой 100мс',
    description: 'В песочнице кода при максимальной частоте тиков симуляции кругового радара сектор отрисовки мигает при изменении масштаба зума.',
    createdAt: '2026-10-07 10:15',
    studentId: 'sut-student-01',
    studentName: 'Артём Соколов',
    studentCallsign: 'TechnoExplorer_26',
    studentDepartment: 'Робототехника',
    status: 'in_progress',
    adminResponse: 'Взяли в работу. Проверяем буферизацию Canvas double-buffering.',
    browserInfo: 'Firefox 131 / Windows 11 / 1440x900',
    currentTab: 'playground',
    tokenBalance: 4250,
  },
  {
    id: 'ticket-103',
    category: 'feature',
    priority: 'normal',
    rating: 5,
    title: 'Предложение: добавить ночной режим «Матрица» и кастомизацию робота Байта',
    description: 'Было бы круто разблокировать кастомные скины для Байта (например, в костюме водолаза или хакера) после выполнения сложных квестов!',
    createdAt: '2026-10-07 11:45',
    studentId: 'sut-student-05',
    studentName: 'Дмитрий Белов',
    studentCallsign: 'ByteRacer_99',
    studentDepartment: 'Программирование',
    status: 'resolved',
    adminResponse: 'Отличная идея! Студия кастомизации и стилей интерфейса успешно внедрена в платформу.',
    browserInfo: 'Safari 18 / iPadOS / 2048x1536',
    currentTab: 'lessons',
    tokenBalance: 4900,
  },
  {
    id: 'ticket-104',
    category: 'support',
    priority: 'low',
    rating: 5,
    title: 'Вопрос по аттестации: когда будет доступна выгрузка диплома в PDF?',
    description: 'Набрал больше 1000 XP в направлении IT, хочу распечатать сертификат для портфолио в школе №8.',
    createdAt: '2026-10-07 12:30',
    studentId: 'sut-student-07',
    studentName: 'Максим Романов',
    studentCallsign: 'CyberHawk_AI',
    studentDepartment: 'IT & ИИ',
    status: 'new',
    browserInfo: 'Edge 129 / Linux / 1920x1080',
    currentTab: 'leaderboard',
    tokenBalance: 6100,
  },
];

export function getAllFeedback(): FeedbackTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load feedback from localStorage:', err);
  }
  saveAllFeedback(INITIAL_TESTER_FEEDBACK);
  return INITIAL_TESTER_FEEDBACK;
}

export function saveAllFeedback(tickets: FeedbackTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to save feedback to localStorage:', err);
  }
}

export function addFeedbackTicket(ticket: Omit<FeedbackTicket, 'id' | 'createdAt' | 'status'>): FeedbackTicket {
  const current = getAllFeedback();
  const newTicket: FeedbackTicket = {
    ...ticket,
    id: `ticket-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'new',
  };

  const updated = [newTicket, ...current];
  saveAllFeedback(updated);
  return newTicket;
}

export function updateFeedbackTicketStatus(
  id: string,
  status: FeedbackStatus,
  adminResponse?: string
): FeedbackTicket | null {
  const current = getAllFeedback();
  let updatedTicket: FeedbackTicket | null = null;

  const next = current.map((t) => {
    if (t.id === id) {
      updatedTicket = {
        ...t,
        status,
        ...(adminResponse !== undefined ? { adminResponse } : {}),
      };
      return updatedTicket;
    }
    return t;
  });

  if (updatedTicket) {
    saveAllFeedback(next);
  }
  return updatedTicket;
}

export function deleteFeedbackTicket(id: string): boolean {
  const current = getAllFeedback();
  const next = current.filter((t) => t.id !== id);
  saveAllFeedback(next);
  return true;
}

export function clearResolvedFeedback(): void {
  const current = getAllFeedback();
  const next = current.filter((t) => t.status !== 'resolved');
  saveAllFeedback(next);
}
