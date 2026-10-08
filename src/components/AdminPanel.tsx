import React, { useState } from 'react';
import { StudentProfile, SUTDepartment, Quest } from '../types';
import { calculateLevel } from '../data/achievementsData';
import {
  Users,
  Award,
  Sparkles,
  BarChart3,
  PlusCircle,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Download,
  Shield,
  FileCheck,
  RefreshCw,
  Plus,
  Send,
  X,
  MapPin,
  LogIn,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Star,
  Check,
  Filter
} from 'lucide-react';
import {
  getAllFeedback,
  updateFeedbackTicketStatus,
  deleteFeedbackTicket,
  clearResolvedFeedback,
  FeedbackTicket,
  FeedbackStatus,
  FeedbackCategory
} from '../data/feedbackStorage';

interface AdminPanelProps {
  students: StudentProfile[];
  quests: Quest[];
  onUpdateStudent: (studentId: string, fields: Partial<StudentProfile>) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddStudent: (data: {
    name: string;
    callsign: string;
    avatar: string;
    department: SUTDepartment;
    grade: string;
    notes?: string;
  }) => void;
  onCreateQuest: (questData: Omit<Quest, 'id'>) => void;
  onDeleteQuest: (questId: string) => void;
  onResetCohort: () => void;
  onInspectStudent?: (student: StudentProfile) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  students,
  quests,
  onUpdateStudent,
  onDeleteStudent,
  onAddStudent,
  onCreateQuest,
  onDeleteQuest,
  onResetCohort,
  onInspectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'analytics' | 'quests' | 'system' | 'feedback'>('students');

  // Feedback & Bug Reports state
  const [feedbackList, setFeedbackList] = useState<FeedbackTicket[]>(() => getAllFeedback());
  const [feedbackCatFilter, setFeedbackCatFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const reloadFeedback = () => {
    setFeedbackList(getAllFeedback());
  };

  const handleUpdateFeedbackStatus = (id: string, status: FeedbackStatus) => {
    const reply = replyDrafts[id];
    updateFeedbackTicketStatus(id, status, reply);
    reloadFeedback();
  };

  const handleDeleteFeedback = (id: string) => {
    if (confirm('Удалить репорт тестировщика?')) {
      deleteFeedbackTicket(id);
      reloadFeedback();
    }
  };

  const handleClearResolved = () => {
    if (confirm('Очистить все закрытые репорты?')) {
      clearResolvedFeedback();
      reloadFeedback();
    }
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('Все');

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  // Manual Add Student Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCallsign, setNewStudentCallsign] = useState('');
  const [newStudentDept, setNewStudentDept] = useState<SUTDepartment>('Робототехника');
  const [newStudentGrade, setNewStudentGrade] = useState('7 класс');

  // Custom Quest Creator state
  const [questTitle, setQuestTitle] = useState('');
  const [questSubtitle, setQuestSubtitle] = useState('');
  const [questLocation, setQuestLocation] = useState('Морской порт Сочи');
  const [questDifficulty, setQuestDifficulty] = useState<'Новичок' | 'Инженер' | 'Магистр'>('Инженер');
  const [questXp, setQuestXp] = useState(180);
  const [questBriefing, setQuestBriefing] = useState('');
  const [questObjective, setQuestObjective] = useState('');
  const [questStarter, setQuestStarter] = useState('');
  const [questRubric, setQuestRubric] = useState('Роль задана четко\nУказан строгий формат\nПроверены граничные условия');
  const [questCreatedAlert, setQuestCreatedAlert] = useState(false);

  // Verification state
  const [verifyIdInput, setVerifyIdInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<StudentProfile | null | 'not_found'>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesDept = deptFilter === 'Все' || s.department === deptFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.callsign.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // KPI calculations
  const totalXp = students.reduce((acc, s) => acc + s.xp, 0);
  const totalCompletedLessons = students.reduce((acc, s) => acc + s.completedLessonIds.length, 0);
  const totalCompletedQuests = students.reduce((acc, s) => acc + s.completedQuestIds.length, 0);
  const avgXp = Math.round(totalXp / Math.max(1, students.length));

  // Quick XP adjustments
  const handleAdjustXp = (student: StudentProfile, delta: number) => {
    const newXp = Math.max(0, student.xp + delta);
    const tier = calculateLevel(newXp);
    onUpdateStudent(student.id, {
      xp: newXp,
      level: tier.level,
      levelTitle: tier.title,
    });
  };

  // Add new student from modal
  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentCallsign.trim()) return;

    onAddStudent({
      name: newStudentName.trim(),
      callsign: newStudentCallsign.trim().replace(/^@/, ''),
      avatar: '🚀',
      department: newStudentDept,
      grade: newStudentGrade,
      notes: 'Добавлен преподавателем СЮТ.',
    });

    setIsAddModalOpen(false);
    setNewStudentName('');
    setNewStudentCallsign('');
  };

  // Create Quest Submit
  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle.trim() || !questBriefing.trim()) return;

