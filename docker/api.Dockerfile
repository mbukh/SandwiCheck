FROM node:20.17.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN npm install sharp

COPY ./server/ ./server/

# COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait

EXPOSE 5001
CMD ["npm", "run", "start"]