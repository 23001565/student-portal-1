const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Lưu file tạm
module.exports = upload;