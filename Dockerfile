# =====================================
# 1️⃣ Build the Vite app
# =====================================
FROM node:18 AS build

WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# =====================================
# 2️⃣ Generate self-signed SSL and serve with Nginx
# =====================================
FROM nginx:alpine

# Generate self-signed SSL certs for HTTPS
RUN apk add --no-cache openssl && \
    mkdir -p /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/selfsigned.key \
    -out /etc/ssl/certs/selfsigned.crt \
    -subj "/C=US/ST=Demo/L=Demo/O=Demo/OU=Demo/CN=localhost"

# Copy built app from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTPS port
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
