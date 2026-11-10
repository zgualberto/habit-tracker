# Build stage: produce the static client bundle.
FROM node:24-alpine AS builder

WORKDIR /application

COPY . .

RUN npm ci
RUN npm run contracts:build
RUN npm run build --workspace @habit-tracker/client

# Runtime stage: static files served by nginx with an /api reverse proxy.
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /application/applications/client/dist /usr/share/nginx/html

EXPOSE 80
