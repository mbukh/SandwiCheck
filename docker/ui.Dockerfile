FROM node:20.17.0-alpine AS build-stage
WORKDIR /app
COPY ./client/package*.json .
RUN ls -a
RUN npm install
COPY ./client .
# RUN mv -f .env.example .env
RUN npm run build

FROM nginx:alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY ./server/uploads /usr/share/nginx/html/uploads
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
