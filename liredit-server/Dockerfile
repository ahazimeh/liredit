# syntax=docker/dockerfile:1

# FROM node:12.18.1
FROM node:16.14
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

#added build command
RUN npm run build

# CMD [ "node", "server.js" ]
CMD [ "node", "dist/index.js" ]
# USER node added this from node js docker best practices
USER node