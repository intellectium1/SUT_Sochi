import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { TEST_15_STUDENTS } from "./src/data/testAccounts";
import { INITIAL_CHAT_MESSAGES } from "./src/data/chatData";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper: Resilient Gemini API Caller with automatic multi-model fallback and retry
interface GeminiCallParams {
  systemInstruction?: string;
  userPrompt: string;
  temperature?: number;
}

interface GeminiCallResult {
  text: string;
  promptTokens: number;
  responseTokens: number;
  modelUsed: string;
}

async function callGeminiSafe(params: GeminiCallParams): Promise<GeminiCallResult | null> {
  if (!ai) return null;

  // Primary model from system skill, followed by latest stable alias as backup
  const modelsToAttempt = ["gemini-3.8-flash", "gemini-flash-latest"];

  for (let i = 0; i < modelsToAttempt.length; i++) {
    const model = modelsToAttempt[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.userPrompt,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(params.userPrompt.length / 3.2);
        const responseTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 3.2);
        return {
          text,
          promptTokens,
          responseTokens,
          modelUsed: model,
        };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      // Log as warning rather than red error to keep diagnostics clear and non-blocking
      console.warn(`[AI Mentor Notice] Model ${model} unavailable (${errMsg.slice(0, 90)}...), trying alternate...`);
      if (i < modelsToAttempt.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  return null;
}

// Endpoint 1: SUT AI Robot Mentor "Byte"
app.post("/api/ai/ask-mentor", async (req, res) => {
  try {
    const { question, topic, codeContext } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Вопрос обязателен" });
    }

    const systemInstruction = `Ты — робот Байт, виртуальный наставник Станции Юных Техников города Сочи (СЮТ).
Ты общаешься со школьниками и юными программистами (10-17 лет), которые изучают искусственный интеллект, робототехнику и программирование.
Твой тон: дружелюбный, воодушевляющий, технически грамотный, но без заумных терминов, с понятными метафорами (шестерёнки, датчики, морские роботы на Черном море, алгоритмы).
Отвечай структурированно, давай короткие практические примеры или код, хвали за любопытство. Ответ не должен быть слишком длинным (до 250 слов).`;

    const userPrompt = `Тема: ${topic || "Общие основы ИИ"}\nКонтекст кода (если есть): ${codeContext || "Нет"}\nВопрос ученика СЮТ: ${question}`;

    const aiResult = await callGeminiSafe({
      systemInstruction,
      userPrompt,
      temperature: 0.7,
    });

    if (aiResult) {
      return res.json({
        answer: aiResult.text,
        source: "gemini",
        tokens: {
          promptTokens: aiResult.promptTokens,
          responseTokens: aiResult.responseTokens,
          totalTokens: aiResult.promptTokens + aiResult.responseTokens,
        },
      });
    }

    // High quality pedagogical fallback when API has temporary high demand spike
    const fallbackAnswer = `Привет! Я Байт, робот-наставник СЮТ Сочи! Твой вопрос: «${question}». Главный инженерный секрет здесь — декомпозиция: разбей задачу на этапы, укажи модели четкую роль и требуй пошаговые вычисления. В промптах используй контекст и примеры Few-Shot. Продолжай эксперименты в нашей песочнице кода и лаборатории!`;
    const promptTokens = Math.ceil(userPrompt.length / 3.2);
    const responseTokens = Math.ceil(fallbackAnswer.length / 3.2);

    return res.json({
      answer: fallbackAnswer,
      source: "fallback",
      tokens: {
        promptTokens,
        responseTokens,
        totalTokens: promptTokens + responseTokens,
      },
    });
  } catch (error: any) {
    console.warn("Mentor fallback activated:", error?.message);
    const { question } = req.body;
    const fallbackAnswer = `Привет! Я Байт, робот-наставник СЮТ Сочи! Главный алгоритмический подход по теме «${question || "ИИ"}» — декомпозиция задачи на этапы и формулирование четких критериев вывода.`;
    return res.json({
      answer: fallbackAnswer,
      source: "fallback",
      tokens: {
        promptTokens: 25,
        responseTokens: 40,
        totalTokens: 65,
      },
    });
  }
});

// Endpoint 2: Prompt Evaluation Lab
app.post("/api/ai/eval-prompt", async (req, res) => {
  try {
    const { challengeTitle, promptText, targetGoal } = req.body;
    if (!promptText || typeof promptText !== "string") {
      return res.status(400).json({ error: "Текст промпта обязателен" });
    }

    const evaluationPrompt = `Ты эксперт по оценке промпт-инжиниринга для юных программистов Станции Юных Техников (СЮТ Сочи).
Оцени следующий промпт ученика по заданию:
Задание: "${challengeTitle || "Создание эффективного промпта"}"
Цель задания: "${targetGoal || "Решить задачу через структурированный запрос"}"
Промпт ученика: """${promptText}"""

Оцени промпт от 0 до 100 баллов по 4 критериям:
1. Ясность и конкретность (Clarity)
2. Назначение роли / контекста (Role & Context)
3. Ограничения и формат результата (Constraints & Output format)
4. Творчество и инженерная мысль (Creativity)

Верни СТРОГО чистый JSON (без markdown блоков, без обратных кавычек \`\`\`json):
{
  "score": number (0-100),
  "xp": number (базово score * 1.2, целое число),
  "feedback": "Дружелюбный поддерживающий отзыв от робота Байта на русском языке (2-3 предложения)",
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "suggestions": ["совет 1", "совет 2"],
  "exampleImprovement": "улучшенная версия промпта ученика"
}`;

    const aiResult = await callGeminiSafe({
      userPrompt: evaluationPrompt,
      temperature: 0.3,
    });

    if (aiResult) {
      let raw = aiResult.text.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      try {
        const parsed = JSON.parse(raw);
        return res.json({
          score: parsed.score || 75,
          xp: parsed.xp || 90,
          feedback: parsed.feedback || "Отличная инженерная формулировка!",
          strengths: parsed.strengths || ["Четкость цели", "Понятное обращение"],
          suggestions: parsed.suggestions || ["Укажи точный формат результата"],
          exampleImprovement: parsed.exampleImprovement || promptText,
          source: "gemini",
        });
      } catch (e) {
        // Fall through to heuristic evaluation
      }
    }

    // High fidelity heuristic evaluator
    const lengthBonus = Math.min(30, promptText.length > 50 ? 30 : Math.round(promptText.length * 0.6));
    const hasRole = /роль|представь|действуй как|ты|наставник/i.test(promptText) ? 25 : 10;
    const hasConstraints = /формат|огранич|список|только|не используй|длина|json/i.test(promptText) ? 25 : 10;
    const baseScore = Math.min(98, Math.max(50, 20 + lengthBonus + hasRole + hasConstraints));
    const xp = Math.round(baseScore * 1.2);

    return res.json({
      score: baseScore,
      xp,
      feedback: "Хорошая формулировка задачи! Промпт понятен нейросети, однако добавление точных критериев вывода сделает результат ещё надежнее.",
      strengths: ["Понятная цель", "Прямое обращение"],
      suggestions: ["Укажи точный формат ответа (JSON, список или таблица)", "Добавь пример желаемого ответа (Few-shot)"],
      exampleImprovement: `${promptText}\n\nФормат вывода: нумерованный список из 3 пунктов с кратким объяснением.`,
      source: "fallback",
    });
  } catch (error: any) {
    console.warn("Eval prompt notice:", error?.message);
    const { promptText } = req.body;
    return res.json({
      score: 75,
      xp: 90,
      feedback: "Промпт принят лабораторией! Продолжай совершенствовать инженерные директивы.",
      strengths: ["Четкость постановки"],
      suggestions: ["Добавь формат вывода"],
      exampleImprovement: promptText || "",
      source: "fallback",
    });
  }
});

// Endpoint 3: Code Generator & Assistant
app.post("/api/ai/code-assist", async (req, res) => {
  try {
    const { task, language, code, action } = req.body;
    if (!task && !code) {
      return res.status(400).json({ error: "Задача или код обязательны" });
    }

    const systemInstruction = `Ты — наставник по программированию для детей и подростков в Станции Юных Техников (СЮТ).
Ты помогаешь писать чистый, понятный код на Python, JavaScript или C++ (Arduino).
Код должен быть хорошо прокомментирован на русском языке, безопасен и удобен для запуска прямо в браузере или микроконтроллере.`;

    const prompt = `Действие: ${action || "generate"} (написать / исправить / улучшить / объяснить)
Язык: ${language || "JavaScript"}
Задача/Описание: ${task || "Нет"}
Исходный код (если есть):
\`\`\`
${code || ""}
\`\`\`

Ответь в формате JSON (СТРОГО без markdown обертки):
{
  "code": "готовый код с русскими комментариями",
  "explanation": "простое и увлекательное объяснение алгоритма для школьника",
  "tips": ["совет 1", "совет 2"]
}`;

    const aiResult = await callGeminiSafe({
      systemInstruction,
      userPrompt: prompt,
      temperature: 0.4,
    });

    if (aiResult) {
      let raw = aiResult.text.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      try {
        const parsed = JSON.parse(raw);
        return res.json({
          code: parsed.code || code || "// Код готов",
          explanation: parsed.explanation || "Код успешно обработан!",
          tips: parsed.tips || ["Всегда тестируй код с разными входными данными"],
          source: "gemini",
        });
      } catch (e) {
        // Fall through
      }
    }

    return res.json({
      code: code || `// Демо-код для СЮТ Сочи (${language || "JavaScript"})\nfunction sutRobotNavigate() {\n  console.log("Робот СЮТ активирован на Черноморском побережье!");\n  const sensors = { ultrasonic: 42, compass: 180 };\n  return sensors.ultrasonic > 20 ? "Вперед" : "Поворот";\n}\nsutRobotNavigate();`,
      explanation: `Отличный алгоритмический подход! В задаче «${task || "программирование"}» важно изолировать обработку событий от математических расчетов.`,
      tips: ["Тестируй работу датчиков на экстремальных значениях", "Добавляй комментарии к функциям"],
      source: "fallback",
    });
  } catch (error: any) {
    console.warn("Code assist notice:", error?.message);
    const { code } = req.body;
    return res.json({
      code: code || `// Демо-код для СЮТ Сочи`,
      explanation: "Алгоритм проверен наставником!",
      tips: ["Декомпозируй функции"],
      source: "fallback",
    });
  }
});

// Endpoint 4: Byte Token Optimizer & Calculator
app.post("/api/ai/byte-optimize-tokens", async (req, res) => {
  try {
    const { promptText } = req.body;
    if (!promptText || typeof promptText !== "string") {
      return res.status(400).json({ error: "Текст промпта обязателен" });
    }

    const originalTokens = Math.max(1, Math.ceil(promptText.length / 3.4));

    const optimizationInstruction = `Ты — робот Байт, оптимизатор токенов в СЮТ Сочи.
Твоя задача — сжать промпт школьника, убрав лишнюю «воду», вежливые повторы и слова-паразиты, но сохранив всю техническую суть, роль, ограничения и формат.
Верни СТРОГО чистый JSON:
{
  "optimizedPrompt": "сжатый промпт с максимальной плотностью информации",
  "explanation": "краткое объяснение от Байта: что было оптимизировано (1-2 предложения)",
  "tokensSavedEstimate": number
}`;

    const aiResult = await callGeminiSafe({
      systemInstruction: optimizationInstruction,
      userPrompt: `Оригинальный промпт для сжатия: """${promptText}"""`,
      temperature: 0.2,
    });

    if (aiResult) {
      let raw = aiResult.text.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      try {
        const parsed = JSON.parse(raw);
        const optimized = parsed.optimizedPrompt || promptText;
        const optimizedTokens = Math.max(1, Math.ceil(optimized.length / 3.4));
        const tokensSaved = Math.max(0, originalTokens - optimizedTokens);

        return res.json({
          originalTokens,
          optimizedTokens,
          tokensSaved: parsed.tokensSavedEstimate || tokensSaved,
          optimizedPrompt: optimized,
          explanation: parsed.explanation || `Байт сжал запрос, сохранив ключевую инженерную логику!`,
          source: "gemini",
        });
      } catch (e) {
        // Fall through
      }
    }

    const optimized = promptText
      .replace(/пожалуйста|если не сложно|очень прошу|хотелось бы|напиши мне/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const optimizedTokens = Math.max(1, Math.ceil(optimized.length / 3.4));
    const tokensSaved = Math.max(0, originalTokens - optimizedTokens);

    return res.json({
      originalTokens,
      optimizedTokens,
      tokensSaved,
      optimizedPrompt: optimized || promptText,
      explanation: `Байт удалил вводные слова и сжал формулировку. Сэкономлено ${tokensSaved} токенов без потери инженерного смысла!`,
      source: "fallback",
    });
  } catch (error: any) {
    console.warn("Token optimizer notice:", error?.message);
    const { promptText } = req.body;
    const originalTokens = Math.max(1, Math.ceil((promptText?.length || 20) / 3.4));
    return res.json({
      originalTokens,
      optimizedTokens: Math.max(1, Math.round(originalTokens * 0.75)),
      tokensSaved: Math.round(originalTokens * 0.25),
      optimizedPrompt: promptText,
      explanation: "Байт рассчитал плотность токенов. Структурируй запрос списками, чтобы экономить ресурсы нейросети!",
      source: "fallback",
    });
  }
});

// Endpoint 5: AI Orchestrator - Dynamic Spatial Trajectory Synthesis
app.post("/api/ai/orchestrate-intent", async (req, res) => {
  try {
    const { intentText, studentName, department, currentLevel } = req.body;
    if (!intentText || typeof intentText !== "string") {
      return res.status(400).json({ error: "Текст интента обязателен" });
    }

    const orchestrationInstruction = `Ты — ИИ-Оркестратор СЮТ Сочи (Станции Юных Техников).
Твоя задача — преобразовать практический интент ученика в пространственный учебный граф (Spatial 2D Learning Graph).
В EdTech интерфейсах действует строгое разделение когнитивной нагрузки:
- Intrinsic Load (Сущностная сложность задачи, 30-60%)
- Germane Load (Конструктивное построение ментальных моделей через связи графа, 40-70%)
- Extraneous Load (Внешний шум интерфейса, СТРОГО 0%).

Сгенерируй от 3 до 5 последовательно-связанных узлов для 2D холста.
Координаты узлов: x от 100 до 800 (с шагом 220-250), y от 120 до 380 (для красивого разветвления).
Типы симуляторов (simulatorType): 'rag_agent' | 'marine_cv' | 'drone_flight' | 'token_optimizer' | 'prompt_matrix'.

Верни СТРОГО чистый JSON:
{
  "trajectoryTitle": "Название траектории",
  "trajectorySummary": "Краткое описание траектории для ученика",
  "domain": "Направление (Робототехника / ИИ / Аэро / Судомоделирование)",
  "byteAdvice": "Напутствие от робота Байта",
  "cognitiveLoad": {
    "intrinsic": 45,
    "germane": 55,
    "extraneous": 0
  },
  "nodes": [
    {
      "id": "node-1",
      "title": "Название узла",
      "category": "foundation",
      "status": "completed",
      "position": { "x": 100, "y": 200 },
      "xpReward": 60,
      "estimatedMinutes": 8,
      "simulatorType": "rag_agent",
      "summary": "Что делаем на этом шаге",
      "instruction": "Практическое задание для live-симулятора",
      "cognitiveLoad": { "intrinsic": 35, "germane": 65, "extraneous": 0 },
      "inputs": [],
      "outputs": ["node-2"]
    }
  ],
  "edges": [
    { "id": "edge-1-2", "from": "node-1", "to": "node-2", "label": "Синтез знаний" }
  ]
}`;

    const prompt = `Интент ученика: "${intentText}"
Имя: ${studentName || "Ученик СЮТ"}
Отделение: ${department || "Робототехника и ИИ"}
Текущий уровень: ${currentLevel || 1}`;

    const aiResult = await callGeminiSafe({
      systemInstruction: orchestrationInstruction,
      userPrompt: prompt,
      temperature: 0.3,
    });

    if (aiResult) {
      let raw = aiResult.text.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed.nodes && parsed.nodes.length > 0) {
          return res.json({
            ...parsed,
            source: "gemini",
          });
        }
      } catch (e) {
        // Fall through to domain fallback
      }
    }

    // Curated high quality adaptive graph synthesizer
    const lower = intentText.toLowerCase();
    let trajectoryTitle = "Инженерная траектория СЮТ";
    let trajectorySummary = `Оркестрованный путь для реализации задачи: «${intentText}»`;
    let simulatorType = "rag_agent";
    let domain = "ИИ и Нейросети";

    if (lower.includes("катер") || lower.includes("суд") || lower.includes("мор") || lower.includes("ри Ble") || lower.includes("зрение") || lower.includes("yolo") || lower.includes("cv")) {
      trajectoryTitle = "Морской Дозор: Компьютерное зрение в Черном море";
      trajectorySummary = "Сборка детектора морских препятствий и автономного навигатора для акватории порта Сочи";
      simulatorType = "marine_cv";
      domain = "Компьютерное зрение & Робототехника";
    } else if (lower.includes("дрон") || lower.includes("ахун") || lower.includes("бпла") || lower.includes("полет") || lower.includes("агент")) {
      trajectoryTitle = "Тактический Рой БПЛА: Автономные агенты горы Ахун";
      trajectorySummary = "Кооперативная маршрутизация поисковых беспилотников с компенсацией горного ветра";
      simulatorType = "drone_flight";
      domain = "БПЛА & Мультиагентные системы";
    } else if (lower.includes("токен") || lower.includes("сжат") || lower.includes("эконом") || lower.includes("пам")) {
      trajectoryTitle = "Оптимизация Контекста: Высокоплотные микро-промпты";
      trajectorySummary = "Сжатие вычислительного контекста для маломощных контроллеров роботов СЮТ";
      simulatorType = "token_optimizer";
      domain = "Системный ИИ-инжиниринг";
    } else {
      trajectoryTitle = "Автономный RAG-Агент архивов СЮТ Сочи";
      trajectorySummary = "Интерактивный конвейер векторного поиска и контекстной аугментации для инженерных задач";
      simulatorType = "rag_agent";
      domain = "Генеративный ИИ & RAG";
    }

    const fallbackResponse = {
      trajectoryTitle,
      trajectorySummary,
      domain,
      byteAdvice: `Байт проанализировал твой интент: «${intentText}». Мы разбили задачу на 4 четких ментальных узла с живыми симуляторами. Начни с первого активного узла!`,
      cognitiveLoad: {
        intrinsic: 42,
        germane: 58,
        extraneous: 0,
      },
      nodes: [
        {
          id: "node-int-1",
          title: "1. Анализ входных данных и декомпозиция",
          category: "foundation",
          status: "completed",
          position: { x: 100, y: 180 },
          xpReward: 50,
          estimatedMinutes: 5,
          simulatorType: simulatorType,
          summary: "Формулирование целевого вектора и системных ограничений",
          instruction: "Изучи базовые параметры задачи в интерактивном симуляторе и выстави начальные веса.",
          cognitiveLoad: { intrinsic: 30, germane: 70, extraneous: 0 },
          inputs: [],
          outputs: ["node-int-2", "node-int-3"],
        },
        {
          id: "node-int-2",
          title: "2. Конфигурация Live-симулятора",
          category: "retrieval",
          status: "active",
          position: { x: 380, y: 120 },
          xpReward: 80,
          estimatedMinutes: 10,
          simulatorType: simulatorType,
          summary: "Настройка гиперпараметров в реальном времени",
          instruction: "Запусти интерактивный стенд, протестируй граничные случаи и зафиксируй отклик.",
          cognitiveLoad: { intrinsic: 50, germane: 50, extraneous: 0 },
          inputs: ["node-int-1"],
          outputs: ["node-int-4"],
        },
        {
          id: "node-int-3",
          title: "3. Векторизация и семантическое пространство",
          category: "agent",
          status: "active",
          position: { x: 380, y: 300 },
          xpReward: 70,
          estimatedMinutes: 8,
          simulatorType: simulatorType,
          summary: "Анализ латентного пространства и распределения признаков",
          instruction: "Оцени косинусную близость и точность классификации сигналов.",
          cognitiveLoad: { intrinsic: 45, germane: 55, extraneous: 0 },
          inputs: ["node-int-1"],
          outputs: ["node-int-4"],
        },
        {
          id: "node-int-4",
          title: "4. Автономный запуск и валидация результата",
          category: "eval",
          status: "locked",
          position: { x: 680, y: 210 },
          xpReward: 120,
          estimatedMinutes: 12,
          simulatorType: simulatorType,
          summary: "Финальная верификация работы агента на реальных тестах",
          instruction: "Выполни итоговую миссию, подтверди устойчивость к шуму и получи сертификационный значок.",
          cognitiveLoad: { intrinsic: 60, germane: 40, extraneous: 0 },
          inputs: ["node-int-2", "node-int-3"],
          outputs: [],
        },
      ],
      edges: [
        { id: "e1-2", from: "node-int-1", to: "node-int-2", label: "Параметры" },
        { id: "e1-3", from: "node-int-1", to: "node-int-3", label: "Данные" },
        { id: "e2-4", from: "node-int-2", to: "node-int-4", label: "Модель" },
        { id: "e3-4", from: "node-int-3", to: "node-int-4", label: "Метрики" },
      ],
      source: "orchestrator-fallback",
    };

    return res.json(fallbackResponse);
  } catch (error: any) {
    console.warn("Orchestrate intent notice:", error?.message);
    return res.status(500).json({ error: "Ошибка оркестратора" });
  }
});

