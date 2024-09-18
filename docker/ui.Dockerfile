# Build stage
FROM node:20.17.0-alpine AS build-stage

# Define build arguments
ARG REACT_APP_HOST
ARG REACT_APP_API_SERVER
ARG REACT_APP_PATH

WORKDIR /app
COPY ./client/package*.json .

RUN npm install

COPY ./client .

# Set environment variables for the build process
ENV REACT_APP_HOST=${REACT_APP_HOST}
ENV REACT_APP_API_SERVER=${REACT_APP_API_SERVER}
ENV REACT_APP_ENV=production

RUN npm run build

# Production stage
FROM nginx:alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/build /usr/share/nginx/html

COPY ./client/nginx/default.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]