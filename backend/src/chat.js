const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo AI với Key từ file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ask-gemini", async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(`Bạn là trợ lý hệ thống quản lý sinh viên. Hãy trả lời ngắn gọn: ${prompt}`);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("Lỗi Gemini:", error);
    res.status(500).json({ error: "AI đang bận rồi bà ơi!" });
  }
});

module.exports = router;