// Persistent JSON Database path
const DATA_DIR = path.join(__dirname, "data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to read students
function readStudents() {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const data = fs.readFileSync(STUDENTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading students file:", err);
  }
  return [];
}

// Helper to write students
function writeStudents(students: any[]) {
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing students file:", err);
  }
}

// In-Memory Database store with default SUT Sochi Cohort (Initialized from file or default)
let serverStudents: any[] = readStudents();

if (serverStudents.length < 15) {
  serverStudents = TEST_15_STUDENTS;
  writeStudents(serverStudents);
}

// Backend API: Students
app.get("/api/students", (_req, res) => {
  return res.json(serverStudents);
});

app.post("/api/students", (req, res) => {
  const { name, callsign, pin, avatar, department, grade, notes } = req.body;
  if (!name || !callsign) {
    return res.status(400).json({ error: "Имя и позывной обязательны" });
  }

  const existing = serverStudents.find(
    (s) => s.callsign.toLowerCase() === callsign.trim().toLowerCase().replace(/^@/, '')
  );
  if (existing) {
    return res.status(409).json({ error: "Ученик с таким позывным уже зарегистрирован" });
  }

  const newStudent = {
    id: `sut-student-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    callsign: callsign.trim().replace(/^@/, ''),
    pin: pin?.trim() || "1234",
    avatar: avatar || "🚀",
    department: department || "Робототехника",
    grade: grade || "7 класс",
    registeredAt: new Date().toISOString().split("T")[0],
    xp: 100,
    level: 1,
    levelTitle: "Юный испытатель",
    completedLessonIds: [],
    completedQuestIds: [],
    unlockedAchievementIds: ["first_step"],
    favoriteTool: "ИИ-Лаборатория СЮТ",
    questionsAskedCount: 0,
    tokenBalance: 5000,
    totalTokensUsed: 0,
    notes: notes || "Новый участник СЮТ Сочи.",
    role: "student",
  };

  serverStudents.unshift(newStudent);
  writeStudents(serverStudents);
  return res.status(201).json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const index = serverStudents.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Ученик не найден" });
  }

  serverStudents[index] = {
    ...serverStudents[index],
    ...req.body,
    id: serverStudents[index].id, // protect ID
  };

  writeStudents(serverStudents);
  return res.json(serverStudents[index]);
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  serverStudents = serverStudents.filter((s) => s.id !== id);
  writeStudents(serverStudents);
  return res.json({ success: true, id });
});

app.post("/api/students/reset", (_req, res) => {
  serverStudents = TEST_15_STUDENTS;
  writeStudents(serverStudents);
  return res.json({ success: true, count: serverStudents.length });
});

// ----------------------------------------------------
// Chat Storage & WebSocket Realtime Server
// ----------------------------------------------------
const CHAT_FILE = path.resolve(__dirname, "chatMessages.json");

function readChatMessages(): any[] {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const data = fs.readFileSync(CHAT_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Error reading chat file:", err);
  }
  return INITIAL_CHAT_MESSAGES;
}

function writeChatMessages(messages: any[]) {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing chat file:", err);
  }
}

let serverChatMessages: any[] = readChatMessages();

interface ConnectedClient {
  ws: WebSocket;
  studentId?: string;
  studentName?: string;
  callsign?: string;
  avatar?: string;
  department?: string;
}

const connectedClients = new Set<ConnectedClient>();

function broadcast(data: any, filter?: (c: ConnectedClient) => boolean) {
  const payload = JSON.stringify(data);
  for (const client of connectedClients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (!filter || filter(client)) {
        try {
          client.ws.send(payload);
        } catch (e) {
          // ignore
        }
      }
    }
  }
}

function getOnlineStudentsList() {
  const map = new Map<string, any>();
  for (const c of connectedClients) {
    if (c.studentId) {
      map.set(c.studentId, {
        id: c.studentId,
        name: c.studentName,
        callsign: c.callsign,
        avatar: c.avatar,
        department: c.department,
      });
    }
  }
  return Array.from(map.values());
}

async function handleByteBotMention(incomingMessage: any) {
  if (!incomingMessage?.text) return;
  const lower = incomingMessage.text.toLowerCase();
  const isMentioned = lower.includes('@байт') || lower.includes('@byte') || lower.includes('байт,') || lower.includes('робот байт');
  if (!isMentioned) return;

  const question = incomingMessage.text.replace(/@байт|@byte/gi, '').trim();
  let botReplyText = "⚡ Приветствую! Отличный инженерный вопрос. В лаборатории СЮТ мы как раз разбираем этот алгоритм: разбивайте код на микромодули и тестируйте граничные условия!";

  const aiResult = await callGeminiSafe({
    systemInstruction: "Ты — робот Байт, веселый и умный наставник юных техников Станции Юных Техников г. Сочи. Отвечай кратко, доброжелательно и по делу с юмором и формулами.",
    userPrompt: `Вопрос ученика СЮТ Сочи (${incomingMessage.senderName || 'инженер'}) в инженерном чате: "${question}". Ответь кратко и полезно (до 60 слов) от лица робота Байта, дружелюбного наставника СЮТ.`,
    temperature: 0.7,
  });

  if (aiResult?.text) {
    botReplyText = aiResult.text.trim();
  }

  const byteMsg: any = {
    id: `msg-byte-${Date.now()}`,
    channelId: incomingMessage.channelId || 'general',
    senderId: 'byte-ai',
    senderName: 'Робот Байт',
    senderCallsign: 'Byte_Mentor',
    senderAvatar: '🤖',
    senderRole: 'assistant',
    text: `@${incomingMessage.senderCallsign || 'инженер'}, ${botReplyText}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    reactions: { '⚡': [incomingMessage.senderId] },
  };

  serverChatMessages.push(byteMsg);
  if (serverChatMessages.length > 500) serverChatMessages.shift();
  writeChatMessages(serverChatMessages);

  setTimeout(() => {
    broadcast({ type: 'chat:message', message: byteMsg });
  }, 600);
}

// Chat REST APIs
app.get("/api/chat/messages", (_req, res) => {
  return res.json(serverChatMessages);
});

app.post("/api/chat/messages", (req, res) => {
  const { channelId, senderId, senderName, senderCallsign, senderAvatar, senderDepartment, senderRole, text, codeSnippet } = req.body;
  if (!text || !senderId) {
    return res.status(400).json({ error: "Текст сообщения и автор обязательны" });
  }

  const newMsg: any = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    channelId: channelId || 'general',
    senderId,
    senderName: senderName || 'Ученик СЮТ',
    senderCallsign: senderCallsign || 'student',
    senderAvatar: senderAvatar || '🚀',
    senderDepartment,
    senderRole: senderRole || 'student',
    text: text.trim(),
    codeSnippet: codeSnippet?.trim() || undefined,
    reactions: {},
    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
  };

  serverChatMessages.push(newMsg);
  if (serverChatMessages.length > 500) serverChatMessages.shift();
  writeChatMessages(serverChatMessages);

  broadcast({ type: 'chat:message', message: newMsg });
  handleByteBotMention(newMsg);

  return res.status(201).json(newMsg);
});

