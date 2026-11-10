# Build stage: install the workspace, generate the Prisma client, and compile.
FROM node:24-alpine AS builder

WORKDIR /application

RUN apk add --no-cache openssl python3 make g++

COPY . .

RUN npm ci
RUN npm run contracts:build
RUN npm run database:generate --workspace @habit-tracker/server
RUN npm run build --workspace @habit-tracker/server
RUN npm prune --omit=dev

# Runtime stage: only the compiled server, Prisma migrations, and production dependencies.
FROM node:24-alpine AS runtime

WORKDIR /application

ENV NODE_ENVIRONMENT=production

RUN apk add --no-cache openssl

COPY --from=builder /application/package.json ./package.json
COPY --from=builder /application/package-lock.json ./package-lock.json
COPY --from=builder /application/node_modules ./node_modules
COPY --from=builder /application/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=builder /application/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /application/applications/server/package.json ./applications/server/package.json
COPY --from=builder /application/applications/server/dist ./applications/server/dist
COPY --from=builder /application/applications/server/prisma ./applications/server/prisma

EXPOSE 3000

# Migrations run before the process starts so the schema is always current.
CMD ["sh", "-c", "npx prisma migrate deploy --schema applications/server/prisma/schema.prisma && node applications/server/dist/main.js"]
