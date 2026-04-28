FROM node:24-alpine AS build
WORKDIR /app

ARG VITE_CONTACT_EMAIL=""
ARG VITE_DISCORD_LINK=""
ENV VITE_CONTACT_EMAIL=${VITE_CONTACT_EMAIL}
ENV VITE_DISCORD_LINK=${VITE_DISCORD_LINK}

COPY package*.json ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_DIR=/app/dist

COPY package*.json ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
