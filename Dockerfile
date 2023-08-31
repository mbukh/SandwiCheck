# ---- Build Stage ----
FROM node:18.4.0-bullseye-slim AS build-stage
WORKDIR /app
COPY ./client/package*.json .
RUN ls -a
RUN npm install
COPY ./client .
# RUN mv -f .env.example .env
RUN npm run build

# FROM node:18.4.0-bullseye-slim AS production-stage
# WORKDIR /app
# COPY ./package*.json .
# RUN npm install
# COPY --from=build-stage /app/build ./client/build
# COPY ./server/ ./server/
# RUN mv -f ./server/config/config.env.example ./server/config/config.env
# ## Add the wait script to the image
# COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait
# EXPOSE 5000
# CMD ["npm", "run", "server"]


FROM nginx:alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY ./server/uploads /usr/share/nginx/html/uploads
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
