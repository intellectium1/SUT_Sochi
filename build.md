# ТЕХНИЧЕСКОЕ ЗАДАНИЕ И АРХИТЕКТУРНЫЙ ПЛАН РАЗРАБОТКИ (BUILD.MD)
## Проект: «Кибер-Полигон СЮТ Сочи 3D» (SUT Sochi AI Cyber-Polygon 3D)
### Мультиплеерная интерактивная 3D-платформа для обучения нейросетям и автономным системам

---

## 1. Концепция и Педагогический Контекст СЮТ Сочи

### 1.1. Миссия проекта
Интеграция передовых методов интерактивного обучения и генеративного ИИ в классические инженерные дисциплины **МОУДОД «Станция Юных Техников г. Сочи»**. Платформа превращает теоретическое изучение машинного обучения в увлекательный соревновательный и кооперативный 3D-симулятор, работающий прямо в браузере в связке с Google AI Studio / Google Playground и Gemini API.

### 1.2. Отраслевые треки СЮТ Сочи в игровом пространстве
1. **Робототехника и Сенсорика:**
   - Моделирование автономных катамаранов, глубоководных батискафов и подводных аппаратов в акватории Черного моря (бухта Сочи, порт, рифы).
   - Обработка сонарных данных, лидаров, эхолотов и ультразвуковых датчиков расстояния с наложением шумов реального мира.
2. **Аэроклуб и БПЛА:**
   - Полеты квадрокоптеров и гидросамолетов в условиях сочинского рельефа (гора Ахун, каньон Псахо, побережье).
   - Аэродинамические модели, гироскопы, барометры, компенсация порывов ветра и тепловых восходящих потоков.
3. **IT, Программирование и Искусственный Интеллект:**
   - Обучение агентов с подкреплением (Reinforcement Learning / PPO / DQN).
   - Компьютерное зрение: сегментация препятствий, детекция морских объектов (буи, дельфины, спасательные капсулы).
   - LLM-агенты: управление группой дронов с помощью естественного языка (Agentic Multi-Agent System на базе Gemini).
4. **Судомоделирование:**
   - Гидродинамические симуляции, плавучесть, балансировка киля и рулевых приводов в условиях волнения 1–4 балла.

---

## 2. Архитектура Системы (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            КЛИЕНТСКИЙ УРОВЕНЬ (SPA)                         │
│                                                                             │
│  ┌────────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐  │
│  │   Three.js / Canvas    │  │ React UI Overlay    │  │ Code / AI Editor │  │
│  │  - WebGL / WebGPU      │  │ - Телеметрия        │  │ - Google Playgr. │  │
│  │  - Rapier 3D Physics   │  │ - Чат отряда        │  │ - Python/TS REPL │  │
│  │  - Шейдеры волн и терр.│  │ - Инспектор весов   │  │ - Gemini Prompt  │  │
│  └───────────┬────────────┘  └──────────┬──────────┘  └────────┬─────────┘  │
│              │                          │                      │            │
│              └──────────────────────────┼──────────────────────┘            │
│                                         │                                   │
│                        ┌────────────────▼────────────────┐                  │
│                        │    Network & Sync Engine        │                  │
│                        │  - Prediction & Reconciliation │                  │
│                        │  - LERP / HERMITE Snapshot Sync │                  │
│                        └────────────────┬────────────────┘                  │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ WebSocket (Бинарный / JSON)
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    АВТОРИТЕТНЫЙ СЕРВЕРНЫЙ СЛОЙ (NODE.JS / TS)               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │               Authoritative Game Loop (60 Hz Physics, 20 Hz Net)      │  │
│  │  - Rapier 3D Server Instance (Валидация столкновений и скоростей)     │  │
│  │  - State Manager: Снэпшоты мира, delta-компрессия, интерполяция       │  │
│  │  - Anti-Cheat & Rate Limiting (Строгий запрет читерства)              │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                     Модуль ИИ-Агентов и Среды Обучения                │  │
│  │  - RL Environment Adapter (Gym-совместимый интерфейс: Step/Reset)    │  │
│  │  - Gemini Multi-Agent Bridge (Vision + Function Calling)              │  │
│  │  - База аккаунтов (15 учеников СЮТ + Мастер-токен администратора)     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Игровые Режимы Обучения Нейросетям

