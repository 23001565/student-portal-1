const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const csv = require('csv-parser');

// Upload Điểm (gradesApi.uploadGrades)
exports.uploadGrades = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Thiếu file' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // Logic xử lý DB ở đây (bạn tự implement thêm phần map dữ liệu nhé)
      console.log('Data from CSV:', results);
      fs.unlinkSync(req.file.path); // Xóa file tạm
      res.json({ message: 'Upload thành công' });
    });
};

// Lấy thông báo
exports.getAnnouncements = async (req, res) => {
  const data = await prisma.announcement.findMany({
    orderBy: { postedAt: 'desc' }
  });
  res.json(data);
};