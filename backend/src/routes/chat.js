const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ask-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.json({ reply: ' Bạn chưa nhập câu hỏi' });
    }

    const model = genAI.getGenerativeModel({
      model: 'models/gemini-1.5-flash'
    });

    const result = await model.generateContent(prompt);

    let reply = ' Gemini chưa trả lời được';

    if (
      result &&
      result.response &&
      result.response.candidates &&
      result.response.candidates.length > 0 &&
      result.response.candidates[0].content &&
      result.response.candidates[0].content.parts &&
      result.response.candidates[0].content.parts.length > 0
    ) {
      reply = result.response.candidates[0].content.parts
        .map(p => p.text)
        .join('');
    }

    res.json({ reply });

  } catch (error) {
    console.error('🔥 Gemini backend error:', error.message);
    res.json({
      reply: ' Gemini bị lỗi tạm thời, thử lại sau'
    });
  }
});

module.exports = router;
