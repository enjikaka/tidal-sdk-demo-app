FROM node:lts-alpine AS builder

ARG API_CLIENT_ID="UNDEFINED_CLIENT_ID"
ARG API_CLIENT_SECRET="UNDEFINED_CLIENT_SECRET"

ENV API_CLIENT_ID=${API_CLIENT_ID}
ENV API_CLIENT_SECRET=${API_CLIENT_SECRET}

COPY package.json .
COPY package-lock.json .
RUN npm ci

RUN apk add --no-cache make

RUN echo "Building for client: ${API_CLIENT_ID} ${API_CLIENT_SECRET}"
RUN make build

FROM denoland/deno:distroless-1.46.1
EXPOSE 8000
COPY --from=builder dist/ .
RUN ["deno", "cache", "jsr:@std/http/file-server"]
CMD ["run", "--allow-net", "--allow-read", "jsr:@std/http/file-server"]
