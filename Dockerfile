FROM node:lts-alpine AS builder

ARG API_CLIENT_ID="UNDEFINED_CLIENT_ID"
ARG API_CLIENT_SECRET="UNDEFINED_CLIENT_SECRET"

ENV API_CLIENT_ID=${API_CLIENT_ID}
ENV API_CLIENT_SECRET=${API_CLIENT_SECRET}

# Create or append to the .env file
RUN echo "API_CLIENT_ID=$API_CLIENT_ID" >> .env && \
    echo "API_CLIENT_SECRET=$API_CLIENT_SECRET" >> .env

COPY package.json .
COPY package-lock.json .
RUN npm ci

RUN apk add --no-cache make

COPY . .
RUN make build

FROM karlsson/deno-file-server
EXPOSE 8000
COPY --from=builder dist/ /usr/app/src
