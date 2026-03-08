import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

const PROMPT_BASE = `Eres un experto en educación y micro-learning.

Tu tarea es analizar el siguiente contenido y transformarlo en una experiencia de aprendizaje tipo TikTok.

Debes devolver únicamente un JSON válido con esta estructura exacta:

{
 "meta": {
   "topic": "string",
   "totalSlides": number,
   "totalQuestions": number
 },
 "slides": [
   {
     "id": "slide_1",
     "type": "hook | concept | fact | question | answer | comparison | summary",
     "content": "string"
   }
 ],
 "quiz": [
   {
     "id": "q1",
     "question": "string",
     "options": [
       "string",
       "string",
       "string",
       "string"
     ],
     "correctAnswer": number,
     "explanation": "string"
   }
 ]
}

REGLAS IMPORTANTES:

1. Genera entre 8 y 15 slides.
2. Cada slide debe tener una sola idea.
3. El texto debe ser corto (máximo 20 palabras).
4. Alterna tipos de slides para que el contenido sea dinámico.
5. Genera entre 4 y 6 preguntas tipo test.
6. Cada pregunta debe tener 4 opciones.
7. correctAnswer debe ser el índice de la respuesta correcta (0-3).
8. Las preguntas deben basarse únicamente en el contenido de las slides.
9. No incluyas texto fuera del JSON.
10. No utilices markdown.

Contenido a analizar:

"""
{{TEXT}}
"""`;

app.post('/api/generate-slides', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = PROMPT_BASE.replace('{{TEXT}}', text);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Error generating slides:', error);
    res.status(500).json({ error: 'Failed to generate slides' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
