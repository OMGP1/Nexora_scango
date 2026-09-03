FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY turbo.json ./
COPY packages ./packages
COPY services/loyalty-escrow-service ./services/loyalty-escrow-service

RUN yarn install --frozen-lockfile

WORKDIR /app/services/loyalty-escrow-service
RUN yarn build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/loyalty-escrow-service/package.json ./services/loyalty-escrow-service/
COPY --from=builder /app/services/loyalty-escrow-service/dist ./services/loyalty-escrow-service/dist

WORKDIR /app/services/loyalty-escrow-service

ENV PORT=3019
EXPOSE 3019

CMD ["node", "dist/main.js"]
