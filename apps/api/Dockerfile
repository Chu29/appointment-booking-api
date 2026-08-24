FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy application source code
COPY . .

# Expose server port
EXPOSE 3000

# Start development server with live-reloading
CMD ["pnpm", "run", "dev"]