### Режим 1: «Морской Дозор: Computer Vision & Object Detection»
- **Суть:** В акватории порта Сочи установлены плавучие маяки, датчики течения и тренировочные маркеры. Ученик запускает алгоритм компьютерного зрения (эмуляция YOLOv8 / MobileNet).
- **Игровая задача:** Беспилотный катамаран должен на ходу с камеры идентифицировать объекты, выделять их в Bounding Box, классифицировать класс и передавать координаты спасательному роботу союзника.
- **Интерактивный тренажер:** Регулировка порога уверенности (Confidence Threshold), IoU (Intersection over Union), матрицы ошибок (Confusion Matrix) прямо в оверлее игры.

### Режим 2: «Штормовой Фарватер: Reinforcement Learning (PPO)»
- **Суть:** Управление судном при сильном боковом ветре и волнах. Ручное управление слишком медленное; ученики настраивают политику нейросети (Policy Network).
- **Награда (Reward Function Editor):**
  $$\mathcal{R}_t = w_1 \cdot \text{distance\_to\_target} - w_2 \cdot \text{angular\_error}^2 - w_3 \cdot \text{energy\_consumption} + \mathcal{R}_{\text{bonus}}$$
- **Мультиплеер:** Соревнование на скорость и стабильность прохождения трассы между командами робототехников и судомоделистов.

### Режим 3: «Тактический Аэроклуб: Кооперативное LLM-пилотирование»
- **Суть:** Группа из 3–4 учащихся отправляет поисковый отряд дронов на гору Ахун для ликвидации условного возгорания или поиска альпинистов.
- **Интеграция с Gemini API:**
  - Ученик вводит сложную естественную команду: *«Байт-Лидер, отправь дрон №2 обследовать северное ущелье с тепловизором, а дрон №3 пусть зависнет над метеостанцией и передает скорость ветра»*.
  - Модель разбирает команду через Function Calling и отдает структурированные команды 3D-агентам:
    `executeFlightPlan(droneId: 2, waypoint: [120, 45, -80], sensor: 'thermal')`.

---

## 4. Сетевой Протокол и Мультиплеер (Multiplayer Protocol)

### 4.1. Принципы реального времени (Согласно стандартам)
- **Строгий Authoritative Server:** Физика судов, коллизии с берегом и захват целей рассчитываются на сервере. Клиент отправляет только управляющие сигналы (Input: тяга, угол руля, активация сенсоров).
- **Client-Side Prediction:** Локальный клиент не ждет пинга и применяет ускорение немедленно, корректируя положение при получении авторитетного снапшота (Reconciliation).
- **LERP / Entity Interpolation:** Позиции других игроков интерполируются с буфером в 100 мс для безупречной плавности даже при колебаниях пинга.

### 4.2. Формат Сетевых Пакетов (WebSocket Protocol Specification)

#### Пакет входа в лобби (Client → Server)
```json
{
  "type": "C2S_JOIN_LOBBY",
  "studentId": "sut-student-02",
  "token": "sut2026_02",
  "vesselType": "autonomous_catamaran",
  "customization": {
    "themeId": "theme-sochi-riviera",
    "byteSkinId": "skin-aquanaut"
  }
}
```

#### Авторитетный снапшот мира (Server → Client, 20 раз в сек)
```json
{
  "type": "S2C_WORLD_SNAPSHOT",
  "tick": 48201,
  "serverTimestamp": 1791402390123,
  "entities": [
    {
      "id": "sut-student-02",
      "position": [14.25, 0.42, -58.10],
      "quaternion": [0.0, 0.7071, 0.0, 0.7071],
      "velocity": [3.2, 0.0, 1.1],
      "rudderAngle": -0.15,
      "thrust": 0.85,
      "sensors": {
        "sonarDist": 12.4,
        "compassHeading": 90.0,
        "waveTilt": 0.04
      },
      "aiState": {
        "activeModel": "RL_PPO_V2",
        "decisionConfidence": 0.94,
        "targetWaypoint": [50.0, 0.0, -100.0]
      }
    }
  ],
  "environmentalForces": {
    "windVector": [2.5, 0.0, -1.0],
    "waveCurrent": 0.6
  }
}
```

