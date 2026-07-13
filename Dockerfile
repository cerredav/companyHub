# API image for Render / Fly / any container host
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# API image only — skip client postinstall patch; rebuild native sqlite binding
RUN npm ci --omit=dev --ignore-scripts && npm rebuild better-sqlite3

COPY server ./server
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=3001
ENV SQLITE_PATH=/var/data/hub.sqlite

EXPOSE 3001

CMD ["node", "server/index.js"]
