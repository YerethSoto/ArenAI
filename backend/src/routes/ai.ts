// C:\ArenAI\ArenAI\backend\src\routes\ai.ts (temporalmente para la prueba)

// Importa la nueva función de prueba
import { checkGeminiConnection } from '../services/geminiService.js'; 
import { Router } from 'express';
import { ApiError } from '../middleware/errorHandler.js';

const router = Router();

// Ruta de prueba: GET /ai/test-connection
router.get('/test-connection', async (req, res, next) => {
  try {
    // Llama a la función de prueba
    const result = await checkGeminiConnection();

    res.json({
      status: "Success",
      message: "Conexión con Gemini (Vertex AI) establecida y funcionando.",
      testPromptResponse: result.trim(), // Debería ser "París"
    });

  } catch (error) {
    // Si falla, el error será capturado aquí, indicando un problema
    console.error("Fallo la conexión con Vertex AI/Gemini:", error);
    next(new ApiError(500, `Fallo la conexión con la IA. Revise la ruta de la clave JSON o los permisos.`));
  }
});

export const aiRouter = router;