#### Пакет ввода управления / ИИ-команды (Client → Server)
```json
{
  "type": "C2S_PLAYER_INPUT",
  "tick": 48202,
  "controls": {
    "thrust": 0.85,
    "rudder": -0.15,
    "aiOverride": true,
    "rawLogits": [0.12, 0.88, -0.05]
  }
}
```

---

## 5. Технологический Стек

| Компонент | Технология | Обоснование |
|---|---|---|
| **3D Rendering** | Three.js + @react-three/fiber | Высочайшая производительность в браузере, нулевой оверхед, WebGL/WebGPU |
| **Физический движок** | @dimforge/rapier3d-compat (WASM) | Детерминированная физика на WASM, работает одинаково на клиенте и Node.js |
| **Сетевой транспорт** | WebSockets (`ws` на Node.js) | Сверхнизкая задержка (<30ms), полный контроль над сериализацией |
| **AI Integration** | @google/genai SDK (Gemini 2.5 Flash / Pro) | Мультимодальный анализ скриншотов с 3D-камер, быстрый Function Calling |
| **UI & Оверлей** | React 19 + Tailwind CSS | Высокая скорость рендеринга данных телеметрии без лагов 3D-канваса |
| **Синтез аудио** | Web Audio API + Синтезатор звука Байта | Процедурный генератор шума волн, моторов и бип-сигналов микроконтроллера |

---

## 6. Пошаговый План Реализации (Sprint Roadmap)

### Спринт 1: Базовое 3D-ядро и физика Сочинского полигона
1. Создание 3D-сцены акватории Сочи:
   - Шейдер Черного моря (Gerstner Waves с динамической нормалью).
   - Низкополигональные модели порта, береговой линии, маяка и спасательных буев.
2. Интеграция физики Rapier:
   - Модель плавучести (Archimedes buoyancy force расчет по точкам корпуса).
   - Физические коллайдеры для катамарана СЮТ и подводного робота.
3. Камера от 3-го лица и переключение на «бортовую камеру робота» (First-Person Sensor Cam).

### Спринт 2: Мультиплеерный сервер и синхронизация
1. Разработка авторитетного сервера на Node.js (`server/gameServer.ts`).
2. Реализация комнаты лобби на 15 учащихся СЮТ с разделением по цветам направлений.
3. Внедрение Client-Side Prediction и интерполятора LERP с компенсацией джиттера.
4. Разработка панели администратора для преподавателя (мастер-токен `artdyshfj7289djsbc782q`):
   - Возможность менять погоду, запускать шторм, расставлять новые буи в реальном времени.

### Спринт 3: Интерактивная лаборатория нейросетей (Google Playground Integration)
1. **Стенд визуализации сенсоров:**
   - Рейкастинг лидара (Lidar Raycasting) с отрисовкой 360-градусного облака точек.
   - Сонарный радар с тепловой картой эхо-сигнала.
2. **Среда обучения с подкреплением (RL Workshop):**
   - Интерактивный редактор весов перцептрона прямо на экране.
   - График сходимости ошибки в реальном времени (Loss Curve / Reward Growth).
3. **Gemini LLM Co-Pilot:**
   - Передача снимка с бортовой камеры в Gemini 2.5 Flash для анализа навигационной обстановки: *«Вижу каменистый риф по левому борту на дистанции 15 метров, рекомендую руль вправо 20 градусов»*.

### Спринт 4: Геймификация, Достижения и Квалификация СЮТ
1. Подключение существующей системы наград и кастомизации:
   - Разблокировка 3D-скинов кораблей и антенн робота Байта за бейджи («Повелитель кода», «Черноморский исследователь»).
2. Запись заездов (Replay System) для разбора ошибок на занятиях кружка.
3. Генерация финального протокола миссии с печатью диплома юного инженера-оператора ИИ.

---

## 7. Эталонный Код Архитектуры

