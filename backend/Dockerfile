# backend/Dockerfile

# Bước 1: Chọn môi trường Node.js nhẹ
FROM node:18-alpine
RUN apk add --no-cache openssl

# Bước 2: Tạo thư mục làm việc
WORKDIR /app

# Bước 3: Copy file định nghĩa thư viện trước (để tận dụng cache)
COPY package*.json ./
# Copy thư mục prisma để generate client
COPY prisma ./prisma/

# Bước 4: Cài đặt thư viện
RUN npm install

# Bước 5: Copy toàn bộ code còn lại
COPY . .

# Bước 6: Tạo Prisma Client (Bắt buộc)
RUN npx prisma generate

# Bước 7: Mở cổng 3000
EXPOSE 3000

# Bước 8: Chạy server thông qua script "start" trong package.json
CMD ["npm", "start"]