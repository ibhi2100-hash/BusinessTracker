# Build the Vite frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy the monorepo
COPY . .

COPY biztru-react/nginx.conf /etc/nginx/conf.d/default.conf

# Install dependencies for all workspaces
RUN npm install

# Build the frontend workspace
RUN npm run build --workspace=biztru-react


# Serve the production frontend
FROM nginx:alpine

COPY --from=builder /app/biztru-react/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]