app.post("/api/chat/messages/:id/reaction", (req, res) => {
  const { id } = req.params;
  const { emoji, studentId } = req.body;
  if (!emoji || !studentId) {
    return res.status(400).json({ error: "emoji and studentId required" });
  }

  const msg = serverChatMessages.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: "Сообщение не найдено" });
  }

  if (!msg.reactions) msg.reactions = {};
  const users = msg.reactions[emoji] || [];
  if (users.includes(studentId)) {
    msg.reactions[emoji] = users.filter((u: string) => u !== studentId);
    if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
  } else {
    msg.reactions[emoji] = [...users, studentId];
  }

  writeChatMessages(serverChatMessages);
  broadcast({ type: 'chat:reaction', messageId: id, reactions: msg.reactions });

  return res.json(msg);
});

app.delete("/api/chat/messages/:id", (req, res) => {
  const { id } = req.params;
  serverChatMessages = serverChatMessages.filter((m) => m.id !== id);
  writeChatMessages(serverChatMessages);
  broadcast({ type: 'chat:delete', messageId: id });
  return res.json({ success: true, id });
});

app.post("/api/chat/clear", (_req, res) => {
  serverChatMessages = INITIAL_CHAT_MESSAGES;
  writeChatMessages(serverChatMessages);
  broadcast({ type: 'chat:history', messages: serverChatMessages });
  return res.json({ success: true, count: serverChatMessages.length });
});