    onCreateQuest({
      title: questTitle.trim(),
      subtitle: questSubtitle.trim() || 'Инженерный вызов СЮТ Сочи',
      location: questLocation.trim(),
      difficulty: questDifficulty,
      xpReward: Number(questXp) || 150,
      description: questBriefing.trim(),
      briefing: questBriefing.trim(),
      targetObjective: questObjective.trim() || 'Составить рабочий промпт для решения задачи.',
      sampleStarter: questStarter.trim() || 'Ты — бортовой инженер СЮТ...',
      rubric: questRubric.split('\n').filter((line) => line.trim().length > 0),
    });

    setQuestCreatedAlert(true);
    setTimeout(() => setQuestCreatedAlert(false), 3000);
    setQuestTitle('');
    setQuestSubtitle('');
    setQuestBriefing('');
    setQuestObjective('');
    setQuestStarter('');
  };

  // Export roster
  const handleExportRoster = () => {
    const headers = ['ID', 'ФИО', 'Позывной', 'Направление', 'Класс', 'Опыт XP', 'Уровень', 'Уроков', 'Квестов'];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.callsign}"`,
      `"${s.department}"`,
      `"${s.grade}"`,
      s.xp,
      s.level,
      s.completedLessonIds.length,
      s.completedQuestIds.length,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SUT_Sochi_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Certificate verification check
  const handleVerifyCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const query = verifyIdInput.trim().toUpperCase();
    if (!query) return;

    // Check if any student matches the certificate formula
    const found = students.find((s) => {
      const certNum = `СЮТ-ИИ-${Math.abs(s.xp * 73 + 1042).toString().slice(0, 6)}`;
      return certNum === query || s.id === query || s.callsign.toUpperCase() === query;
    });

    setVerificationResult(found || 'not_found');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Единственный администратор платформы СЮТ г. Сочи</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              Токен: artdyshfj7289djsbc782q
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Административная панель управления курсом ИИ
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportRoster}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Экспорт ведомости (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Всего учеников в базе:</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {students.length}
          </div>
          <div className="text-[11px] text-cyan-400 mt-0.5">В 5 направлениях</div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Суммарный опыт (XP):</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {totalXp.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">В среднем: {avgXp} XP / чел.</div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Сдано уроков:</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {totalCompletedLessons}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Интерактивных аттестаций</div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
          <div className="text-xs text-slate-400 font-medium">Выполнено спецквестов:</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {totalCompletedQuests}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Городских миссий Сочи</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700/70 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Ученики ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Аналитика успеваемости</span>
        </button>

        <button
          onClick={() => setActiveTab('quests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'quests' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Конструктор спецквестов ({quests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'system' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Верификация дипломов и система</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('feedback');
            reloadFeedback();
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'feedback' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Обратная связь тестировщиков ({feedbackList.length})</span>
          {feedbackList.some((t) => t.status === 'new') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* TAB 1: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search & Dept */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по имени или позывному..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Все">Все направления</option>
                <option value="Робототехника">Робототехника</option>
                <option value="Программирование">Программирование</option>
                <option value="IT & ИИ">IT & ИИ</option>
                <option value="Аэроклуб">Аэроклуб</option>
                <option value="Судомоделирование">Судомоделирование</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить ученика</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ученик</th>
                    <th className="py-3 px-4">Направление</th>
                    <th className="py-3 px-4">Опыт (XP)</th>
                    <th className="py-3 px-4">Квалификация</th>
                    <th className="py-3 px-4">Уроки / Квесты</th>
                    <th className="py-3 px-4 text-center">Начислить XP наставником</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1 rounded bg-slate-900">{st.avatar}</span>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{st.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({st.grade})</span>
                            </div>
                            <div className="text-[11px] text-cyan-400 font-mono">@{st.callsign}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 text-[11px]">
                          {st.department}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-400 tabular-nums">
                        {st.xp} XP
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-300">
                          Ур. {st.level} · {st.levelTitle}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {st.completedLessonIds.length} ур. / {st.completedQuestIds.length} кв.
                      </td>

                      {/* Fast XP Adjustment buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-mono text-[10px]">
                          <button
                            onClick={() => handleAdjustXp(st, 50)}
                            title="Начислить +50 XP за активность на занятии"
                            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                          >
                            +50
                          </button>
                          <button
                            onClick={() => handleAdjustXp(st, 100)}
                            title="Начислить +100 XP за проект"
                            className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold transition-colors cursor-pointer"
                          >
                            +100
                          </button>
                          <button
                            onClick={() => handleAdjustXp(st, 250)}
                            title="Начислить +250 XP за хакатон"
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition-colors cursor-pointer"
                          >
                            +250
                          </button>
                          <button
                            onClick={() => handleAdjustXp(st, -50)}
                            title="Снять 50 XP (корректировка)"
                            className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
                          >
                            -50
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onInspectStudent && (
                            <button
                              onClick={() => onInspectStudent(st)}
                              title={`Войти в изолированный кабинет ученика ${st.name} (@${st.callsign})`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-[11px] font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                            >
                              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                              <span>В кабинет</span>
                            </button>
                          )}
                          <button
                            onClick={() => setEditingStudent(st)}
                            title="Редактировать данные"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Удалить профиль ученика ${st.name}?`)) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            title="Удалить профиль"
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Распределение учеников по направлениям СЮТ
              </h3>

              <div className="space-y-3">
                {['Робототехника', 'Программирование', 'IT & ИИ', 'Аэроклуб', 'Судомоделирование'].map((dept) => {
                  const count = students.filter((s) => s.department === dept).length;
                  const pct = Math.round((count / Math.max(1, students.length)) * 100);

                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{dept}</span>
                        <span className="font-mono text-cyan-400 tabular-nums">
                          {count} чел. ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level Tier Breakdown */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Квалификационные уровни когорты
              </h3>

              <div className="space-y-3">
                {[
                  { level: 5, title: 'Магистр ИИ СЮТ' },
                  { level: 4, title: 'Архитектор нейросетей' },
                  { level: 3, title: 'Младший промпт-инженер' },
                  { level: 2, title: 'Оператор алгоритмов' },
                  { level: 1, title: 'Юный испытатель' },
                ].map((tier) => {
                  const count = students.filter((s) => s.level === tier.level).length;
                  const pct = Math.round((count / Math.max(1, students.length)) * 100);

                  return (
                    <div key={tier.level} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Ур. {tier.level}: {tier.title}</span>
                        <span className="font-mono text-amber-400 tabular-nums">{count} чел. ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUEST & CHALLENGE CREATOR */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          {questCreatedAlert && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Новый спецквест успешно создан и добавлен в каталог учеников СЮТ!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form (7 cols) */}
            <form onSubmit={handleCreateQuest} className="lg:col-span-7 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700/60 pb-2">
                Создать новое задание / Спецмиссию для учеников
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Название миссии: *
                  </label>
                  <input
                    type="text"
                    required
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    placeholder="Например: Автопилот дрона над Ривьерой"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Локация в Сочи:
                  </label>
                  <input
                    type="text"
                    value={questLocation}
                    onChange={(e) => setQuestLocation(e.target.value)}
                    placeholder="Например: Олимпийский парк"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Сложность:
                  </label>
                  <select
                    value={questDifficulty}
                    onChange={(e) => setQuestDifficulty(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Новичок">Новичок</option>
                    <option value="Инженер">Инженер</option>
                    <option value="Магистр">Магистр</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Награда за выполнение (XP):
                  </label>
                  <input
                    type="number"
                    value={questXp}
                    onChange={(e) => setQuestXp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Текст вводной / брифинга (контекст задачи): *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questBriefing}
                  onChange={(e) => setQuestBriefing(e.target.value)}
                  placeholder="Опиши техническую ситуацию, сбой или исследовательскую задачу..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Критерии оценивания (Рубрика, по 1 на строке):
                </label>
                <textarea
                  rows={2}
                  value={questRubric}
                  onChange={(e) => setQuestRubric(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Опубликовать спецквест для всех учеников</span>
              </button>
            </form>

            {/* Quests List (5 cols) */}
            <div className="lg:col-span-5 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700/60 pb-2">
                Текущие квесты в каталоге ({quests.length})
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {quests.map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-cyan-400 font-mono text-[10px] mb-1">
                        <span>{q.location}</span>
                        <span className="text-amber-400 font-bold">+{q.xpReward} XP</span>
                      </div>
                      <div className="font-bold text-white mb-1">{q.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-2">{q.description}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Сложность: {q.difficulty}</span>
                      {q.id.startsWith('quest-custom-') && (
                        <button
                          onClick={() => onDeleteQuest(q.id)}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION & SYSTEM */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Single Administrator Security Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Единственный администратор платформы
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    МОУДОД Станция Юных Техников г. Сочи · Полные права супервайзера
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-medium self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Активная сессия (1 администратор)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Мастер-токен входа:</div>
                <div className="font-mono text-amber-400 font-bold text-xs select-all bg-slate-900 px-2 py-1 rounded border border-slate-700">
                  artdyshfj7289djsbc782q
                </div>
                <div className="text-[10px] text-slate-500">Вход защищен, другие пароли отключены</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Полномочия в системе:</div>
                <div className="text-white font-medium">Полный контроль журналов</div>
                <div className="text-[10px] text-slate-400">Ручное начисление токенов, редактирование профилей, публикация квестов</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Политика токенов учеников:</div>
                <div className="text-cyan-300 font-medium">Централизованная выдача</div>
                <div className="text-[10px] text-slate-400">Самопополнение учениками отключено, токены выдаются только наставником</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certificate Verification Tool */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Проверка подлинности дипломов СЮТ</span>
            </h3>
            <p className="text-xs text-slate-300">
              Введи номер сертификата (например, <code className="text-cyan-400">СЮТ-ИИ-XXXXXX</code>) или позывной ученика для моментальной верификации в реестре:
            </p>

            <form onSubmit={handleVerifyCertificate} className="flex gap-2">
              <input
                type="text"
                value={verifyIdInput}
                onChange={(e) => setVerifyIdInput(e.target.value)}
                placeholder="СЮТ-ИИ-123456 или позывной"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Проверить
              </button>
            </form>

            {verificationResult && verificationResult !== 'not_found' && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 animate-fadeIn space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ДИПЛОМ ПОДТВЕРЖДЕН В РЕЕСТРЕ СЮТ</span>
                </div>
                <div>Ученик: <strong className="text-white">{verificationResult.name}</strong> (@{verificationResult.callsign})</div>
                <div>Направление: {verificationResult.department} ({verificationResult.grade})</div>
                <div>Квалификация: {verificationResult.levelTitle} ({verificationResult.xp} XP)</div>
                <div className="text-[10px] text-slate-400 mt-1">Регистрация в СЮТ: {verificationResult.registeredAt}</div>
              </div>
            )}

            {verificationResult === 'not_found' && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 animate-fadeIn">
                Сертификат с таким номером или позывным не найден в базе данных СЮТ Сочи.
              </div>
            )}
          </div>

          {/* Database Reset */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Сброс и инициализация учебного года</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Кнопка сброса возвращает список учеников и квестов к базовому демонстрационному составу кружка СЮТ Сочи. Используется перед началом нового учебного полугодия.
            </p>

            <button
              onClick={() => {
                if (confirm('Сбросить базу данных учеников и квестов к заводскому состоянию СЮТ Сочи?')) {
                  onResetCohort();
                }
              }}
              className="px-4 py-2.5 bg-rose-900/40 hover:bg-rose-900/80 text-rose-200 border border-rose-700/60 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Сбросить данные к стандарту СЮТ</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* TAB 5: TESTER FEEDBACK & BUG REPORTS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase text-slate-400">Всего репортов</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{feedbackList.length}</div>
              <div className="text-[10px] text-cyan-400 mt-0.5">От 15 тестировщиков СЮТ</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase text-rose-400 flex items-center gap-1">
                <Bug className="w-3 h-3" />
                <span>Баг-репортов</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                {feedbackList.filter((f) => f.category === 'bug').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ошибки симуляторов и UI</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase text-amber-400 flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>Средняя оценка</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {feedbackList.length > 0
                  ? (feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbackList.length).toFixed(1)
                  : '5.0'}{' '}
                <span className="text-sm font-normal text-slate-400">/ 5.0</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Индекс удовлетворенности</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] font-mono uppercase text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Решено / Закрыто</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                {feedbackList.filter((f) => f.status === 'resolved').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Обработано наставниками</div>
            </div>
          </div>

          {/* Controls Bar: Filters & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-850 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Filter className="w-3.5 h-3.5" />
                <span>Категория:</span>
              </div>
              <select
                value={feedbackCatFilter}
                onChange={(e) => setFeedbackCatFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Все категории</option>
                <option value="bug">🐞 Баги и ошибки</option>
                <option value="feature">💡 Предложения</option>
                <option value="tester_review">⭐ Отзывы тестировщиков</option>
                <option value="support">❓ Вопросы наставнику</option>
              </select>

              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono ml-2">
                <span>Статус:</span>
              </div>
              <select
                value={feedbackStatusFilter}
                onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новые (в очереди)</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решённые</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={reloadFeedback}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="Обновить список"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Обновить</span>
              </button>

              <button
                onClick={handleClearResolved}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="Очистить решённые репорты"
              >
                <Trash2 className="w-3 h-3" />
                <span>Очистить закрытые</span>
              </button>
            </div>
          </div>

          {/* List of Feedback Tickets */}
          {(() => {
            const filtered = feedbackList.filter((ticket) => {
              const matchesCat = feedbackCatFilter === 'all' || ticket.category === feedbackCatFilter;
              const matchesStat = feedbackStatusFilter === 'all' || ticket.status === feedbackStatusFilter;
              return matchesCat && matchesStat;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">Репорты не найдены</div>
                  <div className="text-xs text-slate-400">
                    По выбранным фильтрам пока нет отзывов или сообщений от тестировщиков.
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filtered.map((ticket) => {
                  const categoryLabels = {
                    bug: { label: 'Баг / Ошибка', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: <Bug className="w-3 h-3" /> },
                    feature: { label: 'Идея / Предложение', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: <Lightbulb className="w-3 h-3" /> },
                    support: { label: 'Вопрос в поддержку', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: <HelpCircle className="w-3 h-3" /> },
                    tester_review: { label: 'Отзыв тестировщика', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: <Star className="w-3 h-3" /> },
                  };

                  const currentCat = categoryLabels[ticket.category] || categoryLabels.tester_review;

                  const statusBadges = {
                    new: { label: 'Новый репорт', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
                    in_progress: { label: 'В работе', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
                    resolved: { label: 'Решено / Закрыто', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
                  };

                  const currentStat = statusBadges[ticket.status] || statusBadges.new;

                  return (
                    <div
                      key={ticket.id}
                      className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-4 shadow-lg hover:border-slate-600 transition-colors"
                    >
                      {/* Top Header of the Ticket */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-700/60">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${currentCat.color}`}>
                            {currentCat.icon}
                            <span>{currentCat.label}</span>
                          </span>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${currentStat.color}`}>
                            {currentStat.label}
                          </span>

                          <span className="text-[10px] font-mono text-slate-400">
                            Срочность: <strong className="text-white uppercase">{ticket.priority}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <div className="text-amber-400 flex items-center gap-0.5">
                            {'★'.repeat(ticket.rating || 5)}
                            <span className="ml-1 text-slate-300">({ticket.rating}/5)</span>
                          </div>
                          <span>·</span>
                          <span>{ticket.createdAt}</span>
                        </div>
                      </div>

                      {/* Main Ticket Body */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {ticket.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Student & Environment Diagnostics */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3 text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Ученик:</span>
                          <span className="text-white font-bold">{ticket.studentName}</span>
                          <span className="text-cyan-400 font-bold">(@{ticket.studentCallsign})</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-300">{ticket.studentDepartment}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px]">
                          <span>Вкладка: <strong className="text-amber-400">{ticket.currentTab}</strong></span>
                          <span>Баланс: <strong className="text-emerald-400">{ticket.tokenBalance} T</strong></span>
                          <span className="truncate max-w-[200px]" title={ticket.browserInfo}>{ticket.browserInfo}</span>
                        </div>
                      </div>

                      {/* Admin Response Card if present */}
                      {ticket.adminResponse && (
                        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1 text-xs">
                          <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Официальный ответ преподавателя СЮТ:</span>
                          </div>
                          <div className="text-slate-200 leading-relaxed">
                            {ticket.adminResponse}
                          </div>
                        </div>
                      )}

                      {/* Reply & Status Action Row */}
                      <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {/* Status Change Buttons */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono">Изменить статус:</span>
                          <button
                            onClick={() => handleUpdateFeedbackStatus(ticket.id, 'new')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              ticket.status === 'new'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                            }`}
                          >
                            Новый
                          </button>

                          <button
                            onClick={() => handleUpdateFeedbackStatus(ticket.id, 'in_progress')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              ticket.status === 'in_progress'
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                            }`}
                          >
                            В работе
                          </button>

                          <button
                            onClick={() => handleUpdateFeedbackStatus(ticket.id, 'resolved')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                              ticket.status === 'resolved'
                                ? 'bg-emerald-500 text-slate-950 font-bold'
                                : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Решено</span>
                          </button>
                        </div>

                        {/* Reply Input or Delete */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Написать ответ ученику..."
                            value={replyDrafts[ticket.id] ?? ''}
                            onChange={(e) => setReplyDrafts({ ...replyDrafts, [ticket.id]: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
                          />
                          <button
                            onClick={() => {
                              if (replyDrafts[ticket.id]?.trim()) {
                                handleUpdateFeedbackStatus(ticket.id, ticket.status);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                            title="Отправить ответ"
                          >
                            Ответить
                          </button>

                          <button
                            onClick={() => handleDeleteFeedback(ticket.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Удалить репорт"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Редактирование ученика СЮТ</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ФИО:</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Позывной:</label>
                <input
                  type="text"
                  value={editingStudent.callsign}
                  onChange={(e) => setEditingStudent({ ...editingStudent, callsign: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Направление:</label>
                <select
                  value={editingStudent.department}
                  onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Робототехника">Робототехника</option>
                  <option value="Программирование">Программирование</option>
                  <option value="IT & ИИ">IT & ИИ</option>
                  <option value="Аэроклуб">Аэроклуб</option>
                  <option value="Судомоделирование">Судомоделирование</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center justify-between">
                  <span>PIN-код доступа (4 цифры):</span>
                  <span className="text-[10px] text-slate-500 font-mono">Текущий PIN ученика</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={editingStudent.pin || '1234'}
                  onChange={(e) => setEditingStudent({ ...editingStudent, pin: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 flex items-center justify-between">
                  <span>Баланс нейро-токенов:</span>
                  <span className="text-[10px] text-amber-400 font-mono">Доступ Байта к вычислениям</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editingStudent.tokenBalance || 5000}
                    onChange={(e) => setEditingStudent({ ...editingStudent, tokenBalance: Number(e.target.value) })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingStudent({ ...editingStudent, tokenBalance: (editingStudent.tokenBalance || 0) + 1000 })}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono cursor-pointer"
                  >
                    +1000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStudent({ ...editingStudent, tokenBalance: (editingStudent.tokenBalance || 0) + 5000 })}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono cursor-pointer"
                  >
                    +5000
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Опыт (XP):</label>
                <input
                  type="number"
                  value={editingStudent.xp}
                  onChange={(e) => setEditingStudent({ ...editingStudent, xp: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Педагогические заметки:</label>
                <textarea
                  rows={2}
                  value={editingStudent.notes || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              {onInspectStudent && (
                <button
                  type="button"
                  onClick={() => {
                    const student = editingStudent;
                    setEditingStudent(null);
                    onInspectStudent(student);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 text-xs font-bold cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Открыть кабинет</span>
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    const tier = calculateLevel(editingStudent.xp);
                    onUpdateStudent(editingStudent.id, {
                      ...editingStudent,
                      level: tier.level,
                      levelTitle: tier.title,
                    });
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Сохранить изменения
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleAddNewStudent} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Добавить ученика в журнал СЮТ</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ФИО ученика: *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Позывной: *</label>
                <input
                  type="text"
                  required
                  value={newStudentCallsign}
                  onChange={(e) => setNewStudentCallsign(e.target.value)}
                  placeholder="Ivan_Sochi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Направление:</label>
                <select
                  value={newStudentDept}
                  onChange={(e) => setNewStudentDept(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Робототехника">Робототехника</option>
                  <option value="Программирование">Программирование</option>
                  <option value="IT & ИИ">IT & ИИ</option>
                  <option value="Аэроклуб">Аэроклуб</option>
                  <option value="Судомоделирование">Судомоделирование</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Класс:</label>
                <input
                  type="text"
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(e.target.value)}
                  placeholder="7 класс"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
              >
                Зарегистрировать (+100 XP)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
