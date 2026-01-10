// Vercel serverless function: POST /api/chat/ask-gemini
const fetch = global.fetch || require('node-fetch');

module.exports = async function (req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
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
};
