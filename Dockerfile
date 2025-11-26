# Multi-stage build for production
FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY backend ./backend
COPY frontend ./frontend
COPY bot ./bot
COPY admin ./admin

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/user/profile', (r) => {process.exit(r.statusCode === 401 ? 0 : 1)})"

# Start command
CMD ["npm", "start"]
