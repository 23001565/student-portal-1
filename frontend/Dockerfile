# Base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite in dev mode
CMD ["npm", "run", "dev"]
