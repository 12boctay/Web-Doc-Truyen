# ---- Stage 1: Build ----
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies like typescript)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# ---- Stage 2: Production ----
FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Copy package files and install production-only deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3002

# Start
CMD ["node", "dist/index.js"]
