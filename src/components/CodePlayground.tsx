import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Terminal,
  Code2,
  Copy,
  Check,
  Bug,
  HelpCircle,
  Sliders,
  Cpu,
  Activity,
  Compass,
  Brain,
  Layers,
  Info,
  Settings,
  MousePointer,
  Zap,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface CodePlaygroundProps {
  onEarnXp: (xp: number, reason?: string) => void;
  onUnlockAchievement: (achievementId: string) => void;
}

export interface CodeModuleInfo {
  name: string;
  purpose: string;
  role: string;
  keyFunctions: string[];
  snippetHint: string;
}

export interface ConfigPresetOption {
  id: string;
  label: string;
  description: string;
  configOverrides: Record<string, number | boolean | string>;
}

export interface ProjectPreset {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  category: 'Робототехника' | 'ИИ & Нейросети' | 'Микроконтроллеры' | 'БПЛА & Авионика' | 'Биомоделирование';
  icon: string;
  description: string;
  interactionHint: string;
  modules: CodeModuleInfo[];
  configOptions: ConfigPresetOption[];
  defaultConfig: Record<string, number | boolean | string>;
  sliderDefs: {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit?: string;
  }[];
  defaultCode: string;
}

const ADVANCED_PRESETS: ProjectPreset[] = [
  {
    id: 'sea-drone',
    badge: 'Hardware & AI',
    title: '1. Морской автономный дрон «Акватрон-26»',
    subtitle: 'Сонар, силовые поля искусственного потенциала (APF) и автопилот',
    category: 'Робототехника',
    icon: '🚢',
    description: 'Симуляция автономного катамарана СЮТ для исследования акватории Черного моря у мыса Видный. Дрон использует алгоритм искусственных потенциальных полей (Artificial Potential Field) для притяжения к маяку и отталкивания от рифов с сонаром дальнего сканирования.',
    interactionHint: 'Кликни по морской глади на холсте, чтобы переставить целевой маяк или добавить новую скалу!',
    modules: [
      {
        name: 'Состояние и кинематика дрона',
        role: 'Хранение координат (x, y), скорости, угла рыскания и характеристик луча сонара.',
        purpose: 'Определяет положение корпуса в акватории и физику поворотов с учетом инерции.',
        keyFunctions: ['drone.x', 'drone.y', 'drone.angle', 'drone.speed'],
        snippetHint: 'Координаты интегрируются шагом Эйлера: x += cos(angle) * speed'
      },
      {
        name: 'Сенсорный массив (УЗ-Сонар)',
        role: 'Сканирование сектора перед дроном на дистанцию sensorRange с углом обзора sensorAngle.',
        purpose: 'Обнаруживает препятствия, рассчитывает вектор дальности и формирует сигнал тревоги.',
        keyFunctions: ['calcSonarDistances()', 'dangerDetected', 'sensorRange'],
        snippetHint: 'Рассчитывает дистанцию: Math.sqrt(dx*dx + dy*dy) и сравнивает с порогом безопасности.'
      },
      {
        name: 'Навигационный контроллер (APF)',
        role: 'Вычисление результирующего вектора движения: вектор притяжения к маяку + вектор отталкивания от скал.',
        purpose: 'Обеспечивает плавное огибание препятствий без остановок и зацикливаний.',
        keyFunctions: ['toTargetAngle', 'avoidAngle', 'steerSmoothing'],
        snippetHint: 'Сглаживание угла: drone.angle = drone.angle * 0.8 + avoidAngle * 0.2'
      },
      {
        name: 'Визуализатор Canvas & HUD',
        role: 'Отрисовка морской сетки глубин, конуса луча сонара, корпуса катамарана и телеметрии.',
        purpose: 'Дает юному инженеру наглядный отклик о траектории и текущих режимах автопилота.',
        keyFunctions: ['drawGrid()', 'drawSonarCone()', 'drawTelemetryHUD()'],
        snippetHint: 'Использует трансформации ctx.save(), ctx.translate(), ctx.rotate() для корпуса.'
      }
    ],
    configOptions: [
      {
        id: 'calm',
        label: 'Штиль: открытая вода',
        description: 'Широкая зона сканирования, повышенная крейсерская скорость (2.4 узла).',
        configOverrides: { speed: 2.4, sensorRange: 90, obstacleCount: 3, sensorAngle: 60 }
      },
      {
        id: 'storm',
        label: 'Шторм & Плотный риф',
        description: 'Плотное скопление скал у берега, осторожная скорость (1.2 узла) и широкий луч (90°).',
        configOverrides: { speed: 1.2, sensorRange: 110, obstacleCount: 6, sensorAngle: 90 }
      },
      {
        id: 'sensor-fault',
        label: 'Отказ дальнего сонара',
        description: 'Короткий радиус обнаружения (45 м), требующий экстренных маневров уклонения.',
        configOverrides: { speed: 1.6, sensorRange: 45, obstacleCount: 4, sensorAngle: 45 }
      }
    ],
    defaultConfig: {
      speed: 1.8,
      sensorRange: 80,
      sensorAngle: 60,
      obstacleCount: 3
    },
    sliderDefs: [
      { key: 'speed', label: 'Скорость дрона', min: 0.5, max: 4.0, step: 0.1, unit: 'уз' },
      { key: 'sensorRange', label: 'Дальность сонара', min: 30, max: 140, step: 5, unit: 'м' },
      { key: 'sensorAngle', label: 'Сектор обзора сонара', min: 30, max: 120, step: 5, unit: '°' }
    ],
    defaultCode: `// === СЮТ СОЧИ: МОРСКОЙ АВТОНОМНЫЙ ДРОН «АКВАТРОН-26» ===
// Доступно: canvas, ctx, console, setInterval, config

const width = canvas.width;
const height = canvas.height;

// 1. Инициализация параметров из конфигуратора
const speed = Number(config.speed) || 1.8;
const sensorRange = Number(config.sensorRange) || 80;
const sensorAngleRad = (Number(config.sensorAngle) || 60) * Math.PI / 180;

// Состояние катамарана
let drone = {
  x: 60,
  y: 160,
  speed: speed,
  angle: 0,
  sensorRange: sensorRange,
  sensorAngle: sensorAngleRad
};

// Цель (исследовательский маяк СЮТ)
let target = { x: 440, y: 160 };

// Рифы и буи Черного моря
const obstacles = [
  { x: 190, y: 110, r: 24, label: "Риф №1" },
  { x: 260, y: 210, r: 28, label: "Мыс Видный" },
  { x: 360, y: 120, r: 22, label: "Буй СЮТ" }
];

// Интерактивное перемещение маяка по клику мыши
canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  target.x = clickX;
  target.y = clickY;
  console.log('Новая координата маяка:', Math.round(target.x), Math.round(target.y));
};

function mainLoop() {
  // 1. Морской фон и сетка глубин
  ctx.fillStyle = '#06162d';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#0c274c';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // 2. Отрисовка цели
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(target.x, target.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.font = '10px monospace';
  ctx.fillText('МАЯК НАЗНАЧЕНИЯ', target.x - 38, target.y - 14);

  // 3. Отрисовка препятствий
  obstacles.forEach(obs => {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(obs.label, obs.x - 20, obs.y + obs.r + 12);
  });

  // 4. Расчет векторов APF (Искусственные силовые поля)
  let toTargetAngle = Math.atan2(target.y - drone.y, target.x - drone.x);
  let avoidAngle = 0;
  let dangerDetected = false;
  let nearestDist = 999;

  obstacles.forEach(obs => {
    let dx = obs.x - drone.x;
    let dy = obs.y - drone.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < nearestDist) nearestDist = dist;

    if (dist < drone.sensorRange + obs.r) {
      dangerDetected = true;
      // Вектор отталкивания в противоположную от скалы сторону
      avoidAngle += Math.atan2(drone.y - obs.y, drone.x - obs.x);
    }
  });

  // Автопилот сглаживает угловую скорость
  if (dangerDetected) {
    drone.angle = drone.angle * 0.78 + avoidAngle * 0.22;
  } else {
    drone.angle = drone.angle * 0.90 + toTargetAngle * 0.10;
  }

  // Физический шаг движения
  drone.x += Math.cos(drone.angle) * drone.speed;
  drone.y += Math.sin(drone.angle) * drone.speed;

  // Ограничители границ акватории
  if (drone.x > width - 20) drone.x = 30;
  if (drone.y < 25 || drone.y > height - 25) drone.y = 160;

  // 5. Отрисовка конуса ультразвукового сонара
  ctx.save();
  ctx.translate(drone.x, drone.y);
  ctx.rotate(drone.angle);

  ctx.fillStyle = dangerDetected ? 'rgba(239, 68, 68, 0.28)' : 'rgba(6, 182, 212, 0.22)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, drone.sensorRange, -drone.sensorAngle/2, drone.sensorAngle/2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = dangerDetected ? '#ef4444' : '#06b6d4';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Силуэт двухкорпусного катамарана
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-12, -10, 24, 5); // левый поплавок
  ctx.fillRect(-12, 5, 24, 5);  // правый поплавок
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-6, -5, 14, 10); // центральный отсек электроники

  // Носовой обтекатель
  ctx.beginPath();
  ctx.moveTo(12, -10); ctx.lineTo(16, -7); ctx.lineTo(12, -5); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, 5); ctx.lineTo(16, 7); ctx.lineTo(12, 10); ctx.fill();

  ctx.restore();

  // 6. Телеметрический дисплей СЮТ
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.fillRect(10, 10, 310, 48);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(10, 10, 310, 48);

  ctx.fillStyle = dangerDetected ? '#f87171' : '#38bdf8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('ТЕЛЕМЕТРИЯ: ' + (dangerDetected ? 'ОБНАРУЖЕНО ПРЕПЯТСТВИЕ · МАНЕВР' : 'НОРМА · КУРС НА МАЯК'), 18, 26);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('Сонар: ' + Math.round(nearestDist) + 'м | Скорость: ' + drone.speed.toFixed(1) + ' узлов | Курс: ' + (drone.angle * 180 / Math.PI).toFixed(0) + '°', 18, 44);
}

setInterval(mainLoop, 35);
console.log('[АКВАТРОН-26] Системы активированы. Кликни по экрану, чтобы сменить координаты цели!');
`
  },
  {
    id: 'neural-net',
    badge: 'AI & Math',
    title: '2. Перцептрон & 2D классификатор решений',
    subtitle: 'Прямое распространение, сигмоида и разделяющая гиперплоскость',
    category: 'ИИ & Нейросети',
    icon: '🧠',
    description: 'Интерактивный визуализатор машинного обучения: однослойная нейросеть обучается разделять два класса объектов (например, «Безопасные зоны плавания» vs «Подводные рифы»). На холсте отрисовывается тепловая карта вероятностей и веса связей $w_1, w_2$ и смещение $b$.',
    interactionHint: 'Кликни левой кнопкой мыши по холсту, чтобы добавить точку Класса А (бирюзовый), или кликни с зажатым Shift для Класса Б (красный)!',
    modules: [
      {
        name: 'Датасет (Точки признаков X1, X2)',
        role: 'Хранение двумерных координат признаков [x1, x2] и целевых меток (0 или 1).',
        purpose: 'Служит обучающей выборкой для расчета градиента ошибки.',
        keyFunctions: ['dataset[]', 'normalize(x, y)', 'addSample()'],
        snippetHint: 'Точки масштабируются в диапазон [-1, 1] для стабильности функции активации.'
      },
      {
        name: 'Функция активации & Сигмоида',
        role: 'Сжатие взвешенной суммы $z = w_1 x_1 + w_2 x_2 + b$ в интервал вероятности [0, 1].',
        purpose: 'Обеспечивает дифференцируемый нелинейный переход.',
        keyFunctions: ['sigmoid(z)', '1 / (1 + Math.exp(-z))'],
        snippetHint: 'Производная сигмоиды для обучения: sig * (1 - sig)'
      },
      {
        name: 'Градиентный спуск & Обновление весов',
        role: 'Вычисление градиента среднеквадратичной ошибки (MSE) по весам $w_1, w_2$ и $b$.',
        purpose: 'Сдвигает гиперплоскость в сторону безошибочной классификации.',
        keyFunctions: ['trainEpoch()', 'w1 += dw1 * lr', 'loss'],
        snippetHint: 'dw = error * sigmoid_deriv * input_x * learning_rate'
      },
      {
        name: 'Шейдер решающей границы (Heatmap)',
        role: 'Попиксельная отрисовка сетки вероятностей классификатора на Canvas 2D.',
        purpose: 'Наглядно отображает плавный переход уверенности нейросети.',
        keyFunctions: ['drawDecisionBoundary()', 'rgba gradient', 'drawContourLine()'],
        snippetHint: 'Разделяющая прямая соответствует уравнению $w_1 x + w_2 y + b = 0$.'
      }
    ],
    configOptions: [
      {
        id: 'standard-lr',
        label: 'Стандартная скорость (lr=0.08)',
        description: 'Оптимальный градиентный спуск без колебаний.',
        configOverrides: { learningRate: 0.08, initialSamples: 16 }
      },
      {
        id: 'fast-lr',
        label: 'Быстрое обучение (lr=0.25)',
        description: 'Быстрая сходимость, пригодная для динамических данных.',
        configOverrides: { learningRate: 0.25, initialSamples: 20 }
      },
      {
        id: 'fine-lr',
        label: 'Точная подстройка (lr=0.02)',
        description: 'Медленная, сверхточная адаптация к сложным кластерам.',
        configOverrides: { learningRate: 0.02, initialSamples: 24 }
      }
    ],
    defaultConfig: {
      learningRate: 0.08,
      epochsPerFrame: 4
    },
    sliderDefs: [
      { key: 'learningRate', label: 'Скорость обучения (Learning Rate)', min: 0.01, max: 0.35, step: 0.01 },
      { key: 'epochsPerFrame', label: 'Эпох обучения в кадр', min: 1, max: 15, step: 1 }
    ],
    defaultCode: `// === СЮТ СОЧИ: 2D ПЕРЦЕПТРОН & ПОЛЕ РЕШЕНИЙ ИИ ===
// Доступно: canvas, ctx, console, setInterval, config

const width = canvas.width;
const height = canvas.height;

const lr = Number(config.learningRate) || 0.08;
const epochsPerFrame = Number(config.epochsPerFrame) || 4;

// Веса перцептрона: z = w1*x + w2*y + bias
let weights = {
  w1: (Math.random() - 0.5) * 2,
  w2: (Math.random() - 0.5) * 2,
  b: (Math.random() - 0.5)
};

let epochCount = 0;
let currentLoss = 0.5;

// Начальный обучающий датасет (X, Y в диапазоне [-1, 1], метка 0 или 1)
let dataset = [
  // Класс 0 (Бирюзовый - Безопасная акватория)
  { x: -0.6, y: -0.5, label: 0 },
  { x: -0.4, y: -0.2, label: 0 },
  { x: -0.7, y: 0.2, label: 0 },
  { x: -0.2, y: -0.6, label: 0 },
  { x: -0.5, y: -0.7, label: 0 },
  // Класс 1 (Коралловый - Подводные рифы)
  { x: 0.5, y: 0.4, label: 1 },
  { x: 0.7, y: 0.2, label: 1 },
  { x: 0.3, y: 0.6, label: 1 },
  { x: 0.6, y: 0.7, label: 1 },
  { x: 0.2, y: 0.4, label: 1 }
];

// Клик по холсту добавляет новую точку
canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  const nx = (px / width) * 2 - 1;
  const ny = (py / height) * 2 - 1;

  // Shift = Класс 1, Обычный клик = Класс 0
  const label = e.shiftKey ? 1 : 0;
  dataset.push({ x: nx, y: ny, label });
  console.log('Добавлен образец:', label === 0 ? 'Класс 0 (Безопасно)' : 'Класс 1 (Риф)', 'в', nx.toFixed(2), ny.toFixed(2));
};

function sigmoid(z) {
  return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
}

function trainStep() {
  let totalLoss = 0;

  dataset.forEach(sample => {
    const z = weights.w1 * sample.x + weights.w2 * sample.y + weights.b;
    const pred = sigmoid(z);
    const err = sample.label - pred; // Ошибка

    totalLoss += Math.abs(err);

    // Градиент сигмоиды dSig = pred * (1 - pred)
    const grad = err * (pred * (1 - pred));

    // Обновление весов (Gradient Ascent/Descent)
    weights.w1 += lr * grad * sample.x;
    weights.w2 += lr * grad * sample.y;
    weights.b += lr * grad;
  });

  currentLoss = totalLoss / dataset.length;
  epochCount++;
}

function render() {
  // 1. Обучаем несколько эпох за кадр
  for (let i = 0; i < epochsPerFrame; i++) {
    trainStep();
  }

  // 2. Отрисовка поля вероятностей (Decision Boundary Grid)
  const step = 20;
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;
      const z = weights.w1 * nx + weights.w2 * ny + weights.b;
      const p = sigmoid(z); // 0..1

      // Плавный цветовой градиент от бирюзового к красно-коралловому
      const r = Math.round(239 * p + 6 * (1 - p));
      const g = Math.round(68 * p + 182 * (1 - p));
      const b = Math.round(68 * p + 212 * (1 - p));

      ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, 0.22)\`;
      ctx.fillRect(x, y, step, step);
    }
  }

  // 3. Линия разделения w1*x + w2*y + b = 0 => y = (-w1*x - b) / w2
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const xLeft = -1;
  const yLeft = (-weights.w1 * xLeft - weights.b) / (weights.w2 || 0.0001);
  const xRight = 1;
  const yRight = (-weights.w1 * xRight - weights.b) / (weights.w2 || 0.0001);

  const screenLeftX = 0;
  const screenLeftY = ((yLeft + 1) / 2) * height;
  const screenRightX = width;
  const screenRightY = ((yRight + 1) / 2) * height;

  ctx.moveTo(screenLeftX, screenLeftY);
  ctx.lineTo(screenRightX, screenRightY);
  ctx.stroke();

  // 4. Отрисовка обучающих точек
  dataset.forEach(sample => {
    const sx = ((sample.x + 1) / 2) * width;
    const sy = ((sample.y + 1) / 2) * height;

    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fillStyle = sample.label === 0 ? '#06b6d4' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 5. HUD Информации
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(10, 10, 360, 50);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(10, 10, 360, 50);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('СЮТ AI: ОБУЧЕНИЕ НЕЙРОНА // ЭПОХА: ' + epochCount, 20, 26);

  ctx.fillStyle = '#4ade80';
  ctx.font = '10px monospace';
  ctx.fillText('Loss: ' + currentLoss.toFixed(4) + ' | w1: ' + weights.w1.toFixed(2) + ' | w2: ' + weights.w2.toFixed(2) + ' | b: ' + weights.b.toFixed(2), 20, 44);
}

setInterval(render, 40);
console.log('[НЕЙРОСЕТЬ] Перцептрон запущен. Клик = Точка Класса А, Shift+Клик = Точка Класса Б.');
`
  },
  {
    id: 'esp32-mcu',
    badge: 'IoT & Firmware',
    title: '3. Виртуальный микроконтроллер ESP32 / Arduino',
    subtitle: 'Макетная плата, ШИМ-сервопривод, встроенный LED и Serial UART',
    category: 'Микроконтроллеры',
    icon: '⚡',
    description: 'Аппаратный эмулятор платы микроконтроллера ESP32 СЮТ г. Сочи. Симулирует жизненный цикл прошивки setup() / loop(), работу ШИМ (Pulse Width Modulation) на сервоприводе, цифровой пин встроенного светодиода GPIO2 и аналоговый датчик освещенности (LDR ADC).',
    interactionHint: 'Двигай ползунок или кликай по датчику на холсте, чтобы изменить уровень освещенности!',
    modules: [
      {
        name: 'Firmware Loop & Виртуальный таймер',
        role: 'Управление частотой тактового генератора (Clock ticks) и выполнение тела loop().',
        purpose: 'Эмулирует микросекундные задержки и тактирование кристалла ESP32 (240 МГц).',
        keyFunctions: ['setup()', 'loop()', 'millis()', 'delay()'],
        snippetHint: 'Реализует неблокирующий опрос через виртуальный счетчик millis().'
      },
      {
        name: 'Регистры GPIO & ШИМ (PWM)',
        role: 'Управление состоянием цифровых пинов HIGH/LOW и скважностью ШИМ от 0 до 255.',
        purpose: 'Управляет физическим углом отклонения сервопривода робота-манипулятора.',
        keyFunctions: ['digitalWrite(pin, val)', 'ledcWrite(channel, duty)', 'servoAngle'],
        snippetHint: 'Скважность ШИМ (Duty cycle) преобразуется в угол поворота сервопривода (0–180°).'
      },
      {
        name: 'АЦП (Аналогово-цифровой преобразователь)',
        role: 'Оцифровка аналогового напряжения с датчика освещенности в 12-битное число (0–4095).',
        purpose: 'Позволяет алгоритму принимать решения в зависимости от внешней освещенности.',
        keyFunctions: ['analogRead(34)', 'adcRaw', 'voltage = (adc / 4095) * 3.3'],
        snippetHint: 'Преобразует люксы фоторезистора в шестнадцатеричные отсчеты АЦП.'
      },
      {
        name: 'Эмулятор виртуальной платы (PCB HUD)',
        role: 'Отрисовка чипа ESP32-WROOM, дорожек питания, синего светодиода и серво-качалки.',
        purpose: 'Дает юному электронщику понимание физического поведения компонентов схемы.',
        keyFunctions: ['drawMCU()', 'drawServoArm()', 'drawSerialMonitor()'],
        snippetHint: 'Отображает свечение LED с альфа-каналом, пропорциональным ШИМ.'
      }
    ],
    configOptions: [
      {
        id: 'servo-sweep',
        label: 'Режим 1: Сканирование сервоприводом (Sweep)',
        description: 'Плавное вращение сервопривода туда-обратно с ШИМ-модуляцией.',
        configOverrides: { pwmFreq: 50, adcThreshold: 1800, baudRate: 115200 }
      },
      {
        id: 'light-alarm',
        label: 'Режим 2: Сумеречное реле (LDR Trigger)',
        description: 'Включение прожектора и сирены при падении уровня света ниже порога.',
        configOverrides: { pwmFreq: 50, adcThreshold: 900, baudRate: 115200 }
      },
      {
        id: 'strobe',
        label: 'Режим 3: Аварийный стробоскоп (SOS Beacon)',
        description: 'Импульсная вспышка светодиода с высокой частотой для спасательного маяка.',
        configOverrides: { pwmFreq: 200, adcThreshold: 2500, baudRate: 9600 }
      }
    ],
    defaultConfig: {
      pwmFreq: 50,
      adcThreshold: 1800,
      lightLevel: 65
    },
    sliderDefs: [
      { key: 'lightLevel', label: 'Освещенность датчика LDR', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'adcThreshold', label: 'Порог срабатывания АЦП', min: 200, max: 3800, step: 50 }
    ],
    defaultCode: `// === СЮТ СОЧИ: ВИРТУАЛЬНЫЙ КОНТРОЛЛЕР ESP32 ===
// Доступно: canvas, ctx, console, setInterval, config

const width = canvas.width;
const height = canvas.height;

// Состояние микроконтроллера
let mcu = {
  gpio2: false,       // Встроенный синий светодиод
  pwmDuty: 128,       // Скважность ШИМ (0..255)
  servoAngle: 90,     // Угол сервопривода (0..180)
  adcRaw: 2048,       // Значение АЦП 12-бит (0..4095)
  voltage: 1.65,      // Напряжение на пине (0..3.3V)
  direction: 1
};

let tick = 0;
const adcThreshold = Number(config.adcThreshold) || 1800;
let userLight = Number(config.lightLevel) || 65;

// Клик по экрану меняет освещенность
canvas.onmousedown = (e) => {
  const rect = canvas.getBoundingClientRect();
  const py = e.clientY - rect.top;
  userLight = Math.round(100 - (py / height) * 100);
  console.log('Датчик LDR: освещенность изменена на', userLight, '%');
};

function loop() {
  tick++;

  // 1. АЦП: симуляция чтения фоторезистора
  mcu.adcRaw = Math.round((userLight / 100) * 4095);
  mcu.voltage = (mcu.adcRaw / 4095) * 3.3;

  // 2. Логика прошивки: Sweep сервопривода
  mcu.servoAngle += mcu.direction * 2.5;
  if (mcu.servoAngle >= 170) mcu.direction = -1;
  if (mcu.servoAngle <= 10) mcu.direction = 1;

  mcu.pwmDuty = Math.round((mcu.servoAngle / 180) * 255);

  // 3. Автоматика: если свет ниже порога — зажигаем тревожный LED
  mcu.gpio2 = mcu.adcRaw < adcThreshold;

  // 4. Отрисовка платы ESP32 и обвеса
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, width, height);

  // Печатная плата (PCB)
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(40, 40, 200, 240);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 200, 240);

  // Металлический экран чипа ESP-WROOM-32
  ctx.fillStyle = '#64748b';
  ctx.fillRect(60, 60, 160, 110);
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(60, 60, 160, 110);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ESP-WROOM-32', 85, 95);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '9px monospace';
  ctx.fillText('WiFi & BLE · СЮТ Сочи', 80, 115);
  ctx.fillText('Dual Core 240MHz', 88, 130);

  // Встроенный светодиод GPIO2
  ctx.fillStyle = mcu.gpio2 ? '#38bdf8' : '#1e293b';
  ctx.beginPath();
  ctx.arc(80, 210, 8, 0, Math.PI * 2);
  ctx.fill();

  if (mcu.gpio2) {
    // Свечение (Glow)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.beginPath();
    ctx.arc(80, 210, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '9px monospace';
  ctx.fillText('GPIO2 (LED)', 100, 214);

  // Механический сервопривод справа
  const servoCenterX = 380;
  const servoCenterY = 160;

  // Корпус сервопривода
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(servoCenterX - 45, servoCenterY - 45, 90, 90);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(servoCenterX - 45, servoCenterY - 45, 90, 90);

  // Вал сервопривода
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(servoCenterX, servoCenterY, 14, 0, Math.PI * 2);
  ctx.fill();

  // Качалка сервопривода, повернутая на угол servoAngle
  ctx.save();
  ctx.translate(servoCenterX, servoCenterY);
  ctx.rotate((mcu.servoAngle - 90) * Math.PI / 180);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-6, -48, 12, 56);
  ctx.beginPath();
  ctx.arc(0, -48, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('СЕРВОПРИВОД SG90', servoCenterX - 55, servoCenterY + 65);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('УГОЛ: ' + Math.round(mcu.servoAngle) + '° (ШИМ ' + mcu.pwmDuty + ')', servoCenterX - 60, servoCenterY + 82);

  // Информационный оверлей датчика LDR
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(40, 290, 420, 22);
  ctx.fillStyle = '#4ade80';
  ctx.font = '10px monospace';
  ctx.fillText('ADC34 (LDR): ' + mcu.adcRaw + ' (' + mcu.voltage.toFixed(2) + 'V) | Порог: ' + adcThreshold + ' | Статус LED: ' + (mcu.gpio2 ? 'ON' : 'OFF'), 50, 305);
}

setInterval(loop, 40);
console.log('[ESP32 FIRMWARE] Контроллер запущен. Кликни по экрану для изменения освещенности LDR!');
`
  },
  {
    id: 'kalman-imu',
    badge: 'Avionics & Math',
    title: '4. Фильтр Калмана телеметрии БПЛА',
    subtitle: 'Слияние данных акселерометра и гироскопа квадрокоптера над Сочи',
    category: 'БПЛА & Авионика',
    icon: '🚁',
    description: 'Симуляция полетного контроллера квадрокоптера в условиях порывистого кавказского ветра. Алгоритм фильтра Калмана объединяет показания зашумленного акселерометра и дрейфующего гироскопа, получая высокоточную оценку истинного угла крена аппарата.',
    interactionHint: 'Кликни по холсту, чтобы смоделировать резкий порыв ветра (импульсное возмущение угла)!',
    modules: [
      {
        name: 'Модель истинного угла & Физика БПЛА',
        role: 'Генерация реального физического угла крена (Roll) квадрокоптера под действием ветра.',
        purpose: 'Служит эталоном (Ground Truth) для сравнения качества фильтрации.',
        keyFunctions: ['trueAngle', 'windDisturbance', 'aerodynamicDamping'],
        snippetHint: 'Колебания дрона рассчитываются через гармонический осциллятор с затуханием.'
      },
      {
        name: 'Генератор сенсорного шума IMU',
        role: 'Добавление случайного гауссова шума к акселерометру и дрейфа нуля к гироскопу.',
        purpose: 'Имитирует вибрацию от вращения пропеллеров и тепловой дрейф MEMS-датчиков.',
        keyFunctions: ['accelNoise = (Math.random() - 0.5) * noiseLevel', 'gyroDrift'],
        snippetHint: 'Акселерометр точен в статике, но сильно шумит от вибрации моторов.'
      },
      {
        name: 'Уравнения фильтра Калмана 1D',
        role: 'Шаг предсказания по гироскопу + шаг коррекции по акселерометру с коэффициентом усиления Калмана K.',
        purpose: 'Оптимально устраняет высокочастотный шум и компенсирует низкочастотный дрейф.',
        keyFunctions: ['kalmanGain = P / (P + R)', 'angle += K * (measured - angle)', 'P = (1 - K) * P'],
        snippetHint: 'Коэффициент усиления K балансирует между доверием к предсказанию и датчику.'
      },
      {
        name: 'Многоканальный осциллограф',
        role: 'Отрисовка в реальном времени трех осциллограмм: эталон, сырые датчики и Калман.',
        purpose: 'Наглядно демонстрирует победу математики над физическим шумом.',
        keyFunctions: ['drawChartWaveform()', 'bufferQueue', 'renderHorizon()'],
        snippetHint: 'Использует циклический буфер точек на холсте 500x320.'
      }
    ],
    configOptions: [
      {
        id: 'light-turbulence',
        label: 'Легкая турбулентность (Шум 15%)',
        description: 'Стандартный полет в штиль, умеренные вибрации винтов.',
        configOverrides: { noiseLevel: 15, kalmanQ: 0.005, kalmanR: 0.05 }
      },
      {
        id: 'mountain-gust',
        label: 'Горный шквал (Шум 45%)',
        description: 'Сильная вибрация над хребтом Аибга, экстремальный шум датчиков.',
        configOverrides: { noiseLevel: 45, kalmanQ: 0.015, kalmanR: 0.12 }
      },
      {
        id: 'aggressive-filter',
        label: 'Агрессивное сглаживание',
        description: 'Высокое доверие модели, полное подавление резких скачков.',
        configOverrides: { noiseLevel: 25, kalmanQ: 0.001, kalmanR: 0.25 }
      }
    ],
    defaultConfig: {
      noiseLevel: 20,
      kalmanQ: 0.005,
      kalmanR: 0.06
    },
    sliderDefs: [
      { key: 'noiseLevel', label: 'Уровень шума датчиков IMU', min: 5, max: 60, step: 2, unit: '%' },
      { key: 'kalmanR', label: 'Ковариация шума измерений (R)', min: 0.01, max: 0.25, step: 0.01 }
    ],
    defaultCode: `// === СЮТ СОЧИ: ФИЛЬТР КАЛМАНА ДЛЯ ТЕЛЕМЕТРИИ БПЛА ===
// Доступно: canvas, ctx, console, setInterval, config

const width = canvas.width;
const height = canvas.height;

const noiseLevel = Number(config.noiseLevel) || 20;
const R_measure = Number(config.kalmanR) || 0.06;
const Q_process = 0.005;

// Состояние фильтра Калмана
let kalmanState = {
  angle: 0,
  P: 1, // Ковариация ошибки
  K: 0  // Усиление Калмана
};

// Физика истинного угла
let trueAngle = 0;
let angleVel = 0;
let time = 0;

// Буферы для осциллографа
const maxSamples = 70;
const historyTrue = [];
const historyRaw = [];
const historyKalman = [];

// Клик по холсту моделирует порыв ветра
canvas.onmousedown = () => {
  trueAngle += (Math.random() > 0.5 ? 25 : -25);
  console.log('Порыв ветра! Резкое возмущение угла до:', trueAngle.toFixed(1), '°');
};

function loop() {
  time += 0.05;

  // 1. Истинное движение (колебания дрона с затуханием)
  trueAngle = trueAngle * 0.94 + Math.sin(time) * 12;

  // 2. Сырые измерения акселерометра с сильным шумом
  const noise = (Math.random() - 0.5) * noiseLevel * 1.5;
  const rawMeasurement = trueAngle + noise;

  // 3. Шаг фильтра Калмана:
  // а) Предсказание: P = P + Q
  kalmanState.P = kalmanState.P + Q_process;

  // б) Усиление Калмана: K = P / (P + R)
  kalmanState.K = kalmanState.P / (kalmanState.P + R_measure);

  // в) Коррекция: angle = angle + K * (raw - angle)
  kalmanState.angle = kalmanState.angle + kalmanState.K * (rawMeasurement - kalmanState.angle);

  // г) Обновление ковариации: P = (1 - K) * P
  kalmanState.P = (1 - kalmanState.K) * kalmanState.P;

  // Сохраняем историю
  historyTrue.push(trueAngle);
  historyRaw.push(rawMeasurement);
  historyKalman.push(kalmanState.angle);

  if (historyTrue.length > maxSamples) {
    historyTrue.shift();
    historyRaw.shift();
    historyKalman.shift();
  }

  // 4. Отрисовка осциллографа
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Сетка осциллографа
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 35) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += 35) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  const centerY = height / 2;

  // Нулевая ось
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
  ctx.stroke();

  // Вспомогательная функция рисования кривой
  function drawWave(arr, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < arr.length; i++) {
      const x = (i / (maxSamples - 1)) * width;
      const y = centerY - arr[i] * 2.8;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 1. Сырой датчик (Красный - зашумленный)
  drawWave(historyRaw, 'rgba(239, 68, 68, 0.55)', 1);

  // 2. Истинный угол (Белый - эталон)
  drawWave(historyTrue, 'rgba(255, 255, 255, 0.75)', 2);

  // 3. Отфильтрованный угол Калмана (Бирюзовый - чистый)
  drawWave(historyKalman, '#06b6d4', 2.5);

  // Легенда осциллографа
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(10, 10, 420, 48);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(10, 10, 420, 48);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('■ Сырой акселерометр (вибрация винтов)', 20, 26);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText('■ Фильтр Калмана (телеметрия полетника)', 20, 44);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('■ Истинный крен', 290, 26);

  ctx.fillStyle = '#4ade80';
  ctx.fillText('K: ' + kalmanState.K.toFixed(3), 290, 44);
}

setInterval(loop, 40);
console.log('[АВИОНИКА] Фильтр Калмана активен. Кликни по экрану для создания возмущения ветра!');
`
  },
  {
    id: 'fractal-botany',
    badge: 'L-System & Math',
    title: '5. Рекурсивное кибер-дерево парка «Дендрарий»',
    subtitle: 'Морфогенез субтропических растений Сочи, фракталы и фототропизм',
    category: 'Биомоделирование',
    icon: '🌴',
    description: 'Математическая L-система и рекурсивное моделирование ботанических структур субтропиков Сочи. Эмулирует ветвление пицундской сосны и пальм с учетом коэффициента усадки ветвей, ветровой нагрузки и угла поворота к солнцу.',
    interactionHint: 'Перемещай мышь по холсту, чтобы менять положение источника света и угол фототропизма ветвей!',
    modules: [
      {
        name: 'Рекурсивный генератор ветвей',
        role: 'Функция drawBranch(x, y, len, angle, depth), порождающая дерево вызовов.',
        purpose: 'Воплощает природный фрактальный закон самоподобия.',
        keyFunctions: ['drawBranch()', 'depth === 0 return', 'shrinkFactor'],
        snippetHint: 'Каждая ветвь делится на 2-3 дочерних побега с уменьшенной длиной.'
      },
      {
        name: 'Фактор ветра и гравитропизма',
        role: 'Внесение синусоидального колебания и угла отклонения от ветра в реальном времени.',
        purpose: 'Оживляет статичный фрактал, превращая его в живую анимацию колыхания кроны.',
        keyFunctions: ['windAngle = sin(time) * 0.08', 'gravityFactor'],
        snippetHint: 'Ветровой сдвиг суммируется на каждом уровне рекурсии.'
      },
      {
        name: 'Цветовой градиент биомассы',
        role: 'Динамический расчет цвета ветви от одревесневшего ствола к молодым побегам.',
        purpose: 'Обеспечивает эстетичную визуализацию биологических зон растения.',
        keyFunctions: ['depth > 4 ? #0284c7 : #10b981', 'lineWidth = depth * 1.4'],
        snippetHint: 'Толщина линии плавно спадает от основания к листьям.'
      }
    ],
    configOptions: [
      {
        id: 'palm',
        label: 'Сочинская пальма (Широкий угол)',
        description: 'Угол расхождения 52°, пышная широкая крона субтропиков.',
        configOverrides: { branchAngle: 0.52, maxDepth: 7, shrinkFactor: 0.76 }
      },
      {
        id: 'pine',
        label: 'Пицундская сосна (Прямой ствол)',
        description: 'Острый угол расхождения 32°, стройная пирамидальная крона.',
        configOverrides: { branchAngle: 0.32, maxDepth: 8, shrinkFactor: 0.79 }
      },
      {
        id: 'bonsai',
        label: 'Кибер-бонсай (Асимметрия)',
        description: 'Выраженная кривизна ветвей под действием морского бриза.',
        configOverrides: { branchAngle: 0.60, maxDepth: 7, shrinkFactor: 0.72 }
      }
    ],
    defaultConfig: {
      branchAngle: 0.44,
      maxDepth: 7,
      shrinkFactor: 0.76
    },
    sliderDefs: [
      { key: 'branchAngle', label: 'Угол ветвления (Радианы)', min: 0.20, max: 0.80, step: 0.02, unit: 'рад' },
      { key: 'maxDepth', label: 'Глубина рекурсии (Поколения)', min: 3, max: 8, step: 1 }
    ],
    defaultCode: `// === СЮТ СОЧИ: ФРАКТАЛЬНОЕ КИБЕР-ДЕРЕВО ДЕНДРАРИЯ ===
// Доступно: canvas, ctx, console, setInterval, config

const width = canvas.width;
const height = canvas.height;

const branchAngle = Number(config.branchAngle) || 0.44;
const maxDepth = Number(config.maxDepth) || 7;
const shrinkFactor = Number(config.shrinkFactor) || 0.76;

let time = 0;
let sunX = width / 2;

// Движение мыши управляет фототропизмом (тягой к свету)
canvas.onmousemove = (e) => {
  const rect = canvas.getBoundingClientRect();
  sunX = e.clientX - rect.left;
};

function drawTree(startX, startY, length, angle, depth) {
  if (depth === 0) return;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  const endX = startX + length * Math.sin(angle);
  const endY = startY - length * Math.cos(angle);

  // Цвет от ствола к хвое
  if (depth > 5) {
    ctx.strokeStyle = '#38bdf8'; // Мощный ствол
    ctx.lineWidth = depth * 1.6;
  } else if (depth > 2) {
    ctx.strokeStyle = '#34d399'; // Ветки
    ctx.lineWidth = depth * 1.2;
  } else {
    ctx.strokeStyle = '#f472b6'; // Цветущие побеги
    ctx.lineWidth = 1.2;
  }

  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Ветер качает ветви в зависимости от глубины
  const wind = Math.sin(time + depth * 0.8) * 0.04;

  // Небольшая тяга к положению солнца
  const sunBias = ((sunX - startX) / width) * 0.05;

  drawTree(endX, endY, length * shrinkFactor, angle - branchAngle + wind + sunBias, depth - 1);
  drawTree(endX, endY, length * shrinkFactor, angle + branchAngle + wind + sunBias, depth - 1);
}

function render() {
  time += 0.05;

  // Фон субтропической ночи
  ctx.fillStyle = '#050b14';
  ctx.fillRect(0, 0, width, height);

  // Солнце / Источник света СЮТ
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(sunX, 40, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.beginPath();
  ctx.arc(sunX, 40, 26, 0, Math.PI * 2);
  ctx.fill();

  // Запуск рекурсии из нижнего центра
  drawTree(width / 2, height - 15, 76, 0, maxDepth);

  // HUD
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.fillRect(10, 10, 360, 44);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(10, 10, 360, 44);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ДЕНДРАРИЙ СЮТ // БИОНИЧЕСКИЙ МОРФОГЕНЕЗ', 18, 25);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('Рекурсия: ' + maxDepth + ' | Угол: ' + (branchAngle * 180 / Math.PI).toFixed(1) + '° | Ветер: активен', 18, 42);
}

setInterval(render, 40);
console.log('[БИОНИКА] L-система запущена. Води мышью по холсту для управления фототропизмом!');
`
  }
];

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  onEarnXp,
  onUnlockAchievement,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ADVANCED_PRESETS[0].id);
  const currentPreset = ADVANCED_PRESETS.find((p) => p.id === selectedPresetId) || ADVANCED_PRESETS[0];

  const [code, setCode] = useState<string>(currentPreset.defaultCode);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active configuration sliders & values
  const [activeConfig, setActiveConfig] = useState<Record<string, number | boolean | string>>(
    () => ({ ...currentPreset.defaultConfig })
  );

  // Inspector tabs: 'modules' | 'config' | 'guide'
  const [activeTab, setActiveTab] = useState<'modules' | 'config' | 'guide'>('modules');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number>(0);

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);

  // Execution controls
  const [isRunning, setIsRunning] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const testedProjectsRef = useRef<Record<string, boolean>>({});
  const lastRewardedCodeRef = useRef<Record<string, string>>({});
  const lastRunTimeRef = useRef<number>(0);
  const lastAiAssistTimeRef = useRef<number>(0);

  // On preset switch
  const handleSelectPreset = (presetId: string) => {
    const preset = ADVANCED_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setCode(preset.defaultCode);
    setActiveConfig({ ...preset.defaultConfig });
    setSelectedModuleIdx(0);
    setAiExplanation(null);
    setAiTips([]);
    setErrorMsg(null);
    setConsoleLogs([]);
  };

  // On preset config profile click
  const handleApplyConfigPreset = (option: ConfigPresetOption) => {
    setActiveConfig((prev) => ({
      ...prev,
      ...option.configOverrides,
    }));
  };

  const handleSliderChange = (key: string, value: number) => {
    setActiveConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Execution engine
  const executeCode = (shouldAwardXp: boolean) => {
    setErrorMsg(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isRunning) return;

    // Custom console capture
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
      error: (...args: any[]) => logs.push('[ERR] ' + args.join(' ')),
    };

    // Proxy setInterval so we can clear on next run
    const customSetInterval = (fn: (...args: any[]) => void, delay: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const id = window.setInterval(fn, delay);
      intervalRef.current = id;
      return id;
    };

    try {
      // Execute in Function wrapper passing canvas, ctx, console, setInterval, config
      const runFn = new Function('canvas', 'ctx', 'console', 'setInterval', 'config', code);
      runFn(canvas, ctx, customConsole, customSetInterval, activeConfig);

      if (logs.length > 0) {
        setConsoleLogs((prev) => [...prev.slice(-30), ...logs]);
      }

      if (shouldAwardXp) {
        const now = Date.now();
        const timeSinceLastAward = now - lastRunTimeRef.current;
        const isFirstTestOfProject = !testedProjectsRef.current[selectedPresetId];
        const isCodeModified = code.trim() !== (lastRewardedCodeRef.current[selectedPresetId] || '');

        if (isFirstTestOfProject) {
          lastRunTimeRef.current = now;
          testedProjectsRef.current[selectedPresetId] = true;
          lastRewardedCodeRef.current[selectedPresetId] = code.trim();
          onEarnXp(60, 'Запуск передового симулятора СЮТ!');
          onUnlockAchievement('code_pioneer');
        } else if (isCodeModified && timeSinceLastAward > 4000) {
          lastRunTimeRef.current = now;
          lastRewardedCodeRef.current[selectedPresetId] = code.trim();
          onEarnXp(20, 'Оптимизация параметров скрипта');
        }
      }
    } catch (err: any) {
      console.error('Playground Execution Error:', err);
      setErrorMsg(err?.message || 'Ошибка выполнения кода');
    }
  };

  const handleManualRun = () => {
    setIsRunning(true);
    executeCode(true);
  };

  const handleTogglePause = () => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    } else {
      setIsRunning(true);
      executeCode(false);
    }
  };

  // Re-run whenever code, preset, or activeConfig changes
  useEffect(() => {
    executeCode(false);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedPresetId, activeConfig, isRunning]);

  // AI Assist calls
  const handleAiAction = async (action: 'explain' | 'enhance' | 'fix') => {
    setAiLoading(true);
    try {
      let promptTask = `Объясни модуль «${currentPreset.modules[selectedModuleIdx]?.name}» в эмуляторе «${currentPreset.title}» для школьника СЮТ`;
      if (action === 'enhance') {
        promptTask = `Добавь продвинутую фичу в эмулятор «${currentPreset.title}» с новыми математическими параметрами`;
      }
      if (action === 'fix') {
        promptTask = `Найди возможные ошибки, проверь деление на ноль и оптимизируй алгоритм «${currentPreset.title}»`;
      }

      const res = await fetch('/api/ai/code-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: promptTask,
          language: 'JavaScript (HTML5 Canvas 2D Engine)',
          code: code,
          action: action,
        }),
      });

      const data = await res.json();
      setAiExplanation(data.explanation || 'Алгоритм успешно проанализирован!');
      setAiTips(data.tips || []);

      if (action === 'enhance' || action === 'fix') {
        if (data.code && data.code.trim().length > 30) {
          setCode(data.code);
        }
      }

      const now = Date.now();
      if (now - lastAiAssistTimeRef.current > 4000) {
        lastAiAssistTimeRef.current = now;
        onEarnXp(25, 'Парное программирование с ИИ-наставником');
      }
    } catch (err) {
      setAiExplanation('В коде реализован чистый реактивный цикл с передачей глобального объекта config. Изменяй параметры в панели слева и наблюдай за телеметрией!');
      setAiTips(['Попробуй протестировать экстремальные граничные значения', 'Добавь собственные отладочные сообщения console.log()']);
      const now = Date.now();
      if (now - lastAiAssistTimeRef.current > 4000) {
        lastAiAssistTimeRef.current = now;
        onEarnXp(15, 'Исследование архитектуры симулятора');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Preset Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <span>ПЕСОЧНИЦА КОДА СЮТ СОЧИ</span>
            <span aria-hidden="true">·</span>
            <span>ПРОГРАММНЫЕ ЭМУЛЯТОРЫ</span>
            <span aria-hidden="true">·</span>
            <span>CANVAS 2D & SENSORS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>{currentPreset.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentPreset.subtitle}
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {ADVANCED_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/15'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Banner: Preset Context & Interaction Tip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {currentPreset.description}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
            <MousePointer className="w-3.5 h-3.5 shrink-0" />
            <span><strong>Интерактив на экране:</strong> {currentPreset.interactionHint}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              isRunning
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Продолжить</span>
              </>
            )}
          </button>

          <button
            onClick={handleManualRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Перезапуск</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Grid: Code Editor (7 cols) & Live Viewport/Console (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Code Editor & AI Helper (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  main_emulator.js
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  ES6 + HTML5 Canvas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                  }}
                  title="Скопировать весь код"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 text-xs flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Копировать</span>
                </button>

                <button
                  onClick={() => {
                    setCode(currentPreset.defaultCode);
                    setActiveConfig({ ...currentPreset.defaultConfig });
                  }}
                  title="Сбросить код и параметры к исходным"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800 text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Сброс</span>
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={21}
                spellCheck={false}
                className="w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed resize-y selection:bg-cyan-500/30"
              />
            </div>

            {/* AI Assistant Control Bar */}
            <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>ИИ-наставник Байт:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAiAction('explain')}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Объяснить модуль
                </button>
                <button
                  onClick={() => handleAiAction('enhance')}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Улучшить математику
                </button>
                <button
                  onClick={() => handleAiAction('fix')}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Аудит багов
                </button>
              </div>
            </div>
          </div>

          {/* AI Response Card */}
          {aiExplanation && (
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-cyan-500/40 text-xs text-slate-200 animate-fadeIn space-y-2 shadow-xl">
              <div className="font-bold text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Разбор алгоритма от робота-наставника Байта:</span>
              </div>
              <p className="leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                {aiExplanation}
              </p>
              {aiTips.length > 0 && (
                <div className="text-[11px] text-slate-400 pt-1">
                  <span className="text-amber-400 font-bold">Советы инженеру:</span> {aiTips.join(' · ')}
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-xs text-rose-200 space-y-1 shadow-xl">
              <div className="font-bold flex items-center gap-2 text-rose-400">
                <Bug className="w-4 h-4" />
                <span>Исключение во время выполнения:</span>
              </div>
              <div className="font-mono bg-black/40 p-2.5 rounded-lg border border-rose-900 text-[11px]">
                {errorMsg}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Canvas Viewport & Console Log (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Canvas Card */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>Живой холст симулятора (Viewport)</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">500 × 320 px</span>
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-slate-800 bg-black flex items-center justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={500}
                height={320}
                className="w-full h-auto max-w-full block cursor-crosshair"
              />
            </div>
          </div>

          {/* Console Log Terminal */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-slate-300 font-mono font-bold">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Консоль телеметрии (Console Output)</span>
              </div>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Очистить
              </button>
            </div>

            <div className="font-mono text-[11px] text-slate-300 space-y-1 max-h-48 min-h-28 overflow-y-auto">
              {consoleLogs.length > 0 ? (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900/60 pb-0.5 leading-relaxed">
                    <span className="text-cyan-500 mr-2">&gt;</span>
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic text-xs py-3 text-center">
                  Телеметрия пуста. Запусти скрипт или кликни по холсту...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Deep Learning Section: Module Inspector & Execution Configurations */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Navigation Tabs between Modules, Configs, and Guide */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'modules'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Анатомия модулей кода ({currentPreset.modules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Параметры & Конфигурации</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Гид запуска скриптов</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Эмулятор: <strong className="text-cyan-400">{currentPreset.title}</strong>
          </div>
        </div>

        {/* TAB 1: MODULES ARCHITECTURE BREAKDOWN */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Архитектурная декомпозиция: кто за что отвечает в коде
              </h3>
              <p className="text-xs text-slate-400">
                Каждый образовательный скрипт построен по модульному принципу: от приема входных данных датчиков до численных расчетов и отрисовки кадров.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentPreset.modules.map((mod, idx) => {
                const isSelected = selectedModuleIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedModuleIdx(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-400 font-bold">МОДУЛЬ #{idx + 1}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold">
                            ВЫБРАН
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white">{mod.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{mod.role}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 mt-3 text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-mono">Назначение:</span> {mod.purpose}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Module Deep-Dive Card */}
            {currentPreset.modules[selectedModuleIdx] && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">
                      Детальный анализ: {currentPreset.modules[selectedModuleIdx].name}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">
                    Ключевые функции: {currentPreset.modules[selectedModuleIdx].keyFunctions.join(', ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-mono text-slate-400 text-[11px]">ФОРМУЛА / СТРУКТУРА:</div>
                    <div className="font-mono text-cyan-300 text-xs">
                      {currentPreset.modules[selectedModuleIdx].snippetHint}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="font-mono text-slate-400 text-[11px]">РЕКОМЕНДАЦИЯ ПО ИЗМЕНЕНИЮ:</div>
                    <div className="text-slate-300 text-xs">
                      Попробуй изменить коэффициенты в этом модуле внутри редактора выше и нажми «Перезапуск», чтобы оценить влияние на физику.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE CONFIGURATION TWEAKER & PRESETS */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Конфигурационные профили & Живые регуляторы параметров
              </h3>
              <p className="text-xs text-slate-400">
                Запускай скрипты в разных сценариях. Переменные передаются в код через глобальный объект <code className="text-cyan-300">config</code>.
              </p>
            </div>

            {/* Preset Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentPreset.configOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleApplyConfigPreset(opt)}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] font-mono text-cyan-400">ПРИМЕНИТЬ</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                </div>
              ))}
            </div>

            {/* Live Sliders */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                ЖИВЫЕ РЕГУЛЯТОРЫ (ПРИМЕНЯЮТСЯ В РЕАЛЬНОМ ВРЕМЕНИ)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPreset.sliderDefs.map((slider) => {
                  const currentValue = activeConfig[slider.key] !== undefined
                    ? Number(activeConfig[slider.key])
                    : slider.min;

                  return (
                    <div key={slider.key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{slider.label}:</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {currentValue} {slider.unit || ''}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={currentValue}
                        onChange={(e) => handleSliderChange(slider.key, Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>{slider.min} {slider.unit || ''}</span>
                        <span>{slider.max} {slider.unit || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STEP-BY-STEP EXECUTION GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Гид инженера: как вводить, редактировать и запускать скрипты
              </h3>
              <p className="text-xs text-slate-400">
                Песочница исполняет чистый JavaScript в безопасном изолированном контексте виртуального холста HTML5.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-bold text-white text-sm">Глобальный контекст</h4>
                <p className="text-slate-400 leading-relaxed">
                  В твоем распоряжении объект <code className="text-cyan-300">canvas</code> (500x320 px), 2D-контекст <code className="text-cyan-300">ctx</code>, консоль <code className="text-cyan-300">console.log()</code> и параметры <code className="text-cyan-300">config</code>.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-bold text-white text-sm">Игровой цикл (Game Loop)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Для непрерывной анимации используй <code className="text-emerald-300">setInterval(mainLoop, 35)</code>. Песочница автоматически перехватывает интервал и корректно перезапускает его при изменении кода.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-bold text-white text-sm">Интерактивный ввод</h4>
                <p className="text-slate-400 leading-relaxed">
                  Навешивай обработчики <code className="text-amber-300">canvas.onmousedown</code> и <code className="text-amber-300">canvas.onmousemove</code> прямо в коде, чтобы считывать клики и координаты курсора пользователя.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
              <span>
                Горячие клавиши: правки в коде применяются моментально, а нажатие <strong>«Перезапуск»</strong> начисляет Techno-XP за инженерное исследование!
              </span>
              <button
                onClick={handleManualRun}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shrink-0 ml-4"
              >
                Запустить прямо сейчас
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
