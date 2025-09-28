// backend/routes/groq.cjs
const express = require('express');
const { Groq } = require('groq-sdk');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Endpoint: POST /api/ai/groq-chat
router.post('/groq-chat', async (req, res) => {
  const { prompt, model = 'llama3-70b-8192', system } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Prompt jest wymagany.' });
  }
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.7
    });
    res.json({ success: true, result: response.choices?.[0]?.message?.content || '' });
  } catch (error) {
    console.error('Błąd Groq API:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera Groq.', error: error.message });
  }
});

module.exports = router;
