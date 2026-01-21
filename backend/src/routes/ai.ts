// C:\ArenAI\ArenAI\backend\src\routes\ai.ts
import { checkGeminiConnection, generateContentWithGemini } from '../services/geminiService.js'; 
import { Router } from 'express';
import { ApiError } from '../middleware/errorHandler.js';
import { STUDENT_SYSTEM_PROMPT, PROFESSOR_SYSTEM_PROMPT, QUIZ_GENERATOR_PROMPT } from '../config/prompts.js';

const router = Router();

// Ruta de prueba: GET /ai/test-connection
router.get('/test-connection', async (req, res, next) => {
  try {
    const result = await checkGeminiConnection();
    res.json({
      status: "Success",
      message: "Conexión con Gemini (Vertex AI) establecida y funcionando.",
      testPromptResponse: result.trim(),
    });
  } catch (error) {
    console.error("Fallo la conexión con Vertex AI/Gemini:", error);
    next(new ApiError(500, `Fallo la conexión con la IA. Revise la ruta de la clave JSON o los permisos.`));
  }
});

// Ruta para el Chatbot: POST /ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    // 1. Recibimos más datos del body
    const { prompt, userData, context, agentConfig, history } = req.body;
    
    if (!prompt) {
      throw new ApiError(400, "El campo 'prompt' es requerido.");
    }

    // 2. Valores por defecto
    const name = userData?.name || "Estudiante";
    const level = context?.level || "Secundaria"; 
    const subject = context?.subject || "General";
    
    const learningStyle = context?.learningStyle || "Visual";
    const currentTopics = context?.currentTopics || "General";
    const language = context?.language || "Español";
    
    const agentName = agentConfig?.name || "Aren";
    const animalType = agentConfig?.type || "Capybara";

    // 3. Selección de Prompt Basada en Rol
    // HACEMOS ESTO MÁS ROBUSTO:
    const rawRole = userData?.role || "student";
    const userRole = String(rawRole).toLowerCase().trim();
    
    console.log(`[DEBUG] Rol recibido: "${rawRole}" -> Procesado: "${userRole}"`);

    let systemInstruction = "";

    if (userRole === "teacher" || userRole === "professor" || userRole === "admin" || userRole === "docente") {
       console.log("--> Usando Prompt de PROFESOR");
       systemInstruction = PROFESSOR_SYSTEM_PROMPT
        .replace('{NAME}', name)
        .replace(/{NAME}/g, name)
        .replace(/{LANGUAGE}/g, language);
    } else {
       console.log("--> Usando Prompt de ESTUDIANTE");
       systemInstruction = STUDENT_SYSTEM_PROMPT
        .replace('{AGENT_NAME}', agentName)
        .replace('{ANIMAL_TYPE}', animalType) 
        .replace(/{ANIMAL_TYPE}/g, animalType) 
        .replace('{NAME}', name)
        .replace(/{NAME}/g, name)
        .replace('{LEVEL}', level)
        .replace('{SUBJECT}', subject)
        .replace('{CURRENT_TOPICS}', currentTopics)
        .replace('{LEARNING_STYLE}', learningStyle)
        .replace(/{LANGUAGE}/g, language);
    }

    // 4. Llamamos al servicio con la instrucción
    const aiResponse = await generateContentWithGemini(prompt, systemInstruction, history);

    res.json({
      response: aiResponse
    });

  } catch (error) {
    console.error("Error en /ai/chat:", error);
    next(error);
  }
});

// Ruta para generar Quiz: POST /ai/generate-quiz
router.post('/generate-quiz', async (req, res, next) => {
  try {
    const { 
      subject, 
      level, 
      topics, 
      questionCount, 
      language,
      customPrompt 
    } = req.body;

    // Validation
    if (!subject || !topics || topics.length === 0) {
      throw new ApiError(400, "Subject and topics are required.");
    }

    // Build the prompt with replacements
    const topicsList = Array.isArray(topics) ? topics.join(", ") : topics;
    
    const quizPrompt = QUIZ_GENERATOR_PROMPT
      .replace(/{SUBJECT}/g, subject)
      .replace(/{LEVEL}/g, String(level || 5))
      .replace(/{TOPICS_LIST}/g, topicsList)
      .replace(/{QUESTION_COUNT}/g, String(questionCount || 5))
      .replace(/{LANGUAGE}/g, language || "Spanish")
      .replace(/{CUSTOM_PROMPT}/g, customPrompt || "None");

    console.log("[Quiz Generator] Generating quiz with prompt...");
    console.log(`  Subject: ${subject}, Level: ${level}, Topics: ${topicsList}`);
    console.log(`  Questions: ${questionCount}, Language: ${language}`);

    // Call Gemini API
    const aiResponse = await generateContentWithGemini(
      "Generate a quiz based on the following instructions:",
      quizPrompt
    );

    // Try to parse JSON from response
    let parsedQuiz;
    try {
      // Clean the response - remove markdown if present
      let cleanedResponse = aiResponse.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/```\s*$/, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/```\s*$/, "");
      }
      
      parsedQuiz = JSON.parse(cleanedResponse.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw response:", aiResponse);
      throw new ApiError(500, "AI returned invalid JSON. Please try again.");
    }

    // Validate the response structure
    if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
      throw new ApiError(500, "AI response missing questions array.");
    }

    console.log(`[Quiz Generator] Successfully generated ${parsedQuiz.questions.length} questions`);

    res.json({
      success: true,
      data: parsedQuiz
    });

  } catch (error) {
    console.error("Error en /ai/generate-quiz:", error);
    next(error);
  }
});

export const aiRouter = router;