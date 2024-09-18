FROM node:lts-alpine AS builder
COPY package.json .
COPY package-lock.json .
RUN npm ci

RUN apk add --no-cache make

ENV API_CLIENT_ID=$API_CLIENT_ID
ENV API_CLIENT_SECRET=$API_CLIENT_SECRET

RUN echo "Building for client: ${API_CLIENT_ID} ${API_CLIENT_SECRET}"
RUN make build

FROM denoland/deno:distroless-1.46.1
EXPOSE 8000
COPY --from=builder dist/ .
RUN ["deno", "cache", "jsr:@std/http/file-server"]
CMD ["run", "--allow-net", "--allow-read", "jsr:@std/http/file-server"]
