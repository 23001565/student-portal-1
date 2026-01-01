const express = require('express');
const router = express.Router();
// const fetch = require('node-fetch');

router.post('/ask-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.json({ reply: 'Bạn chưa nhập câu hỏi' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    console.log('GROQ RESPONSE:', data);

    const reply = data?.choices?.[0]?.message?.content;
    res.json({ reply: reply || 'AI không trả lời được' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'AI bị lỗi' });
  }
});

module.exports = router;
