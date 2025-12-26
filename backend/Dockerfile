# Base image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of your backend code
#COPY . .

# Expose port (e.g., 5000 for Express)
EXPOSE 5000

# Start in development mode
CMD ["npm", "run", "dev"]
