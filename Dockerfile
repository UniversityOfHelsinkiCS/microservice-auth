FROM node:16-slim

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8081

CMD ["npm", "start"]
