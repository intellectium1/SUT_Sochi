import React, { useRef } from 'react';
import { StudentProfile } from '../types';
import { X, Printer, Award, Shield, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const certRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateNumber = `СЮТ-ИИ-${Math.abs(profile.xp * 73 + 1042).toString().slice(0, 6)}`;
  const issueDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden max-h-[95vh]">
        {/* Controls Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Квалификационный сертификат СЮТ Сочи</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Распечатать</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-6 overflow-y-auto bg-slate-950/60 flex items-center justify-center">
          <div
            ref={certRef}
            className="w-full bg-slate-900 text-slate-100 rounded-2xl p-8 border-2 border-amber-500/40 relative shadow-2xl overflow-hidden print:border-black print:text-black print:bg-white"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
            }}
          >
            {/* Watermark / Outer border ornament */}
            <div className="absolute inset-2 border border-slate-700/60 rounded-xl pointer-events-none" />

            <div className="text-center relative z-10 space-y-4">
              {/* Institution Title */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Муниципальное образовательное учреждение дополнительного образования
                </div>
                <div className="text-base md:text-lg font-bold tracking-tight text-white uppercase">
                  Станция Юных Техников г. Сочи
                </div>
                <div className="text-xs text-cyan-400 font-medium">
                  Центр цифрового образования и искусственного интеллекта
                </div>
              </div>

              {/* Certificate Heading */}
              <div className="py-2">
                <div className="inline-block border-b-2 border-amber-400 pb-1 px-8">
                  <h1 className="text-xl md:text-3xl font-extrabold uppercase tracking-wide text-amber-400 font-serif">
                    СЕРТИФИКАТ
                  </h1>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  № {certificateNumber}
                </div>
              </div>

              {/* Awarded to */}
              <div className="py-2">
                <div className="text-xs text-slate-400 mb-1">
                  Настоящий сертификат подтверждает, что юный исследователь
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {profile.name}
                </div>
                <div className="text-xs font-mono text-cyan-300 mt-1">
                  Позывной: @{profile.callsign} · Направление: {profile.department}
                </div>
              </div>

              {/* Description */}
              <div className="max-w-xl mx-auto text-xs text-slate-300 leading-relaxed border-y border-slate-800 py-3">
                Успешно освоил(а) программу курса <strong className="text-white">«Основы Искусственного Интеллекта и Промпт-инжиниринга»</strong>, продемонстрировал(а) навыки алгоритмического мышления, работы с нейросетями, декомпозиции инженерных задач и набрал(а):
                <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                  {profile.xp} очков Techno-XP · Квалификация: {profile.levelTitle}
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 px-4 text-left">
                <div className="text-xs">
                  <div className="text-slate-400">Дата выдачи:</div>
                  <div className="font-semibold text-slate-200">{issueDate}</div>
                  <div className="text-[10px] text-slate-500 font-mono">г. Сочи, Краснодарский край</div>
                </div>

                {/* SUT Sochi Seal */}
                <div className="w-20 h-20 rounded-full border-2 border-amber-400/80 p-1 flex items-center justify-center text-center shadow-lg shadow-amber-500/10">
                  <div className="w-full h-full rounded-full border border-dashed border-amber-400/60 flex flex-col items-center justify-center text-[8px] font-mono uppercase text-amber-300 leading-tight">
                    <Shield className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span>СЮТ СОЧИ</span>
                    <span>ПЕЧАТЬ</span>
                  </div>
                </div>

                <div className="text-xs text-right sm:text-right">
                  <div className="text-slate-400">Наставник ИИ-Академии:</div>
                  <div className="font-semibold text-slate-200">Робот-наставник Байт</div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Верифицировано СЮТ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
