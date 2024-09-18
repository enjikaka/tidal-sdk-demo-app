FROM node:lts-alpine AS builder
ADD . .
RUN apk add --no-cache make
RUN npm ci
RUN API_CLIENT_ID=$API_CLIENT_ID API_CLIENT_SECRET=$API_CLIENT_SECRET make build

FROM denoland/deno:distroless-1.46.1
EXPOSE 8000
COPY --from=builder dist/ .
RUN ["deno", "cache", "jsr:@std/http/file-server"]
CMD ["run", "--allow-net", "--allow-read", "jsr:@std/http/file-server"]
