FROM node:20.17.0-alpine AS production-stage

WORKDIR /app

COPY ./package*.json .
RUN npm install

COPY ./server/ ./server/

# COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait

EXPOSE 5001
CMD ["npm", "run", "start"]
