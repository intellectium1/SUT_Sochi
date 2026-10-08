import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  THEME_PRESETS,
  BYTE_SKINS,
  CARD_GLOW_OPTIONS,
  SOUND_FX_OPTIONS,
  ThemePreset,
  ByteSkin,
  StudentCustomizationConfig,
  saveStudentCustomization,
} from '../data/themeCustomizationData';
import { INITIAL_ACHIEVEMENTS } from '../data/achievementsData';
import {
  X,
  Palette,
  Bot,
  Sparkles,
  Lock,
  Check,
  RotateCcw,
  Volume2,
  Sliders,
  ExternalLink,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import { playByteSound } from '../utils/byteAudio';

interface CustomizationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  currentConfig: StudentCustomizationConfig;
  onApplyConfig: (config: StudentCustomizationConfig) => void;
  onOpenAchievements?: () => void;
}

export const CustomizationStudioModal: React.FC<CustomizationStudioModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentConfig,
  onApplyConfig,
  onOpenAchievements,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'skins' | 'effects'>('themes');
  const [previewConfig, setPreviewConfig] = useState<StudentCustomizationConfig>(currentConfig);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  const unlockedAchievementSet = new Set(profile.unlockedAchievementIds || []);

  const isThemeUnlocked = (theme: ThemePreset) => {
    if (!theme.requiredAchievementId) return true;
    return unlockedAchievementSet.has(theme.requiredAchievementId);
  };

  const isSkinUnlocked = (skin: ByteSkin) => {
    if (!skin.requiredAchievementId) return true;
    return unlockedAchievementSet.has(skin.requiredAchievementId);
  };

  const isGlowUnlocked = (glowId: string) => {
    const item = CARD_GLOW_OPTIONS.find((g) => g.id === glowId);
    if (!item?.requiredAchievementId) return true;
    return unlockedAchievementSet.has(item.requiredAchievementId);
  };

  const isSoundUnlocked = (soundId: string) => {
    const item = SOUND_FX_OPTIONS.find((s) => s.id === soundId);
    if (!item?.requiredAchievementId) return true;
    return unlockedAchievementSet.has(item.requiredAchievementId);
  };

  const getAchievementTitle = (achId?: string) => {
    if (!achId) return '';
    const found = INITIAL_ACHIEVEMENTS.find((a) => a.id === achId);
    return found ? `«${found.title}»` : achId;
  };

  const getAchievementDesc = (achId?: string) => {
    if (!achId) return '';
    const found = INITIAL_ACHIEVEMENTS.find((a) => a.id === achId);
    return found ? found.description : '';
  };

  const handleSelectTheme = (theme: ThemePreset) => {
    if (!isThemeUnlocked(theme)) return;
    const next = { ...previewConfig, themeId: theme.id };
    setPreviewConfig(next);
    onApplyConfig(next);
    playByteSound('beep');
    showFeedback();
  };

  const handleSelectSkin = (skin: ByteSkin) => {
    if (!isSkinUnlocked(skin)) return;
    const next = { ...previewConfig, byteSkinId: skin.id };
    setPreviewConfig(next);
    onApplyConfig(next);
    playByteSound('beep');
    showFeedback();
  };

  const handleSelectGlow = (glowId: string) => {
    if (!isGlowUnlocked(glowId)) return;
    const next = { ...previewConfig, cardGlowId: glowId };
    setPreviewConfig(next);
    onApplyConfig(next);
    playByteSound('beep');
    showFeedback();
  };

  const handleSelectSound = (soundId: string) => {
    if (!isSoundUnlocked(soundId)) return;
    const next = { ...previewConfig, soundFxId: soundId };
    setPreviewConfig(next);
    onApplyConfig(next);
    playByteSound('beep');
    showFeedback();
  };

  const handleResetDefault = () => {
    const defaultConfig: StudentCustomizationConfig = {
      themeId: 'theme-default',
      byteSkinId: 'skin-classic',
      cardGlowId: 'glow-none',
      soundFxId: 'sound-scifi',
    };
    setPreviewConfig(defaultConfig);
    onApplyConfig(defaultConfig);
    playByteSound('beep');
    showFeedback();
  };

  const showFeedback = () => {
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2000);
  };

  const unlockedThemesCount = THEME_PRESETS.filter(isThemeUnlocked).length;
  const unlockedSkinsCount = BYTE_SKINS.filter(isSkinUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Студия кастомизации & Темы оформления
                </h2>
                {appliedSuccess && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                    Стиль применен!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Новые темы и скины робота открываются за прохождение достижений и спецквестов
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Закрыть студию"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Stat Pill */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-cyan-400">
              <Palette className="w-3.5 h-3.5" />
              <span>Темы: {unlockedThemesCount} из {THEME_PRESETS.length}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 font-mono text-purple-400">
              <Bot className="w-3.5 h-3.5" />
              <span>Скины Байта: {unlockedSkinsCount} из {BYTE_SKINS.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAchievements && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAchievements();
                }}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Award className="w-3 h-3" />
                <span>Все достижения ({profile.unlockedAchievementIds.length})</span>
              </button>
            )}

            <button
              onClick={handleResetDefault}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Сбросить на базовый стиль СЮТ"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить стиль</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>1. Темы сайта ({unlockedThemesCount}/{THEME_PRESETS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skins')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'skins'
                ? 'bg-slate-800 text-purple-300 shadow-sm border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>2. Скины робота Байта ({unlockedSkinsCount}/{BYTE_SKINS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('effects')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'effects'
                ? 'bg-slate-800 text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Свечение рамок и звуки</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Выберите тему для изменения фонового освещения, цвета акцентных кнопок, вкладок и подсветки модулей системы.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THEME_PRESETS.map((theme) => {
                  const isUnlocked = isThemeUnlocked(theme);
                  const isActive = previewConfig.themeId === theme.id;
                  const reqAchTitle = getAchievementTitle(theme.requiredAchievementId);
                  const reqAchDesc = getAchievementDesc(theme.requiredAchievementId);

                  return (
                    <div
                      key={theme.id}
                      onClick={() => isUnlocked && handleSelectTheme(theme)}
                      className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                        isActive
                          ? 'border-cyan-400 bg-slate-800/90 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                          : isUnlocked
                          ? 'border-slate-800 bg-slate-850 hover:bg-slate-800 hover:border-slate-700 cursor-pointer'
                          : 'border-slate-800/60 bg-slate-950/60 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Top Bar with Palette Dots */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.previewColors.primary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.previewColors.secondary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: theme.previewColors.accent }}
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300">
                              {theme.badge}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-500 text-slate-950 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Активна</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title and Subtitle */}
                        <h3 className="text-sm font-bold text-white mb-1">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                          {theme.description}
                        </p>
                      </div>

                      {/* Unlock Status / Button */}
                      <div className="pt-3 border-t border-slate-800/80 mt-2">
                        {isUnlocked ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Разблокировано</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTheme(theme);
                              }}
                              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-slate-700 text-cyan-300'
                                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                              }`}
                            >
                              {isActive ? 'Используется' : 'Применить стиль'}
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs">
                            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-0.5">
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Требуется достижение:</span>
                            </div>
                            <div className="font-bold text-white text-[11px]">
                              {reqAchTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {reqAchDesc}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BYTE SKINS */}
          {activeTab === 'skins' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Изменяйте внешний вид и реплики вашего ИИ-наставника робота Байта, открывая уникальные аватары и головные уборы!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BYTE_SKINS.map((skin) => {
                  const isUnlocked = isSkinUnlocked(skin);
                  const isActive = previewConfig.byteSkinId === skin.id;
                  const reqAchTitle = getAchievementTitle(skin.requiredAchievementId);
                  const reqAchDesc = getAchievementDesc(skin.requiredAchievementId);

                  return (
                    <div
                      key={skin.id}
                      onClick={() => isUnlocked && handleSelectSkin(skin)}
                      className={`relative p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                        isActive
                          ? 'border-purple-400 bg-slate-800/90 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400/50'
                          : isUnlocked
                          ? 'border-slate-800 bg-slate-850 hover:bg-slate-800 hover:border-slate-700 cursor-pointer'
                          : 'border-slate-800/60 bg-slate-950/60 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Avatar & Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${skin.glowColor} flex items-center justify-center text-2xl shadow-md border border-white/20`}>
                              {skin.emoji}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">
                                {skin.name}
                              </h3>
                              <div className="text-[10px] font-mono text-cyan-400">
                                {skin.hatTitle}
                              </div>
                            </div>
                          </div>

                          {isActive && (
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-500 text-white flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Активен</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                          {skin.description}
                        </p>

                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 font-mono italic">
                          💬 «{skin.greetingSuffix}»
                        </div>
                      </div>

                      {/* Unlock Status / Button */}
                      <div className="pt-3 border-t border-slate-800/80 mt-3">
                        {isUnlocked ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Разблокировано</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSkin(skin);
                              }}
                              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-slate-700 text-purple-300'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white font-bold'
                              }`}
                            >
                              {isActive ? 'Используется' : 'Выбрать скин'}
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs">
                            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-0.5">
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Требуется достижение:</span>
                            </div>
                            <div className="font-bold text-white text-[11px]">
                              {reqAchTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {reqAchDesc}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EFFECTS & SOUND */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              {/* Card Glow Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Свечение и рамки карточек интерфейса
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CARD_GLOW_OPTIONS.map((glow) => {
                    const isUnlocked = isGlowUnlocked(glow.id);
                    const isActive = previewConfig.cardGlowId === glow.id;
                    const reqAchTitle = getAchievementTitle(glow.requiredAchievementId);

                    return (
                      <div
                        key={glow.id}
                        onClick={() => isUnlocked && handleSelectGlow(glow.id)}
                        className={`p-3.5 rounded-xl border transition-all text-left flex items-center justify-between ${
                          isActive
                            ? 'border-cyan-400 bg-slate-800/90 shadow'
                            : isUnlocked
                            ? 'border-slate-800 bg-slate-850 hover:bg-slate-800 cursor-pointer'
                            : 'border-slate-800/60 bg-slate-950/60 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{glow.name}</span>
                            {isActive && (
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                (Активно)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {glow.description}
                          </div>
                          {!isUnlocked && (
                            <div className="text-[10px] text-amber-400 mt-1 font-mono flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Нужно: {reqAchTitle}</span>
                            </div>
                          )}
                        </div>

                        {isUnlocked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectGlow(glow.id);
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                              isActive
                                ? 'bg-slate-700 text-cyan-300'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isActive ? 'Выбрано' : 'Включить'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sound Profile Section */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Звуковой профиль интерфейса
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SOUND_FX_OPTIONS.map((snd) => {
                    const isUnlocked = isSoundUnlocked(snd.id);
                    const isActive = previewConfig.soundFxId === snd.id;
                    const reqAchTitle = getAchievementTitle(snd.requiredAchievementId);

                    return (
                      <div
                        key={snd.id}
                        onClick={() => isUnlocked && handleSelectSound(snd.id)}
                        className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                          isActive
                            ? 'border-amber-400 bg-slate-800/90 shadow'
                            : isUnlocked
                            ? 'border-slate-800 bg-slate-850 hover:bg-slate-800 cursor-pointer'
                            : 'border-slate-800/60 bg-slate-950/60 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2 mb-1">
                            <span>{snd.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mb-2">
                            {snd.description}
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSound(snd.id);
                              }}
                              className={`w-full text-xs py-1 rounded-lg font-semibold ${
                                isActive
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              }`}
                            >
                              {isActive ? 'Активен' : 'Выбрать'}
                            </button>
                          ) : (
                            <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Нужно: {reqAchTitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Кастомизация автоматически сохраняется в вашем профиле</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
