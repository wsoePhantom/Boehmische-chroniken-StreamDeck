FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN mkdir -p backend plugin
COPY backend/package.json backend/package.json
COPY plugin/package.json plugin/package.json
RUN npm install
COPY backend backend
RUN npm run build -w backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3100 STATS_DATA_FILE=/data/stats.json
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/backend/package.json /app/backend/package.json
COPY --from=build /app/plugin/package.json /app/plugin/package.json
RUN npm install --omit=dev
COPY --from=build /app/backend/dist /app/backend/dist
EXPOSE 3100
CMD ["node", "backend/dist/server.js"]
