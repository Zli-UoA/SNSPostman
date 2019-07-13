FROM node:10

WORKDIR /node/src/app
ADD ./dist/main.js /node/src/app

CMD [ "node", "main.js" ]
