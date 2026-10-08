/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SidebarNavigation, AppTab } from './components/SidebarNavigation';
import { TopHeaderBar } from './components/TopHeaderBar';
import { LessonsSection } from './components/LessonsSection';
import { PromptLab } from './components/PromptLab';
import { CodePlayground } from './components/CodePlayground';
import { QuestsSection } from './components/QuestsSection';
import { LeaderboardSection } from './components/LeaderboardSection';
import { AdminPanel } from './components/AdminPanel';
import { AuthGateway } from './components/AuthGateway';
import { LivingByte } from './components/LivingByte';
import { AchievementsModal } from './components/AchievementsModal';
import { CertificateModal } from './components/CertificateModal';
import { CustomizationStudioModal } from './components/CustomizationStudioModal';
import { FeedbackModal } from './components/FeedbackModal';
import { EngineeringChatSection } from './components/EngineeringChatSection';
import { FloatingChatDrawer } from './components/FloatingChatDrawer';
import { LandingPage } from './components/LandingPage';

import { StudentProfile, Achievement, SUTDepartment, Quest, AuthMode } from './types';
import { INITIAL_ACHIEVEMENTS, calculateLevel } from './data/achievementsData';
import {
  THEME_PRESETS,
  getStudentCustomization,
  saveStudentCustomization,
  StudentCustomizationConfig,
  DEFAULT_CUSTOMIZATION,
} from './data/themeCustomizationData';
import {
  getAllStudents,
  getActiveStudent,
  getActiveStudentId,
  setActiveStudentId,
  saveAllStudents,
  registerNewStudent,
  updateStudentById,
  deleteStudentById,
  resetToDefaultCohort,
  consumeTokens,
  addTokens,
  getAuthSession,
  setAuthSession,
  apiFetchStudents,
  apiRegisterStudent,
  apiUpdateStudent,
  apiDeleteStudent,
  apiResetCohort,
} from './data/studentStorage';
import { getAllQuests, addCustomQuest, deleteQuestById, saveAllQuests } from './data/customQuestsStorage';
import { QUESTS as DEFAULT_QUESTS } from './data/questsData';
import { Sparkles, ExternalLink, Shield, LogOut, ArrowLeft, Home, Palette, MessageSquare } from 'lucide-react';
import { playByteSound } from './utils/byteAudio';

const STORAGE_KEY_ACHIEVEMENTS = 'sut_sochi_ai_achievements_v3';

