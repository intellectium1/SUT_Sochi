import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackTicket,
  addFeedbackTicket,
} from '../data/feedbackStorage';
import {
  X,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Star,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Laptop,
  Check,
  Shield,
  HeartHandshake
} from 'lucide-react';
import { playByteSound } from '../utils/byteAudio';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  currentTab: string;
  onFeedbackSubmitted?: (ticket: FeedbackTicket) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentTab,
  onFeedbackSubmitted,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('tester_review');
  const [priority, setPriority] = useState<FeedbackPriority>('normal');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickTemplates = [
    { label: '🌟 Отличный интерактив и симуляторы', cat: 'tester_review' as const, rate: 5 },
    { label: '🐞 Заметил неточность в уроке', cat: 'bug' as const, rate: 4 },
    { label: '💡 Хочу больше заданий по Arduino', cat: 'feature' as const, rate: 5 },
    { label: '❓ Вопрос по получению аттестата', cat: 'support' as const, rate: 5 },
  ];

  const handleApplyTemplate = (tpl: typeof quickTemplates[0]) => {
    setCategory(tpl.cat);
    setRating(tpl.rate);
    if (!title) {
      setTitle(tpl.label.replace(/^[^\s]+\s/, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Пожалуйста, укажите тему сообщения.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Пожалуйста, опишите ваш отзыв или вопрос подробнее (не менее 10 символов).');
      return;
    }

    setSubmitting(true);

    try {
      // Auto-detect browser
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
      const cleanBrowser = userAgent.includes('Chrome')
        ? 'Chrome Browser'
        : userAgent.includes('Firefox')
        ? 'Firefox Browser'
        : userAgent.includes('Safari')
        ? 'Safari Browser'
        : 'Web Browser';

      const newTicket = addFeedbackTicket({
        category,
        priority,
        rating,
        title: title.trim(),
        description: description.trim(),
        studentId: profile.id,
        studentName: profile.name,
        studentCallsign: profile.callsign,
        studentDepartment: profile.department,
        browserInfo: `${cleanBrowser} · ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Desktop'}`,
        currentTab,
        tokenBalance: profile.tokenBalance,
      });

      playByteSound('success');
      setSubmitting(false);
      setIsSuccess(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(newTicket);
      }
    } catch (err) {
      setSubmitting(false);
      setError('Не удалось сохранить сообщение. Попробуйте ещё раз.');
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setTitle('');
    setDescription('');
    setCategory('tester_review');
    setPriority('normal');
    setRating(5);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Обратная связь & Поддержка тестировщиков</span>
              </h2>
              <p className="text-xs text-slate-400">
                МОУДОД СЮТ г. Сочи · Прямая связь с наставниками и разработчиками
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Закрыть окно обратной связи"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {isSuccess ? (
            /* Success confirmation screen */
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Отзыв успешно отправлен!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Благодарим за помощь в тестировании платформы СЮТ Сочи. Ваш репорт сохранён в журнале наставника и будет обработан инженерным отделом.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
                <div className="text-slate-400 flex justify-between">
                  <span>Тестер:</span>
                  <span className="text-cyan-400 font-bold">{profile.name} (@{profile.callsign})</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Тема:</span>
                  <span className="text-white truncate max-w-[180px]">{title}</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Оценка:</span>
                  <span className="text-amber-400">{'★'.repeat(rating)} ({rating}/5)</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Отправить ещё отзыв
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow"
                >
                  Вернуться к урокам
                </button>
              </div>
            </div>
          ) : (
            /* Active Feedback Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Selector Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                  Категория сообщения:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('tester_review')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      category === 'tester_review'
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Отзыв</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('bug')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      category === 'bug'
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Баг / Ошибка</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('feature')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      category === 'feature'
                        ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Идея</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('support')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      category === 'support'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow'
                        : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Вопрос</span>
                  </button>
                </div>
              </div>

              {/* Star Rating */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-xs font-semibold text-white">
                    Оценка стабильности и удобства платформы:
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Насколько вам понравилось работать с модулями ИИ СЮТ
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      title={`${star} из 5 звёзд`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold font-mono text-amber-400">
                    {rating}/5
                  </span>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Быстрые шаблоны темы:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickTemplates.map((tpl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Тема сообщения:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Краткая суть отзыва или найденной проблемы..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  maxLength={100}
                />
              </div>

              {/* Description & Priority Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Подробное описание:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Срочность:</span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-200 focus:outline-none"
                    >
                      <option value="low">Низкая</option>
                      <option value="normal">Обычная</option>
                      <option value="high">Высокая</option>
                      <option value="critical">Критическая</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите ваши впечатления, шаги воспроизведения ошибки или конкретное предложение по доработке..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Diagnostics Box */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Системные метаданные репорта (прикрепляются автоматически):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  <div>Тестер: <span className="text-white">{profile.name} (@{profile.callsign})</span></div>
                  <div>Отделение: <span className="text-cyan-400">{profile.department}</span></div>
                  <div>Активный экран: <span className="text-amber-400">{currentTab}</span></div>
                  <div>Баланс токенов: <span className="text-emerald-400">{profile.tokenBalance} токенов</span></div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Отправка...' : 'Отправить репорт'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
