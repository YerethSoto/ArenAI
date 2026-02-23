# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY cert ./cert

# Cloud Run expects the container to listen on port 8080 by default, 
# or the port specified by the PORT environment variable.
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
