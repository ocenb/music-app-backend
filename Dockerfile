FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk update && apk add --no-cache ffmpeg

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/temp /app/temp
COPY --from=builder /app/dist /app/dist

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "start:migrate:prod"]
