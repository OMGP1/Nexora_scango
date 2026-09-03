FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations (assuming monorepo context)
COPY package.json turbo.json ./
COPY packages/common ./packages/common
COPY services/erp-sync-service ./services/erp-sync-service

RUN npm install

WORKDIR /app/services/erp-sync-service
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/services/erp-sync-service/dist ./dist
COPY --from=builder /app/services/erp-sync-service/node_modules ./node_modules
COPY --from=builder /app/services/erp-sync-service/package.json ./

EXPOSE 3021

CMD ["npm", "run", "start:prod"]
