FROM node:18-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY ./dist .

COPY ./prisma/ .

EXPOSE 3000

CMD ["npm", "run", "start"]