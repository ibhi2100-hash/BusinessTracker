# Use official Node runtime
FROM node:20-slim


# Create app directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source (includes prisma schema)
COPY . .


# Dockerfile
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma client (explicit schema path)
RUN npx prisma generate --schema=src/infrastructure/postgresql/prisma/schema.prisma

# Build TypeScript
RUN npm run build

# Expose app port
EXPOSE 5000

# Run app
CMD ["node", "dist/app/server.js"]