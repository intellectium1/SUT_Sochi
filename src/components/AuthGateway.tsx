import React, { useState, useEffect } from 'react';
import { StudentProfile, SUTDepartment } from '../types';
import {
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  UserCheck,
  Search,
  Copy,
  Check,
  Sparkles,
  Zap,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { verifyStudentLogin, verifyAdminPassword, ADMIN_SECRET_CODE } from '../data/studentStorage';
import { TEST_ACCOUNTS_CREDENTIALS, TestAccountCredential } from '../data/testAccounts';

interface AuthGatewayProps {
  students: StudentProfile[];
  initialTab?: 'login' | 'admin';
  onBackToLanding?: () => void;
  onLoginStudent: (student: StudentProfile) => void;
  onLoginAdmin: () => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  students,
  initialTab = 'login',
  onBackToLanding,
  onLoginStudent,
  onLoginAdmin,
}) => {
  const [authRole, setAuthRole] = useState<'student' | 'admin'>(initialTab === 'admin' ? 'admin' : 'student');

  useEffect(() => {
    if (initialTab === 'admin') {
      setAuthRole('admin');
    } else {
      setAuthRole('student');
    }
  }, [initialTab]);

  // Student Login Form State
  const [loginInput, setLoginInput] = useState('student1');
  const [passwordInput, setPasswordInput] = useState('sut2026_01');
  const [showPassword, setShowPassword] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Admin Login Form State
  const [adminTokenInput, setAdminTokenInput] = useState('');
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Accounts directory search & filter
  const [searchFilter, setSearchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('Все');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  // Submit student login
  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    const authenticatedStudent = verifyStudentLogin(loginInput, passwordInput);

    if (authenticatedStudent) {
      onLoginStudent(authenticatedStudent);
    } else {
      setStudentError(
        'Неверный логин или пароль. Вход разрешён только по 15 утверждённым тестовым аккаунтам базы данных СЮТ (student1 – student15).'
      );
    }
  };

  // Submit admin login
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (verifyAdminPassword(adminTokenInput)) {
      onLoginAdmin();
    } else {
      setAdminError(
        `Неверный токен администратора. Доступ разрешён только единственному администратору платформы по токену: ${ADMIN_SECRET_CODE}`
      );
    }
  };

  // Quick 1-click select/fill
  const fillCredentials = (acc: TestAccountCredential, autoSubmit = false) => {
    setAuthRole('student');
    setLoginInput(acc.login);
    setPasswordInput(acc.password);
    setStudentError(null);

    if (autoSubmit) {
      const studentObj = students.find((s) => s.id === acc.id) || null;
      if (studentObj) {
        onLoginStudent(studentObj);
      }
    }
  };

  const fillAdminCredentials = (autoSubmit = false) => {
    setAuthRole('admin');
    setAdminTokenInput(ADMIN_SECRET_CODE);
    setAdminError(null);

    if (autoSubmit) {
      onLoginAdmin();
    }
  };

  // Filter accounts
  const filteredAccounts = TEST_ACCOUNTS_CREDENTIALS.filter((acc) => {
    const matchesDept = deptFilter === 'Все' || acc.department === deptFilter;
    const q = searchFilter.toLowerCase().trim();
    const matchesQuery =
      !q ||
      acc.login.toLowerCase().includes(q) ||
      acc.name.toLowerCase().includes(q) ||
      acc.callsign.toLowerCase().includes(q) ||
      acc.department.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });

  const departments: SUTDepartment[] = [
    'Робототехника',
    'Программирование',
    'IT & ИИ',
    'Аэроклуб',
    'Судомоделирование',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-600/10 via-emerald-600/5 to-transparent pointer-events-none" />

      {/* Top Banner Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>МОУДОД СЮТ г. Сочи</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">Инженерная Академия ИИ 2026</span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                Статичный шлюз входа в образовательную систему
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">На главную страницу</span>
                <span className="sm:hidden">Назад</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: AUTHENTICATION FORM (5 cols) ================= */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Role Switcher Tabs (Only Student or Admin, NO Registration) */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthRole('student');
                  setStudentError(null);
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authRole === 'student'
                    ? 'bg-slate-800 text-cyan-300 shadow font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Ученик СЮТ (15)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthRole('admin');
                  setAdminError(null);
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authRole === 'admin'
                    ? 'bg-slate-800 text-amber-300 shadow font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Администратор</span>
              </button>
            </div>

            <div className="p-6 sm:p-7">
              {/* === MODE 1: STUDENT LOGIN === */}
              {authRole === 'student' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Вход для учащихся</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Личный кабинет юного техника
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Авторизация строго по 15 утвержденным аккаунтам базы данных. Регистрация отключена.
                    </p>
                  </div>

                  {studentError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span className="leading-relaxed">{studentError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                        <span>Логин ученика:</span>
                        <span className="text-[10px] text-cyan-400/90 font-mono">
                          student1 – student15
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        placeholder="Например: student1 или TechnoExplorer_26"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                        <span>Пароль доступа:</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Формат: sut2026_01 – sut2026_15
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="sut2026_01"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
                    >
                      <span>Войти в изолированный кабинет</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Policy Info Notice */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-400 font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Изолированный контур учащихся</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Вход в систему разрешён исключительно по 15 предустановленным аккаунтам. Для быстрого тестирования воспользуйтесь карточками справа («Войти в 1 клик»).
                    </p>
                  </div>
                </div>
              )}

              {/* === MODE 2: ADMIN LOGIN === */}
              {authRole === 'admin' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Единственный администратор платформы</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Кабинет главного наставника СЮТ
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      В системе предусмотрен единственный администратор с полным контролем. Вход строго по мастер-токену.
                    </p>
                  </div>

                  {adminError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <span className="leading-relaxed">{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                        <span>Мастер-токен администратора:</span>
                        <button
                          type="button"
                          onClick={() => setAdminTokenInput(ADMIN_SECRET_CODE)}
                          className="text-[10px] text-amber-400 hover:underline font-mono cursor-pointer"
                        >
                          Вставить токен
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          type={showAdminToken ? 'text' : 'password'}
                          required
                          value={adminTokenInput}
                          onChange={(e) => setAdminTokenInput(e.target.value)}
                          placeholder={`Введи мастер-токен: ${ADMIN_SECRET_CODE}...`}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminToken(!showAdminToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          title={showAdminToken ? 'Скрыть токен' : 'Показать токен'}
                        >
                          {showAdminToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Войти как единственный администратор</span>
                    </button>
                  </form>

                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Мастер-токен доступа</span>
                    </div>
                    <div className="font-mono text-amber-300 font-bold text-xs select-all bg-slate-950/80 px-2.5 py-1.5 rounded border border-amber-500/30 flex items-center justify-between">
                      <span>{ADMIN_SECRET_CODE}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ADMIN_SECRET_CODE, 'admin-token')}
                        className="text-amber-400 hover:text-amber-200 ml-2"
                        title="Скопировать токен"
                      >
                        {copiedKey === 'admin-token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                      Даёт полный контроль над журналом успеваемости, начислением токенов ученикам и спецмиссиями.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: 15 TEST ACCOUNTS DIRECTORY (7 cols) ================= */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                  <span>База данных СЮТ г. Сочи</span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  15 утверждённых тестовых аккаунтов
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Всего аккаунтов: <strong className="text-white">{TEST_ACCOUNTS_CREDENTIALS.length}</strong>
              </div>
            </div>

            {/* Admin quick login tile */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-sm font-bold">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Единственный администратор СЮТ</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">MASTER</span>
                  </div>
                  <div className="text-[11px] font-mono text-amber-300/80">
                    Токен: <span className="font-bold select-all">{ADMIN_SECRET_CODE}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fillAdminCredentials(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  Заполнить
                </button>
                <button
                  type="button"
                  onClick={() => fillAdminCredentials(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Войти в 1 клик</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Department Filter & Search */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeptFilter('Все')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    deptFilter === 'Все'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Все (15)
                </button>
                {departments.map((dept) => {
                  const count = TEST_ACCOUNTS_CREDENTIALS.filter((a) => a.department === dept).length;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDeptFilter(dept)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        deptFilter === dept
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {dept} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Поиск по логину (student1), имени, позывному..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Student Cards List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredAccounts.map((acc, index) => {
                const isSelected = loginInput === acc.login;
                return (
                  <div
                    key={acc.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Student info */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-lg shrink-0">
                          {acc.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">
                              {acc.name}
                            </span>
                            <span className="text-[11px] font-mono text-cyan-400/90 truncate">
                              @{acc.callsign}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                              {acc.grade}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap">
                            <span className="text-slate-300 font-medium">
                              {acc.department}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-amber-400 font-mono">
                              {acc.xp} XP (Ур. {acc.level})
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-emerald-400 font-mono">
                              {acc.tokenBalance.toLocaleString()} токенов
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Credentials & Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        {/* Login badge */}
                        <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-right">
                          <div className="text-[10px] text-slate-400 font-mono">
                            Логин: <strong className="text-white select-all">{acc.login}</strong>
                          </div>
                          <div className="text-[10px] text-amber-300/90 font-mono">
                            Пароль: <strong className="select-all">{acc.password}</strong>
                          </div>
                        </div>

                        {/* Fill Button */}
                        <button
                          type="button"
                          onClick={() => fillCredentials(acc, false)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                          title="Заполнить в поля формы"
                        >
                          Вставить
                        </button>

                        {/* 1-Click Login Button */}
                        <button
                          type="button"
                          onClick={() => fillCredentials(acc, true)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Мгновенный вход под этим учеником"
                        >
                          <span>Войти</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAccounts.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  Аккаунтов по запросу «{searchFilter}» не найдено.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Static Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        МОУДОД Станция Юных Техников г. Сочи · Электронная система учёта успеваемости 2026 · Закрытый контур (15 учеников + 1 администратор)
      </footer>
    </div>
  );
};
