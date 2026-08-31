FROM node:24-slim
WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/queries/package.json ./apps/queries/
# copy package.json of any other workspace packages queries-service depends on

RUN npm install

COPY . .
RUN npm run build --workspace=apps/queries

EXPOSE 3007
CMD ["npm", "run", "start:dev", "--workspace=apps/queries"]   