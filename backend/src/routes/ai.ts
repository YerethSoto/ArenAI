// C:\ArenAI\ArenAI\backend\src\routes\ai.ts
import { checkGeminiConnection, generateContentWithGemini } from '../services/geminiService.js'; 
import { Router } from 'express';
import { ApiError } from '../middleware/errorHandler.js';
import { STUDENT_SYSTEM_PROMPT, PROFESSOR_SYSTEM_PROMPT } from '../config/prompts.js';

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

export const aiRouter = router;