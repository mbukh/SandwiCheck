# ---- Build Stage ----
FROM node:18.4.0-bullseye-slim AS build-stage
WORKDIR /app
COPY ./client/package*.json ./
RUN npm install
COPY ./client .
RUN npm run build

FROM node:18.4.0-bullseye-slim AS production-stage
WORKDIR /app
COPY --from=build-stage /app/build ./client/build
COPY ./server/ ./server/
COPY ./package*.json .
RUN npm install
EXPOSE 5000
CMD ["npm", "run", "server"]

# FROM nginx:alpine AS production-stage
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY --from=build-stage /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
