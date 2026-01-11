require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const chatRoutes = require('./routes/chat'); // Gom import lên đầu cho gọn

const app = express();
// --- 1. CẤU HÌNH CORS (QUAN TRỌNG KHI DEPLOY) ---
// Cho phép Frontend (Vercel) gọi API
const allowedOrigins = [
  'http://localhost:5173', // Cho phép chạy local
  'https://student-portal-1-xruk.vercel.app',
  process.env.FRONTEND_URL // Link Vercel của bạn (sẽ cài trong Environment Variables trên Render)
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như Postman, Mobile App) hoặc nằm trong whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Không được phép bởi CORS'));
    }
  },
  credentials: true // Nếu sau này bạn dùng Cookies/Session
}));

app.use(express.json());

// --- 2. ROUTES API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/registration', studentRoutes); 
app.use('/api/student', studentRoutes);      
app.use('/api/chat', chatRoutes);

// --- 3. HEALTH CHECK ROUTE (BẮT BUỘC CHO RENDER) ---
// Để Render biết server đã khởi động thành công
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Student Portal API đang chạy ổn định!',
    timestamp: new Date()
  });
});

// Log kiểm tra Key (chỉ lấy 5 ký tự đầu để bảo mật)
console.log('GROQ KEY Status:', process.env.GROQ_API_KEY ? 'Loaded' : 'Missing');

// --- 4. GLOBAL ERROR HANDLER ---
// Bắt mọi lỗi không mong muốn để server không bị crash
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Lỗi Server nội bộ!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));