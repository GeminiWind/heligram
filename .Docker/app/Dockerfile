FROM node:8.16.0-jessie

WORKDIR /usr/src/app

EXPOSE 3000

RUN npm install -g yarn

RUN yarn

CMD [ "yarn", "start" ]