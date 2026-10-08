export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
  hint?: string;
}

export interface PracticalTask {
  id: string;
  title: string;
  description: string;
  targetGoal: string;
  starterPrompt: string;
  expectedKeywords: string[];
  xpReward: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  xpReward: number;
  theoryContent: {
    heading: string;
    paragraphs: string[];
    keyTakeaway: string;
    codeSnippet?: string;
    interactiveWidgetType?: 'tokens' | 'neural_weights' | 'prompt_breakdown' | 'bias_checker';
  };
  quiz: QuizQuestion[];
  practicalTask?: PracticalTask;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badgeLevel: string;
  lessons: Lesson[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'prompting' | 'coding' | 'quests';
  unlockedAt?: string;
  isUnlocked: boolean;
  requiredXp?: number;
}

export type SUTDepartment =
  | 'Робототехника'
  | 'Программирование'
  | 'IT & ИИ'
  | 'Аэроклуб'
  | 'Судомоделирование';

export interface StudentProfile {
  id: string;
  name: string;
  callsign: string;
  login?: string;
  pin?: string;
  avatar: string;
  department: SUTDepartment;
  grade: string;
  registeredAt: string;
  xp: number;
  level: number;
  levelTitle: string;
  completedLessonIds: string[];
  completedQuestIds: string[];
  unlockedAchievementIds: string[];
  favoriteTool: string;
  questionsAskedCount: number;
  tokenBalance: number;
  totalTokensUsed: number;
  notes?: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export type AuthMode = 'gateway' | 'login' | 'student' | 'admin';

export type AppTab = 'lessons' | 'lab' | 'playground' | 'quests' | 'leaderboard';


export interface CustomQuestForm {
  title: string;
  subtitle: string;
  location: string;
  description: string;
  difficulty: 'Новичок' | 'Инженер' | 'Магистр';
  xpReward: number;
  briefing: string;
  targetObjective: string;
  sampleStarter: string;
  rubric: string[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  callsign: string;
  avatar: string;
  department: string;
  xp: number;
  level: number;
  levelTitle: string;
  badgesCount: number;
  isCurrentUser?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  difficulty: 'Новичок' | 'Инженер' | 'Магистр';
  xpReward: number;
  briefing: string;
  targetObjective: string;
  sampleStarter: string;
  rubric: string[];
}
