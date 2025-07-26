FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 7038

# Start development server
CMD ["npm", "run", "dev"]