// C:\ArenAI\ArenAI\backend\src\routes\ai.ts (temporalmente para la prueba)

// Importa la nueva función de prueba
import { checkGeminiConnection, generateContentWithGemini } from '../services/geminiService.js'; 
import { Router } from 'express';
import { ApiError } from '../middleware/errorHandler.js';
import { STUDENT_SYSTEM_PROMPT } from '../config/prompts.js'; // Importamos la plantilla

const router = Router();

// Ruta de prueba: GET /ai/test-connection
router.get('/test-connection', async (req, res, next) => {
  try {
    // Llama a la función de prueba
    const result = await checkGeminiConnection();

    res.json({
      status: "Success",
      message: "Conexión con Gemini (Vertex AI) establecida y funcionando.",
      testPromptResponse: result.trim(), // Gemini response
    });

  } catch (error) {
    // Si falla, el error será capturado aquí, indicando un problema
    console.error("Fallo la conexión con Vertex AI/Gemini:", error);
    next(new ApiError(500, `Fallo la conexión con la IA. Revise la ruta de la clave JSON o los permisos.`));
  }
});

// Ruta para el Chatbot: POST /ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    // 1. Recibimos más datos del body
    const { prompt, userData, context } = req.body;
    
    if (!prompt) {
      throw new ApiError(400, "El campo 'prompt' es requerido.");
    }

    // 2. Valores por defecto por si el frontend no envía algo
    const name = userData?.name || "Estudiante";
    const level = context?.level || "Secundaria"; // Ej: Primaria, Universidad
    const subject = context?.subject || "General";
    const performance = context?.performance || "Promedio"; // Ej: Bajo, Alto

    // 3. Rellenamos la plantilla
    let systemInstruction = STUDENT_SYSTEM_PROMPT
      .replace('{NAME}', name)
      .replace('{LEVEL}', level)
      .replace('{SUBJECT}', subject)
      .replace('{LEARNING_STYLE}', performance);

    // 4. Llamamos al servicio con la instrucción
    const aiResponse = await generateContentWithGemini(prompt, systemInstruction);

    res.json({
      response: aiResponse
    });

  } catch (error) {
    console.error("Error en /ai/chat:", error);
    next(error);
  }
});

export const aiRouter = router;