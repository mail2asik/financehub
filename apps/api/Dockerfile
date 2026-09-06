# Stage 1: Build the NestJS application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests and install all dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy application source files
COPY . .

# Generate Prisma client and compile TypeScript to JS
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production-only dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# Copy compiled JavaScript code from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Entry point pointing to dist/src/main.js
CMD ["node", "dist/src/main.js"]