# Etapa de build
FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.9.1 --activate

# Declaração das variáveis de ambiente para o build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENABLE_HOME
ARG NEXT_PUBLIC_FACEBOOK_APP_ID
ARG NEXT_PUBLIC_FACEBOOK_REDIRECT_URI

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENABLE_HOME=$NEXT_PUBLIC_ENABLE_HOME
ENV NEXT_PUBLIC_FACEBOOK_APP_ID=$NEXT_PUBLIC_FACEBOOK_APP_ID
ENV NEXT_PUBLIC_FACEBOOK_REDIRECT_URI=$NEXT_PUBLIC_FACEBOOK_REDIRECT_URI

COPY package.json yarn.lock .yarnrc.yml ./
COPY . .

RUN yarn install --immutable
RUN yarn build

# Etapa final
FROM node:18-alpine
WORKDIR /app

# Copia apenas os arquivos necessários
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Define as variáveis
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENABLE_HOME=$NEXT_PUBLIC_ENABLE_HOME
ENV NEXT_PUBLIC_FACEBOOK_APP_ID=$NEXT_PUBLIC_FACEBOOK_APP_ID
ENV NEXT_PUBLIC_FACEBOOK_REDIRECT_URI=$NEXT_PUBLIC_FACEBOOK_REDIRECT_URI

ENV PORT=3000

CMD ["node", "server.js"]
