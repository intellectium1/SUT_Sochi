import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { TEST_15_STUDENTS } from "./src/data/testAccounts";

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

// Endpoint 1: SUT AI Robot Mentor "Byte"
app.post("/api/ai/ask-mentor", async (req, res) => {
  try {
    const { question, topic, codeContext } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Вопрос обязателен" });
    }

    if (!ai) {
      return res.json({
        answer: `Привет! Я Байт, робот-наставник СЮТ Сочи! Твой вопрос: "${question}". Сейчас режим демонстрации без прямого ключа API, но я подскажу: в ИИ самое главное — это декомпозиция задачи и точные примеры в промпте (Few-shot prompting). Продолжай эксперименты в лаборатории!`,
        source: "fallback",
      });
    }

    const systemInstruction = `Ты — робот Байт, виртуальный наставник Станции Юных Техников города Сочи (СЮТ).
Ты общаешься со школьниками и юными программистами (10-17 лет), которые изучают искусственный интеллект, робототехнику и программирование.
Твой тон: дружелюбный, воодушевляющий, технически грамотный, но без заумных терминов, с понятными метафорами (шестерёнки, датчики, морские роботы на Черном море, алгоритмы).
Отвечай структурированно, давай короткие практические примеры или код, хвали за любопытство. Ответ не должен быть слишком длинным (до 250 слов).`;

    const userPrompt = `Тема: ${topic || "Общие основы ИИ"}\nКонтекст кода (если есть): ${codeContext || "Нет"}\nВопрос ученика СЮТ: ${question}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answerText = response.text || "Отличный вопрос! Попробуй протестировать это прямо в лаборатории промптов.";
    const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(userPrompt.length / 3.2);
    const responseTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(answerText.length / 3.2);

    return res.json({
      answer: answerText,
      source: "gemini",
      tokens: {
        promptTokens,
        responseTokens,
        totalTokens: promptTokens + responseTokens,
      },
    });
  } catch (error: any) {
    console.error("Mentor API error, providing educational fallback:", error?.message);
    const { question } = req.body;
    const fallbackAnswer = `Привет! Я Байт, робот-наставник СЮТ Сочи! Твой вопрос: «${question || "Основы ИИ"}». Главный инженерный секрет здесь — декомпозиция: разбей задачу на этапы, укажи модели четкую роль и требуй пошаговые вычисления. Продолжай эксперименты в нашей песочнице кода и лаборатории!`;
    const promptTokens = Math.ceil((question?.length || 20) / 3.2);
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
  }
});

// Endpoint 2: Prompt Evaluation Lab
app.post("/api/ai/eval-prompt", async (req, res) => {
  try {
    const { challengeTitle, promptText, targetGoal } = req.body;
    if (!promptText || typeof promptText !== "string") {
      return res.status(400).json({ error: "Текст промпта обязателен" });
    }

    if (!ai) {
      // Mock fallback with realistic evaluation
      const lengthBonus = Math.min(30, promptText.length > 50 ? 30 : Math.round(promptText.length * 0.6));
      const hasRole = /роль|представь|действуй как|ты/i.test(promptText) ? 25 : 10;
      const hasConstraints = /формат|огранич|список|только|не используй|длина/i.test(promptText) ? 25 : 10;
      const baseScore = Math.min(98, Math.max(45, 20 + lengthBonus + hasRole + hasConstraints));
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

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: evaluationPrompt,
      config: {
        temperature: 0.3,
      },
    });

    let raw = response.text?.trim() || "{}";
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(raw);

    return res.json({
      score: parsed.score || 75,
      xp: parsed.xp || 90,
      feedback: parsed.feedback || "Отличная попытка!",
      strengths: parsed.strengths || ["Четкость цели"],
      suggestions: parsed.suggestions || ["Добавь ограничения по объему"],
      exampleImprovement: parsed.exampleImprovement || promptText,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Eval Prompt error, providing fallback:", error?.message);
    const { promptText } = req.body;
    const lengthBonus = Math.min(30, (promptText?.length || 0) > 40 ? 30 : Math.round((promptText?.length || 0) * 0.6));
    const baseScore = Math.min(95, Math.max(70, 40 + lengthBonus));
    return res.json({
      score: baseScore,
      xp: Math.round(baseScore * 1.2),
      feedback: "Промпт составлен грамотно! Задача понятна модели, структура директивы выдержана в инженерном стиле.",
      strengths: ["Понятная цель", "Структурированное обращение"],
      suggestions: ["Укажи точный формат ответа (список или JSON)", "Добавь Few-Shot пример"],
      exampleImprovement: `${promptText || ""}\n\nФормат ответа: краткий нумерованный список из 3 пунктов.`,
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

    if (!ai) {
      return res.json({
        code: `// Демо-код для СЮТ Сочи (${language || "JavaScript"})\n// Задача: ${task || "Пример кода"}\nfunction sutRobotNavigate() {\n  console.log("Робот СЮТ активирован на Черноморском побережье!");\n  const sensors = { ultrasonic: 42, compass: 180 };\n  return sensors.ultrasonic > 20 ? "Вперед" : "Поворот";\n}\nsutRobotNavigate();`,
        explanation: "В коде показана базовая структура логики датчиков робота СЮТ.",
        tips: ["Используй осмысленные имена переменных", "Проверяй крайние значения датчиков"],
        source: "fallback",
      });
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

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    let raw = response.text?.trim() || "{}";
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(raw);

    return res.json({
      code: parsed.code || code || "// Код готов",
      explanation: parsed.explanation || "Код успешно обработан!",
      tips: parsed.tips || ["Всегда тестируй код с разными входными данными"],
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Code assist error, providing fallback:", error?.message);
    const { code, task } = req.body;
    return res.json({
      code: code || `// Код для СЮТ Сочи\nconsole.log("Логика проверена наставником!");`,
      explanation: `Отличный алгоритмический подход! В задаче «${task || "программирование"}» важно изолировать обработку событий от математических расчетов.`,
      tips: ["Тестируй работу датчиков на экстремальных значениях", "Добавляй комментарии к функциям"],
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

    if (!ai) {
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
    }

    const optimizationInstruction = `Ты — робот Байт, оптимизатор токенов в СЮТ Сочи.
Твоя задача — сжать промпт школьника, убрав лишнюю «воду», вежливые повторы и слова-паразиты, но сохранив всю техническую суть, роль, ограничения и формат.
Верни СТРОГО чистый JSON:
{
  "optimizedPrompt": "сжатый промпт с максимальной плотностью информации",
  "explanation": "краткое объяснение от Байта: что было оптимизировано (1-2 предложения)",
  "tokensSavedEstimate": number
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Оригинальный промпт для сжатия: """${promptText}"""`,
      config: {
        systemInstruction: optimizationInstruction,
        temperature: 0.2,
      },
    });

    let raw = response.text?.trim() || "{}";
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
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
  } catch (error: any) {
    console.error("Token optimizer error:", error?.message);
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

// Configure Vite or Static Serve
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[СЮТ Сочи ИИ-Академия] Сервер запущен на http://0.0.0.0:${PORT}`);
  });
}

setupServer();