### 7.1. Авторитетный расчет физики судна на сервере (TypeScript / Rapier)
```typescript
// server/physics/VesselController.ts
import RAPIER from '@dimforge/rapier3d-compat';

export interface VesselInput {
  thrust: number;      // -1.0 .. 1.0
  rudderAngle: number; // -0.5 .. 0.5 рад
}

export class VesselPhysicsEntity {
  public rigidBody: RAPIER.RigidBody;
  private maxForce: number = 250.0;
  private turnTorque: number = 65.0;

  constructor(world: RAPIER.World, initialPos: { x: number; y: number; z: number }) {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(initialPos.x, initialPos.y, initialPos.z)
      .setLinearDamping(0.8)
      .setAngularDamping(1.5);
    this.rigidBody = world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(1.2, 0.4, 2.5)
      .setDensity(0.6); // Обеспечивает положительную плавучесть
    world.createCollider(colliderDesc, this.rigidBody);
  }

  public update(input: VesselInput, waterHeight: number, dt: number): void {
    const pos = this.rigidBody.translation();
    const rot = this.rigidBody.rotation();

    // Сила Архимеда (Buoyancy)
    const submersion = Math.max(0, waterHeight - pos.y);
    if (submersion > 0) {
      const buoyancyForce = submersion * 9.81 * 400.0;
      this.rigidBody.applyImpulse({ x: 0, y: buoyancyForce * dt, z: 0 }, true);
    }

    // Вектор тяги мотора с учетом поворота руля
    const forwardVector = this.getForwardVector(rot);
    const thrustMagnitude = input.thrust * this.maxForce;

    this.rigidBody.applyImpulse({
      x: forwardVector.x * thrustMagnitude * dt,
      y: 0,
      z: forwardVector.z * thrustMagnitude * dt,
    }, true);

    // Вращающий момент рулевого пера
    const torque = -input.rudderAngle * this.turnTorque * input.thrust;
    this.rigidBody.applyTorqueImpulse({ x: 0, y: torque * dt, z: 0 }, true);
  }

  private getForwardVector(q: RAPIER.Rotation): { x: number; y: number; z: number } {
    return {
      x: 2 * (q.x * q.z + q.w * q.y),
      y: 0,
      z: 1 - 2 * (q.x * q.x + q.y * q.y),
    };
  }
}
```

### 7.2. Модуль интеграции с Gemini Multi-Modal в 3D-игре
```typescript
// src/ai/GeminiVisionNavigator.ts
import { GoogleGenAI } from '@google/genai';

export interface NavigationDecision {
  action: 'maintain_course' | 'turn_port' | 'turn_starboard' | 'emergency_stop';
  suggestedRudderAngle: number;
  detectedHazards: string[];
  rationaleRu: string;
}

export async function analyze3DViewportWithGemini(
  canvasElement: HTMLCanvasElement,
  telemetry: { speedKnots: number; sonarRangeMeters: number; compassHeading: number }
): Promise<NavigationDecision> {
  const ai = new GoogleGenAI();
  const base64Image = canvasElement.toDataURL('image/jpeg', 0.85).split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Ты — бортовой нейросетевой навигатор робота Байта на Черноморском полигоне СЮТ Сочи.
Телеметрия: Скорость ${telemetry.speedKnots} узлов, сонар: ${telemetry.sonarRangeMeters}м, курс: ${telemetry.compassHeading}°.
Оцени визуальную обстановку (скалы, буи, другие суда) и верни JSON со структурой:
{
  "action": "maintain_course" | "turn_port" | "turn_starboard" | "emergency_stop",
  "suggestedRudderAngle": число от -0.5 до 0.5,
  "detectedHazards": ["список объектов на русском"],
  "rationaleRu": "краткое инженерное объяснение решения"
}`
          }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    }
  });

  return JSON.parse(response.text || '{}');
}
```

---

## 8. Критерии Успешности (Definition of Done)

1. **Производительность:** Стабильные 60 FPS на средних ноутбуках учащихся при 15 одновременных кораблях на экране.
2. **Сетевой отклик:** Задержка синхронизации позиций < 45 мс в локальной сети СЮТ Сочи или через облачный сервер.
3. **Обучающий эффект:** Ученик 5–9 классов за 45 минут урока осваивает концепцию обратной связи (Feedback Loop), функцию ошибки и методы компьютерного зрения на практике.
4. **Интеграция:** Полная совместимость с базой профилей 15 учащихся СЮТ Сочи и единым токеном наставника.
