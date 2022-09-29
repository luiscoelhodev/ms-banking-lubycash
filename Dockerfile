FROM node:18-alpine

WORKDIR /usr/app

COPY package*.json ./

COPY ./dist .

COPY ./prisma .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]