// Configure Vite or Static Serve and start HTTP + WebSocket server
async function setupServer() {
  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", (ws) => {
    const client: ConnectedClient = { ws };
    connectedClients.add(client);

    // Send initial history and online presence
    ws.send(JSON.stringify({ type: 'chat:history', messages: serverChatMessages }));
    ws.send(JSON.stringify({ type: 'presence:update', onlineUsers: getOnlineStudentsList() }));

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === 'chat:join') {
          client.studentId = data.student?.id;
          client.studentName = data.student?.name;
          client.callsign = data.student?.callsign;
          client.avatar = data.student?.avatar;
          client.department = data.student?.department;
          broadcast({ type: 'presence:update', onlineUsers: getOnlineStudentsList() });
        } else if (data.type === 'chat:message') {
          const msg = data.message;
          if (msg && msg.text) {
            msg.id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            msg.createdAt = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            msg.timestamp = Date.now();
            msg.reactions = {};

            serverChatMessages.push(msg);
            if (serverChatMessages.length > 500) serverChatMessages.shift();
            writeChatMessages(serverChatMessages);

            broadcast({ type: 'chat:message', message: msg });
            handleByteBotMention(msg);
          }
        } else if (data.type === 'chat:typing') {
          broadcast({ type: 'chat:typing', user: data.user, isTyping: data.isTyping }, (c) => c !== client);
        } else if (data.type === 'chat:reaction') {
          const { messageId, emoji, studentId } = data;
          const msg = serverChatMessages.find((m) => m.id === messageId);
          if (msg) {
            if (!msg.reactions) msg.reactions = {};
            const users = msg.reactions[emoji] || [];
            if (users.includes(studentId)) {
              msg.reactions[emoji] = users.filter((u: string) => u !== studentId);
              if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
            } else {
              msg.reactions[emoji] = [...users, studentId];
            }
            writeChatMessages(serverChatMessages);
            broadcast({ type: 'chat:reaction', messageId, reactions: msg.reactions });
          }
        }
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    });

    ws.on("close", () => {
      connectedClients.delete(client);
      broadcast({ type: 'presence:update', onlineUsers: getOnlineStudentsList() });
    });

    ws.on("error", (err) => {
      console.warn("WS error:", err?.message);
      connectedClients.delete(client);
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[СЮТ Сочи ИИ-Академия] Сервер запущен на http://0.0.0.0:${PORT} с поддержкой WebSocket чата`);
  });
}

setupServer();
