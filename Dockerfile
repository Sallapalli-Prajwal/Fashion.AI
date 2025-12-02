# OutfitVision Dockerfile for Google Cloud Run
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install && cd ..

# Copy source code
COPY . .

# Build client with production API URL and Google Analytics
# In production, frontend and backend are served from the same origin
ARG VITE_API_URL=""
ARG VITE_GA_MEASUREMENT_ID=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID}
RUN cd client && npm run build && cd ..

# Create necessary directories
RUN mkdir -p logs uploads

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["npm", "start"]

