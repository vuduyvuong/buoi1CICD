# Render production image: build React, then serve the SPA and API from Node.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server ./server
COPY --from=build /app/build ./build

ENV NODE_ENV=production
ENV SERVE_STATIC=true
EXPOSE 4000
CMD ["node", "server/start.js"]
