FROM node:10 AS build

RUN mkdir -p /usr/build
WORKDIR /usr/build
COPY . .

RUN npm ci
RUN npm run build

FROM node:10-alpine

RUN apk add --no-cache curl

RUN mkdir -p /usr/dist
WORKDIR /usr/dist
COPY --from=build /usr/build/dist ./dist
COPY --from=build /usr/build/node_modules ./node_modules

HEALTHCHECK --interval=10s --timeout=5s \
  CMD curl -f http://localhost:$PORT/healthz || exit 1

CMD ["sh", "-c", "node dist/index.js"]
