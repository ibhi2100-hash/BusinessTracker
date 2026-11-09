
# ==========================================
# Stage 1: Build Vite frontend
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy monorepo source
COPY . .

# Install workspace dependencies
RUN npm install

# Build frontend workspace
RUN npm run build --workspace=biztru-react


# ==========================================
# Stage 2: Production Nginx server
# ==========================================
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy production frontend build
COPY --from=builder /app/biztru-react/dist /usr/share/nginx/html

# IMPORTANT: Copy custom Nginx config into FINAL image
COPY biztru-react/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