export default function App() {
  // Page routing state: '/' (landing page) | '/app' (educational system)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/app' || path.startsWith('/app/')) return '/app';
      if (path === '/register') return '/app';
    }
    return '/';
  });

  // Active gateway tab when accessing /app: 'login' | 'admin'
  const [gatewayTab, setGatewayTab] = useState<'login' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'admin') return 'admin';
    }
    return 'login';
  });

  // Session Mode: 'gateway' (login screen) | 'student' | 'admin'
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const session = getAuthSession();
    return session.mode;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('lessons');
  const [isAdminInspecting, setIsAdminInspecting] = useState(false);

  // Popstate listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/app' || path.startsWith('/app/') || path === '/register') {
        setCurrentPath('/app');
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'admin') {
          setGatewayTab('admin');
        } else {
          setGatewayTab('login');
        }
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, query?: string) => {
    const cleanPath = path === '/register' ? '/app' : path;
    setCurrentPath(cleanPath);
    const fullUrl = query ? `${cleanPath}${query}` : cleanPath;
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', fullUrl);
    }
    if (query) {
      const params = new URLSearchParams(query);
      const tab = params.get('tab');
      if (tab === 'admin') {
        setGatewayTab('admin');
      } else {
        setGatewayTab('login');
      }
    }
  };

  // Multi-student roster state: Initialize immediately with local data for zero-latency start
  const [students, setStudents] = useState<StudentProfile[]>(() => getAllStudents());
  const [activeId, setActiveId] = useState<string>(() => getActiveStudentId());

  // Derive current student profile
  const profile = students.find((s) => s.id === activeId) || students[0] || getActiveStudent();

  // Quests state (built-in + admin created)
  const [quests, setQuests] = useState<Quest[]>(() => getAllQuests());

  // Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    return INITIAL_ACHIEVEMENTS;
  });

  // Modals State
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Theme and UI Customization State
  const [customization, setCustomization] = useState<StudentCustomizationConfig>(() =>
    getStudentCustomization(activeId)
  );

  // Sync customization when active student changes
  useEffect(() => {
    if (activeId) {
      setCustomization(getStudentCustomization(activeId));
    }
  }, [activeId]);

  const activeTheme = THEME_PRESETS.find((t) => t.id === customization.themeId) || THEME_PRESETS[0];

  const handleApplyCustomization = (newConfig: StudentCustomizationConfig) => {
    setCustomization(newConfig);
    if (profile?.id) {
      saveStudentCustomization(profile.id, newConfig);
    }
    const themeObj = THEME_PRESETS.find((t) => t.id === newConfig.themeId);
    showToast('ДИЗАЙН ОБНОВЛЕН', themeObj?.name || 'Новый стиль активирован');
  };

  // Toast / XP notification
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Background sync with API database - non-blocking
  useEffect(() => {
    let isMounted = true;
    apiFetchStudents().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setStudents(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save auth mode changes
  useEffect(() => {
    setAuthSession(authMode, activeId);
  }, [authMode, activeId]);

  // Save achievements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [achievements]);

  // Show Toast helper
  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add XP and recalculate level for active student with fresh state lookup
  const handleEarnXp = async (amount: number, reason?: string) => {
    if (amount <= 0 || !profile) return;

    const currentAll = getAllStudents();
    const fresh = currentAll.find(s => s.id === profile.id) || profile;
    const newXp = fresh.xp + amount;
    const tier = calculateLevel(newXp);
    const leveledUp = tier.level > fresh.level;

    if (leveledUp) {
      playByteSound('levelUp');
      showToast(
        `🎉 ПОВЫШЕНИЕ КВАЛИФИКАЦИИ: УРОВЕНЬ ${tier.level}!`,
        `Новое звание: ${tier.title}`
      );
    } else {
      showToast(`+${amount} Techno-XP!`, reason || 'Опыт зачислен в табель почета');
    }

    if (newXp >= 1000) {
      setTimeout(() => unlockAchievement('grandmaster'), 100);
    }

    const updated = await apiUpdateStudent(fresh.id, {
      xp: newXp,
      level: tier.level,
      levelTitle: tier.title,
    });
    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  };

  // Token management for active student: Strict deduction with no self-refill exploit
  const handleConsumeTokens = async (amount: number) => {
    if (!profile || amount <= 0) return;

    const currentAll = getAllStudents();
    const fresh = currentAll.find(s => s.id === profile.id) || profile;
    const newBalance = Math.max(0, fresh.tokenBalance - amount);
    const newTotalUsed = fresh.totalTokensUsed + amount;

    if (newBalance === 0 && fresh.tokenBalance > 0) {
      showToast(
        '⚡ БАЛАНС ТОКЕНОВ ИСЧЕРПАН',
        'Лимит токенов на нуле. Обратитесь к наставнику СЮТ в панели управления.'
      );
    }

    const updated = await apiUpdateStudent(fresh.id, {
      tokenBalance: newBalance,
      totalTokensUsed: newTotalUsed,
    });
    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  };

  // Unlock achievement for active student using atomic fresh student record
  const unlockAchievement = async (id: string) => {
    if (!profile) return;

    const currentAll = getAllStudents();
    const fresh = currentAll.find(s => s.id === profile.id) || profile;
    const currentBadges = fresh.unlockedAchievementIds || [];
    if (currentBadges.includes(id)) return;

    const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
    const newlyUnlockedTitle = ach?.title || id;
    const newBadges = [...currentBadges, id];
    const bonusXp = 50;
    const newXp = fresh.xp + bonusXp;
    const tier = calculateLevel(newXp);

    const updated = await apiUpdateStudent(fresh.id, {
      unlockedAchievementIds: newBadges,
      xp: newXp,
      level: tier.level,
      levelTitle: tier.title,
    });

    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      playByteSound('levelUp');
      showToast('🏆 ПОЛУЧЕН НОВЫЙ ЗНАЧОК (+50 XP)!', `«${newlyUnlockedTitle}»`);

      setAchievements((prev) =>
        prev.map((a) => {
          if (a.id === id && !a.isUnlocked) {
            return {
              ...a,
              isUnlocked: true,
              unlockedAt: new Date().toISOString().split('T')[0],
            };
          }
          return a;
        })
      );
    }
  };

  // Lesson complete handler: No duplicate XP for already completed lessons
  const handleLessonComplete = async (earnedXp: number, lessonId: string) => {
    if (!profile) return;

    const currentAll = getAllStudents();
    const fresh = currentAll.find(s => s.id === profile.id) || profile;
    const alreadyDone = fresh.completedLessonIds.includes(lessonId);

    if (alreadyDone) {
      showToast('Урок уже завершен', 'Материалы можно повторять, но опыт за этот урок уже был получен');
      return;
    }

    const updatedLessons = [...fresh.completedLessonIds, lessonId];
    const finalEarned = Math.max(0, earnedXp);
    const newXp = fresh.xp + finalEarned;
    const tier = calculateLevel(newXp);

    const updated = await apiUpdateStudent(fresh.id, {
      completedLessonIds: updatedLessons,
      xp: newXp,
      level: tier.level,
      levelTitle: tier.title,
    });

    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      playByteSound('success');
      showToast(`+${finalEarned} Techno-XP!`, 'Урок успешно завершен!');

      unlockAchievement('first_step');
      if (updatedLessons.length >= 3) {
        unlockAchievement('prompt_novice');
      }
    }
  };

  // Quest complete handler: No duplicate XP for already completed quests
  const handleQuestComplete = async (earnedXp: number, questId: string) => {
    if (!profile) return;

    const currentAll = getAllStudents();
    const fresh = currentAll.find(s => s.id === profile.id) || profile;
    const alreadyDone = fresh.completedQuestIds.includes(questId);

    if (alreadyDone) {
      showToast('Спецмиссия уже выполнена', 'Опыт за эту миссию уже зачислен в ваш табель ранее');
      return;
    }

    const updatedQuests = [...fresh.completedQuestIds, questId];
    const finalEarned = Math.max(0, earnedXp);
    const newXp = fresh.xp + finalEarned;
    const tier = calculateLevel(newXp);

    const updated = await apiUpdateStudent(fresh.id, {
      completedQuestIds: updatedQuests,
      xp: newXp,
      level: tier.level,
      levelTitle: tier.title,
    });

    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      playByteSound('success');
      showToast(`+${finalEarned} Techno-XP!`, 'Спецмиссия успешно сдана!');
      unlockAchievement('sochi_explorer');
    }
  };

  // Mascot question handler with fresh student record
  const handleIncrementQuestionCount = async () => {
    if (!profile) return;
    const currentAll = getAllStudents();
    const fresh = currentAll.find(s => s.id === profile.id) || profile;
    const count = fresh.questionsAskedCount + 1;
    const updated = await apiUpdateStudent(fresh.id, {
      questionsAskedCount: count,
    });
    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      if (count >= 3) {
        unlockAchievement('mentor_friend');
      }
    }
  };

  // Auth Handlers
  const handleLoginStudent = (student: StudentProfile) => {
    setIsAdminInspecting(false);
    setActiveStudentId(student.id);
    setActiveId(student.id);
    setAuthMode('student');
    setActiveTab('lessons');
    navigateTo('/app');
    playByteSound('beep');
    showToast('ЛИЧНЫЙ КАБИНЕТ АКТИВИРОВАН', `${student.name} (@${student.callsign})`);
  };

  const handleRegisterStudent = async (data: any) => {
    setIsAdminInspecting(false);
    const newStudent = await apiRegisterStudent(data);
    if (newStudent) {
      setStudents(prev => [newStudent, ...prev]);
      setActiveId(newStudent.id);
      setActiveStudentId(newStudent.id);
      setAuthMode('student');
      setActiveTab('lessons');
      navigateTo('/app');
      playByteSound('levelUp');
      showToast('🎉 ДОБРО ПОЖАЛОВАТЬ В СЮТ СОЧИ!', `${newStudent.name} (@${newStudent.callsign})`);
    }
  };

  const handleLoginAdmin = () => {
    setIsAdminInspecting(false);
    setAuthMode('admin');
    navigateTo('/app');
    playByteSound('success');
    showToast('ДОСТУП ПРЕПОДАВАТЕЛЯ', 'Добро пожаловать в панель управления СЮТ Сочи');
  };

  // Administrator can inspect any student's cabinet directly
  const handleInspectStudent = (student: StudentProfile) => {
    setActiveStudentId(student.id);
    setActiveId(student.id);
    setIsAdminInspecting(true);
    setAuthMode('student');
    setActiveTab('lessons');
    navigateTo('/app');
    showToast('РЕЖИМ НАСТАВНИКА', `Инспекция кабинета: ${student.name} (@${student.callsign})`);
  };

  const handleLogout = () => {
    setIsAdminInspecting(false);
    setAuthMode('gateway');
    setGatewayTab('login');
    navigateTo('/app', '?tab=login');
    showToast('ВЫХОД ИЗ СИСТЕМЫ', 'Сеанс завершен');
  };

  // Admin student update handler
  const handleAdminUpdateStudent = async (studentId: string, fields: Partial<StudentProfile>) => {
    const updated = await apiUpdateStudent(studentId, fields);
    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('ЖУРНАЛ СЮТ ОБНОВЛЕН', 'Данные ученика сохранены');
    }
  };

  // Admin student delete handler
  const handleAdminDeleteStudent = async (studentId: string) => {
    const success = await apiDeleteStudent(studentId);
    if (success) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      if (activeId === studentId) {
        setActiveId('');
        setAuthMode('gateway');
      }
      showToast('УДАЛЕНО', 'Профиль ученика удален из журнала');
    }
  };

  // Admin create quest handler
  const handleAdminCreateQuest = (questData: Omit<Quest, 'id'>) => {
    const newQuest = addCustomQuest(questData);
    setQuests(getAllQuests());
    showToast('СПЕЦКВЕСТ ОПУБЛИКОВАН', newQuest.title);
  };

  // Admin delete quest handler
  const handleAdminDeleteQuest = (questId: string) => {
    deleteQuestById(questId);
    setQuests(getAllQuests());
    showToast('КВЕСТ УДАЛЕН', 'Задание удалено из каталога');
  };

  // Admin reset cohort handler
  const handleAdminResetCohort = async () => {
    const success = await apiResetCohort();
    if (success) {
      const data = await apiFetchStudents();
      setStudents(data);
      saveAllQuests(DEFAULT_QUESTS);
      setQuests(getAllQuests());
      showToast('СБРОС ВЫПОЛНЕН', 'База данных СЮТ Сочи возвращена к стандарту');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 border-2 border-amber-400 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-lg bg-amber-400/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 font-mono">
              {toastMessage.title}
            </div>
            <div className="text-xs text-slate-200">
              {toastMessage.subtitle}
            </div>
          </div>
        </div>
      )}

      {/* ROUTE 1: LANDING PAGE AT "/" */}
      {currentPath === '/' && (
        <LandingPage
          onNavigateToApp={() => navigateTo('/app', '?tab=login')}
          onNavigateToAdmin={() => navigateTo('/app', '?tab=admin')}
          activeStudent={authMode === 'student' ? profile : null}
          authMode={authMode}
        />
      )}

      {/* ROUTE 2: SYSTEM WORKSPACE AT "/app" */}
      {currentPath === '/app' && (
        <>
          {/* 2A. SEPARATE AUTH GATEWAY (STATIC LOGIN PAGE) */}
          {(authMode === 'gateway' || authMode === 'login') && (
            <AuthGateway
              students={students}
              initialTab={gatewayTab}
              onBackToLanding={() => navigateTo('/')}
              onLoginStudent={handleLoginStudent}
              onLoginAdmin={handleLoginAdmin}
            />
          )}

          {/* 3B. DEDICATED STUDENT ISOLATED WORKSPACE WITH STRUCTURED VERTICAL SIDEBAR */}
          {authMode === 'student' && (
            <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative">
              {/* Ambient Background Gradient Glow according to active theme */}
              <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b ${activeTheme.ambientBg} pointer-events-none transition-all duration-700 z-0`} />

              {/* Vertical Navigation Sidebar on Desktop & Slide-out Drawer on Mobile */}
              <SidebarNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                profile={profile}
                studentRank={students.slice().sort((a, b) => b.xp - a.xp).findIndex((s) => s.id === profile.id) + 1}
                totalStudents={students.length}
                onOpenAchievements={() => setIsAchievementsOpen(true)}
                onOpenCertificate={() => setIsCertificateOpen(true)}
                onOpenCustomization={() => setIsCustomizationOpen(true)}
                onOpenFeedback={() => setIsFeedbackOpen(true)}
                onLogout={handleLogout}
                onNavigateToLanding={() => navigateTo('/')}
              />

              {/* Main Content Workspace Column */}
              <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Top Header Bar (Breadcrumbs, Inspection Status, Quick Balances) */}
                <TopHeaderBar
                  activeTab={activeTab}
                  profile={profile}
                  isAdminInspecting={isAdminInspecting}
                  onExitInspect={() => {
                    setIsAdminInspecting(false);
                    setAuthMode('admin');
                  }}
                  onOpenAchievements={() => setIsAchievementsOpen(true)}
                  onOpenCustomization={() => setIsCustomizationOpen(true)}
                  onOpenFeedback={() => setIsFeedbackOpen(true)}
                  onNavigateToLanding={() => navigateTo('/')}
                />

                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {activeTab === 'lessons' && (
                    <LessonsSection
                      completedLessonIds={profile.completedLessonIds}
                      onLessonComplete={handleLessonComplete}
                      onEarnXp={handleEarnXp}
                    />
                  )}

                  {activeTab === 'lab' && (
                    <PromptLab
                      onEarnXp={handleEarnXp}
                      onUnlockAchievement={unlockAchievement}
                    />
                  )}

                  {activeTab === 'playground' && (
                    <CodePlayground
                      onEarnXp={handleEarnXp}
                      onUnlockAchievement={unlockAchievement}
                    />
                  )}

                  {activeTab === 'quests' && (
                    <QuestsSection
                      quests={quests}
                      completedQuestIds={profile.completedQuestIds}
                      onCompleteQuest={handleQuestComplete}
                      onUnlockAchievement={unlockAchievement}
                      onEarnXp={handleEarnXp}
                    />
                  )}

                  {activeTab === 'leaderboard' && (
                    <LeaderboardSection
                      students={students}
                      currentStudentId={profile.id}
                    />
                  )}

                  {activeTab === 'chat' && (
                    <EngineeringChatSection
                      currentStudent={profile}
                      students={students}
                    />
                  )}
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-400 mt-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                      <span className="font-bold text-slate-200">
                        МОУДОД Станция Юных Техников г. Сочи
                      </span>
                      <span className="hidden sm:inline" aria-hidden="true">·</span>
                      <span>Центр юношеского научно-технического творчества</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <a
                        href="https://sut-sochi.orgs.biz/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>Официальный сайт СЮТ Сочи</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span aria-hidden="true">·</span>
                      <span>г. Сочи, 2026</span>
                    </div>
                  </div>
                </footer>
              </div>

              {/* Floating Quick Customization & Feedback Buttons on bottom left */}
              <div className="fixed bottom-5 left-5 z-40 hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setIsCustomizationOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-purple-300 hover:text-white border border-purple-500/40 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                  title="Студия кастомизации и стилей сайта"
                >
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Стиль: {activeTheme.badge}</span>
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                  title="Окно обратной связи для поддержки и тестировщиков"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Обратная связь</span>
                </button>
              </div>

              {/* Living Byte Robot with Token Engine & Audio */}
              <LivingByte
                tokenBalance={profile.tokenBalance}
                byteSkinId={customization.byteSkinId}
                onConsumeTokens={handleConsumeTokens}
                onEarnXp={handleEarnXp}
                onIncrementQuestionCount={handleIncrementQuestionCount}
              />

              {/* Modals */}
              <AchievementsModal
                isOpen={isAchievementsOpen}
                onClose={() => setIsAchievementsOpen(false)}
                achievements={achievements}
                profile={profile}
              />

              <CertificateModal
                isOpen={isCertificateOpen}
                onClose={() => setIsCertificateOpen(false)}
                profile={profile}
              />

              {/* Theme & Style Customization Studio Modal */}
              <CustomizationStudioModal
                isOpen={isCustomizationOpen}
                onClose={() => setIsCustomizationOpen(false)}
                profile={profile}
                currentConfig={customization}
                onApplyConfig={handleApplyCustomization}
                onOpenAchievements={() => setIsAchievementsOpen(true)}
              />

              {/* Tester Feedback & Support Modal */}
              <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                profile={profile}
                currentTab={activeTab}
                onFeedbackSubmitted={() => {
                  showToast('РЕПОРТ ПРИНЯТ', 'Спасибо за обратную связь! Отправлено наставникам СЮТ.');
                }}
              />

              {/* Floating Quick Chat Drawer on all screens */}
              <FloatingChatDrawer
                currentStudent={profile}
                onOpenFullChat={() => setActiveTab('chat')}
              />
            </div>
          )}

      {/* 3. DEDICATED SEPARATE ADMINISTRATOR INTERFACE */}
      {authMode === 'admin' && (
        <div className="min-h-screen bg-slate-950 flex flex-col">
          {/* Admin Header Bar */}
          <header className="sticky top-0 z-30 bg-slate-900 border-b border-amber-500/40 px-6 py-4 shadow-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>МОУДОД СЮТ г. Сочи · Кабинет управления наставника</span>
                  </h1>
                  <p className="text-[11px] font-mono text-amber-300/80">
                    Режим полного администрирования учебного процесса
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateTo('/')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  title="Перейти на главную страницу (лендинг)"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>На главную</span>
                </button>

                <button
                  onClick={() => handleInspectStudent(profile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold border border-cyan-500/50 transition-colors cursor-pointer"
                  title="Войти в кабинет выбранного ученика"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Кабинет @{profile.callsign}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти из админки</span>
                </button>
              </div>
            </div>
          </header>

          {/* Admin Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            <AdminPanel
              students={students}
              quests={quests}
              onUpdateStudent={handleAdminUpdateStudent}
              onDeleteStudent={handleAdminDeleteStudent}
              onAddStudent={handleRegisterStudent}
              onCreateQuest={handleAdminCreateQuest}
              onDeleteQuest={handleAdminDeleteQuest}
              onResetCohort={handleAdminResetCohort}
              onInspectStudent={handleInspectStudent}
            />
          </main>

          {/* Admin Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-900/80 py-4 px-6 text-center text-xs text-slate-500">
            МОУДОД Станция Юных Техников г. Сочи · Защищенная сессия администратора курса ИИ
          </footer>
        </div>
      )}
        </>
      )}
    </div>
  );
}
