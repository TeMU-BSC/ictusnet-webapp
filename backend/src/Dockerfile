FROM node:14.16.1-alpine
RUN apk add --update docker
WORKDIR /app
COPY package.json package-lock.json ./

# Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm install
COPY . .