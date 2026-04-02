FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3002

# Start
CMD ["node", "dist/index.js"]
